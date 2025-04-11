use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::path::PathBuf;

use async_recursion::async_recursion;
use minijinja::{syntax::SyntaxConfig, Environment};
use owo_colors::OwoColorize;
use tokio::io::{stdout, AsyncWriteExt};
use tokio_stream::StreamExt;

use ollama_rs::{
    generation::{
        chat::{request::ChatMessageRequest, ChatMessage, ChatMessageResponse, MessageRole},
        tools::{ToolFunctionInfo, ToolInfo, ToolType},
    },
    models::ModelOptions,
    Ollama,
};

use serde_json::{from_str, json, to_string, Value};
use serde_norway::{from_reader, from_str as from_yaml_str};

use crate::pdl::ast::{
    ArrayBlock, CallBlock, Closure, DataBlock, EmptyBlock, FunctionBlock, IfBlock, ImportBlock,
    IncludeBlock, ListOrString, MessageBlock, ModelBlock, ObjectBlock, PdlBlock, PdlParser,
    PdlResult, PdlUsage, PythonCodeBlock, ReadBlock, RepeatBlock, Role, Scope, SequencingBlock,
    StringOrBoolean, StringOrNull,
};

type Messages = Vec<ChatMessage>;
type ThreadSafeError = dyn Error + Send + Sync;
type PdlError = Box<ThreadSafeError>;
type Interpretation = Result<(PdlResult, Messages, PdlBlock), PdlError>;
type InterpretationSync = Result<(PdlResult, Messages, PdlBlock), Box<dyn Error>>;

pub struct RunOptions<'a> {
    pub stream: bool,
    pub debug: bool,
    pub trace: Option<&'a str>,
}

impl<'a> Default for RunOptions<'a> {
    fn default() -> Self {
        Self {
            stream: true,
            debug: false,
            trace: None,
        }
    }
}

#[derive(Clone)]
struct State {
    emit: bool,
    cwd: PathBuf,
    scope: Scope,
    escaped_variables: Vec<String>,
    messages: Messages,
}

impl State {
    fn new(initial_scope: Scope) -> Self {
        Self {
            emit: true,
            cwd: ::std::env::current_dir().unwrap_or(PathBuf::from("/")),
            scope: initial_scope,
            escaped_variables: vec![],
            messages: vec![],
        }
    }

    fn with_cwd(&self, cwd: PathBuf) -> Self {
        let mut s = self.clone();
        s.cwd = cwd;
        s
    }

    fn with_emit(&self, emit: bool) -> Self {
        let mut s = self.clone();
        s.emit = emit;
        s
    }

    fn extend_scope(&self, scopes: Vec<Scope>) -> Self {
        let mut s = self.clone();
        scopes.into_iter().for_each(|m| s.scope.extend(m));
        s
    }
}

struct Interpreter<'a> {
    // batch: u32,
    // id_stack: Vec<String>,
    options: RunOptions<'a>,
    jinja_env: Environment<'a>,
}

impl<'a> Interpreter<'a> {
    fn new(options: RunOptions<'a>) -> Self {
        let mut jinja_env = Environment::new();
        // PDL uses custom variable delimeters, because {{ }} have pre-defined meaning in yaml
        jinja_env.set_syntax(
            SyntaxConfig::builder()
                .variable_delimiters("${", "}")
                .build()
                .unwrap(),
        );

        Self {
            // batch: 0,
            // id_stack: vec![],
            jinja_env: jinja_env,
            options: options,
        }
    }

    async fn _run_with_state(
        &mut self,
        program: &PdlBlock,
        state: &mut State,
        parent_scope: &mut Scope,
    ) -> Interpretation {
        let (result, messages, trace) = match program {
            PdlBlock::Bool(b) => Ok((
                b.into(),
                vec![ChatMessage::user(format!("{b}"))],
                PdlBlock::Bool(b.clone()),
            )),
            PdlBlock::Number(n) => Ok((
                n.clone().into(),
                vec![ChatMessage::user(format!("{n}"))],
                PdlBlock::Number(n.clone()),
            )),
            PdlBlock::Function(f) => Ok((
                PdlResult::Closure(self.closure(&f, state)),
                vec![],
                PdlBlock::Function(f.clone()),
            )),
            PdlBlock::String(s) => self.run_string(s, state).await,
            PdlBlock::Call(block) => self.run_call(block, state).await,
            PdlBlock::Empty(block) => self.run_empty(block, state).await,
            PdlBlock::If(block) => self.run_if(block, state).await,
            PdlBlock::Import(block) => self.run_import(block, state).await,
            PdlBlock::Include(block) => self.run_include(block, state).await,
            PdlBlock::Model(block) => self.run_model(block, state).await,
            PdlBlock::Data(block) => self.run_data(block, state).await,
            PdlBlock::Object(block) => self.run_object(block, state).await,
            PdlBlock::PythonCode(block) => self.run_python_code(block, state).await,
            PdlBlock::Read(block) => self.run_read(block, state).await,
            PdlBlock::Repeat(block) => self.run_repeat(block, state).await,
            PdlBlock::LastOf(block) => self.run_sequence(block, state).await,
            PdlBlock::Text(block) => self.run_sequence(block, state).await,
            PdlBlock::Array(block) => self.run_array(block, state).await,
            PdlBlock::Message(block) => self.run_message(block, state).await,
        }?;

        if match program {
            PdlBlock::Message(_)
            | PdlBlock::Text(_)
            | PdlBlock::Import(_)
            | PdlBlock::Include(_)
            | PdlBlock::LastOf(_)
            | PdlBlock::Call(_)
            | PdlBlock::Model(_) => false,
            _ => state.emit,
        } {
            println!("{}", pretty_print(&messages));
        }

        // copy any escaped variable bindings to the parent scope
        parent_scope.extend(
            state
                .escaped_variables
                .iter()
                .filter_map(|variable| state.scope.remove_entry(&variable.clone())),
        );

        Ok((result, messages, trace))
    }

    #[async_recursion]
    async fn run_quiet(&mut self, program: &PdlBlock, state: &mut State) -> Interpretation {
        self._run_with_state(program, &mut state.with_emit(false), &mut state.scope)
            .await
    }

    #[async_recursion]
    async fn run(&mut self, program: &PdlBlock, state: &mut State) -> Interpretation {
        self._run_with_state(program, &mut state.with_emit(true), &mut state.scope)
            .await
    }

    /// Evaluate String as a Jinja2 expression
    fn eval(&self, expr: &String, state: &State) -> Result<PdlResult, PdlError> {
        let result = self.jinja_env.render_str(expr.as_str(), &state.scope)?;
        if self.options.debug {
            eprintln!("Eval {} -> {} with scope {:?}", expr, result, state.scope);
        }

        let backup = result.clone();
        Ok(from_str(&result).unwrap_or_else(|err| {
            if self.options.debug {
                eprintln!("Treating as plain string {}", result);
                eprintln!("... due to {}", err);
            }
            backup.into()
        }))
    }

    /// Evaluate String as a Jinja2 expression, expecting a string in response
    fn eval_to_string(&self, expr: &String, state: &State) -> Result<String, PdlError> {
        match self.eval(expr, state)? {
            PdlResult::String(s) => Ok(s),
            x => Err(Box::from(format!(
                "Expression {expr} evaluated to non-string {:?}",
                x
            ))),
        }
    }

    /// Traverse the given JSON Value, applying `self.eval()` to the value elements within.
    fn eval_json(&self, expr: &Value, state: &State) -> Result<PdlResult, PdlError> {
        match expr {
            Value::Null => Ok("".into()),
            Value::Bool(b) => Ok(PdlResult::Bool(*b)),
            Value::Number(n) => Ok(PdlResult::Number(n.clone())),
            Value::String(s) => self.eval(s, state),
            Value::Array(a) => Ok(PdlResult::List(
                a.iter()
                    .map(|v| self.eval_json(v, state))
                    .collect::<Result<_, _>>()?,
            )),
            Value::Object(o) => Ok(PdlResult::Dict(
                o.iter()
                    .map(|(k, v)| match self.eval_json(v, state) {
                        Ok(v) => Ok((k.clone(), v)),
                        Err(e) => Err(e),
                    })
                    .collect::<Result<_, _>>()?,
            )),
        }
    }

    /// Evaluate an string or list of Values into a list of Values
    fn eval_list_or_string(
        &self,
        expr: &ListOrString,
        state: &State,
    ) -> Result<Vec<PdlResult>, PdlError> {
        match expr {
            ListOrString::String(s) => match self.eval(s, state)? {
                PdlResult::List(a) => Ok(a),
                x => Err(Box::from(format!(
                    "Jinja string expanded to non-list. {} -> {:?}",
                    s, x
                ))),
            },
            ListOrString::List(l) => l.iter().map(|v| self.eval_json(v, state)).collect(),
        }
    }

    /// Create a closure for the given function `f`
    fn closure(&self, f: &FunctionBlock, state: &State) -> Closure {
        Closure {
            function: f.clone(),
            scope: state.scope.clone(),
        }
    }

    /// Run a PdlBlock::String
    async fn run_string(&self, msg: &String, state: &State) -> Interpretation {
        let trace = self.eval(msg, state)?;
        if self.options.debug {
            eprintln!("String {} -> {:?}", msg, trace);
        }

        let result_string = match &trace {
            PdlResult::String(s) => s.clone(),
            x => to_string(&x)?,
        };
        let messages = vec![ChatMessage::user(result_string)];

        Ok((trace, messages, PdlBlock::String(msg.clone())))
    }

    /// If `file_path` is not absolute, join it with state.cwd
    fn path_to(&self, file_path: &String, state: &State) -> PathBuf {
        let mut path = state.cwd.clone();
        path.push(file_path);
        if path.extension().is_none() {
            path.with_extension("pdl")
        } else {
            path
        }
    }

    fn def(
        &mut self,
        variable: &Option<String>,
        value: &PdlResult,
        parser: &Option<PdlParser>,
        state: &mut State,
        escape: bool,
    ) -> Result<PdlResult, PdlError> {
        let result = if let Some(parser) = parser {
            if let PdlResult::String(s) = value {
                self.parse_result(parser, s)
            } else {
                Err(Box::from(format!(
                    "Cannot parse as {:?} a non-string value {:?}",
                    parser, value
                )))
            }
        } else {
            //self.eval_json(value)
            Ok(value.clone())
        }?;

        if let Some(def) = &variable {
            if self.options.debug {
                eprintln!("Def {} -> {}", def, result);
            }
            state.scope.insert(def.clone(), result.clone());

            // then we want this binding to escape to the parent scope
            if escape {
                state.escaped_variables.push(def.clone());
            }
        }

        Ok(result)
    }

    /// Run a PdlBlock::Read
    async fn run_read(&mut self, block: &ReadBlock, state: &mut State) -> Interpretation {
        let trace = block.clone();

        match (&block.read, &block.message) {
            (StringOrNull::String(_), None) => {} // read from file and no explicit message... then don't print a message
            _ => {
                println!(
                    "{}",
                    match (&block.message, block.multiline) {
                        (Some(message), _) => message.as_str(),
                        (None, Some(true)) => "Enter/Paste your content. Ctrl-D to save it.",
                        _ => "How can i help you?",
                    }
                );
            }
        }

        let buffer = match &block.read {
            StringOrNull::String(file_path) => {
                ::std::fs::read_to_string(self.path_to(file_path, state))?
            }
            StringOrNull::Null => {
                let mut buffer = String::new();
                let mut bytes_read = ::std::io::stdin().read_line(&mut buffer)?;
                if let Some(true) = block.multiline {
                    while bytes_read > 0 {
                        bytes_read = ::std::io::stdin().read_line(&mut buffer)?;
                    }
                }
                buffer
            }
        };

        let result = self.def(
            &block.metadata.as_ref().and_then(|m| m.def.clone()),
            &buffer.clone().into(),
            &block.parser,
            state,
            true,
        )?;

        Ok((
            result,
            vec![ChatMessage::user(buffer)],
            PdlBlock::Read(trace),
        ))
    }

    /// Run a PdlBlock::Call
    async fn run_call(&mut self, block: &CallBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Call {:?}({:?})", block.call, block.args);
            eprintln!("Call scope {:?}", state.scope);
        }

        match self.eval(&block.call, state)? {
            PdlResult::Closure(c) => {
                let mut new_state = match &block.args {
                    None => Ok(state.clone()),
                    Some(args) => match self.eval_json(args, state)? {
                        PdlResult::Dict(m) => Ok(state.extend_scope(vec![m, c.scope])),
                        x => Err(PdlError::from(format!("Call arguments not a map: {:?}", x))),
                    },
                }?;

                self.run(&c.function.return_, &mut new_state).await
            }
            x => Err(Box::from(format!(
                "call of non-function {:?}->{:?}",
                block.call, x
            ))),
        }
    }

    /// Run a PdlBlock::Empty
    async fn run_empty(&mut self, block: &EmptyBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Empty");
        }

        self.process_defs(&Some(block.defs.clone()), state).await?;

        let trace = block.clone();
        Ok((
            PdlResult::Dict(state.scope.clone()),
            vec![],
            PdlBlock::Empty(trace),
        ))
    }

    /// Run a PdlBlock::Call
    async fn run_if(&mut self, block: &IfBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("If {:?}({:?})", block.condition, block.then);
        }

        if let Some(meta) = &block.metadata {
            self.process_defs(&meta.defs, state).await?;
        }

        let cond = match &block.condition {
            StringOrBoolean::Boolean(b) => PdlResult::Bool(*b),
            StringOrBoolean::String(s) => self.eval(s, state)?,
        };

        match cond {
            PdlResult::Bool(true) => self.run_quiet(&block.then, state).await,
            PdlResult::Bool(false) => match &block.else_ {
                Some(else_block) => self.run_quiet(&else_block, state).await,
                None => Ok(("".into(), vec![], PdlBlock::If(block.clone()))),
            },
            x => Err(Box::from(format!(
                "if block condition evaluated to non-boolean value: {:?}",
                x
            ))),
        }
    }

    /// Run a PdlBlock::Include
    async fn run_include(&mut self, block: &IncludeBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Include {:?}", block.include);
        }

        let path = self.path_to(&block.include, state);
        let mut new_state = if let Some(cwd) = path.parent() {
            state.with_cwd(cwd.to_path_buf())
        } else {
            state.clone()
        };

        self.run(&parse_file(&path)?, &mut new_state).await
    }

    /// Run a PdlBlock::Import
    async fn run_import(&mut self, block: &ImportBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Import {:?}", block.import);
        }

        let path = self.path_to(&block.import, state);
        let mut new_state = if let Some(cwd) = path.parent() {
            state.with_cwd(cwd.to_path_buf())
        } else {
            state.clone()
        };

        self.run(&parse_file(&path)?, &mut new_state).await
    }

    fn to_ollama_model_options(
        &self,
        maybe_parameters: &Option<HashMap<String, Value>>,
    ) -> (ModelOptions, Vec<ToolInfo>) {
        // for some reason temp=0 isn't the default
        let options = ModelOptions::default().temperature(0.0);

        if let Some(parameters) = maybe_parameters {
            let temp = if let Some(Value::Number(num)) = parameters.get(&"temperature".to_string())
            {
                if let Some(temp) = num.as_f64() {
                    temp as f32
                } else if let Some(temp) = num.as_i64() {
                    temp as f32
                } else {
                    0.0
                }
            } else {
                0.0
            };

            let tools = if let Some(Value::Array(tools)) = parameters.get("tools") {
                tools
                    .into_iter()
                    .filter_map(|tool| tool.get("function"))
                    .filter_map(|tool| {
                        //from_str(&to_string(tool)?)
                        match (
                            tool.get("name"),
                            tool.get("description"),
                            tool.get("parameters"),
                        ) {
                            (
                                Some(Value::String(name)),
                                Some(Value::String(description)),
                                Some(Value::Object(parameters)),
                            ) => Some(ToolInfo {
                                tool_type: ToolType::Function,
                                function: ToolFunctionInfo {
                                    name: name.to_string(),
                                    description: description.to_string(),
                                    parameters: schemars::schema_for_value!(parameters),
                                },
                            }),
                            _ => {
                                eprintln!("Error: tools do not satisfy schema {:?}", tool);
                                None
                            }
                        }
                    })
                    .collect()
            } else {
                vec![]
            };

            (options.temperature(temp), tools)
        } else {
            (options, vec![])
        }
    }

    /// Run a PdlBlock::PythonCode
    async fn run_python_code(
        &mut self,
        block: &PythonCodeBlock,
        _state: &mut State,
    ) -> Interpretation {
        use rustpython_vm as vm;
        let interp = vm::Interpreter::with_init(vm::Settings::default(), |vm| {
            vm.add_native_modules(rustpython_stdlib::get_module_inits());
        });
        interp.enter(|vm| -> Interpretation {
            let scope = vm.new_scope_with_builtins();

            // TODO vm.new_syntax_error(&err, Some(block.code.as_str()))
            let code_obj = match vm.compile(
                block.code.as_str(),
                vm::compiler::Mode::Exec,
                "<embedded>".to_owned(),
            ) {
                Ok(x) => Ok(x),
                Err(exc) => Err(PdlError::from(format!(
                    "Syntax error in Python code {:?}",
                    exc
                ))),
            }?;

            // TODO vm.print_exception(exc);
            match vm.run_code_obj(code_obj, scope.clone()) {
                Ok(_) => Ok(()),
                Err(exc) => {
                    vm.print_exception(exc);
                    Err(PdlError::from("Error executing Python code"))
                }
            }?;

            match scope.globals.get_item("result", vm) {
                Ok(result) => {
                    let result_string = match result.str(vm) {
                        Ok(x) => Ok(x),
                        Err(exc) => {
                            vm.print_exception(exc);
                            Err(PdlError::from("Unable to stringify Python 'result' value"))
                        }
                    }?;
                    let messages = vec![ChatMessage::user(result_string.as_str().to_string())];
                    let trace = PdlBlock::PythonCode(block.clone());
                    Ok((messages[0].content.clone().into(), messages, trace))
                }
                Err(_) => Err(Box::from(
                    "Python code block failed to assign a 'result' variable",
                )),
            }
        })
    }

    /// Run a PdlBlock::Model
    async fn run_model(&mut self, block: &ModelBlock, state: &mut State) -> Interpretation {
        match &block.model {
            pdl_model
                if pdl_model.starts_with("ollama/") || pdl_model.starts_with("ollama_chat/") =>
            {
                let mut ollama = Ollama::default();
                let model = if pdl_model.starts_with("ollama/") {
                    &pdl_model[7..]
                } else {
                    &pdl_model[12..]
                };

                let (options, tools) = self.to_ollama_model_options(&block.parameters);
                if self.options.debug {
                    eprintln!("Model options {:?} {:?}", block.description, options);
                    eprintln!("Model tools {:?} {:?}", block.description, tools);
                }

                // The input messages to the model is either:
                // a) block.input, if given
                // b) the current state's accumulated messages
                let input_messages = match &block.input {
                    Some(input) => {
                        // TODO ignoring result, trace
                        let (_result, messages, _trace) = self.run_quiet(&*input, state).await?;
                        messages
                    }
                    None => state.messages.clone(),
                };
                let (prompt, history_slice): (&ChatMessage, &[ChatMessage]) =
                    match input_messages.split_last() {
                        Some(x) => x,
                        None => (&ChatMessage::user("".into()), &[]),
                    };
                let mut history = Vec::from(history_slice);
                if self.options.debug {
                    eprintln!(
                        "Ollama {:?} model={:?} prompt={:?} history={:?}",
                        block.description.clone().unwrap_or("".into()),
                        block.model,
                        prompt,
                        history
                    );
                }

                //if state.emit {
                //println!("{}", pretty_print(&input_messages));
                //}

                let req = ChatMessageRequest::new(model.into(), vec![prompt.clone()])
                    .options(options)
                    .tools(tools);

                let (last_res, response_string) = if !self.options.stream {
                    let res = ollama
                        .send_chat_messages_with_history(&mut history, req)
                        .await?;
                    let response_string = res.message.content.clone();
                    print!("{}", response_string);
                    (Some(res), response_string)
                } else {
                    let mut stream = ollama
                        .send_chat_messages_with_history_stream(
                            ::std::sync::Arc::new(::std::sync::Mutex::new(history)),
                            req,
                            //ollama.generate(GenerationRequest::new(model.into(), prompt),
                        )
                        .await?;
                    // dbg!("Model result {:?}", &res);

                    let emit = if let Some(_) = &block.model_response {
                        false
                    } else {
                        true
                    };

                    let mut last_res: Option<ChatMessageResponse> = None;
                    let mut response_string = String::new();
                    let mut stdout = stdout();
                    if emit {
                        stdout.write_all(b"\x1b[1mAssistant: \x1b[0m").await?;
                    }
                    while let Some(Ok(res)) = stream.next().await {
                        if emit {
                            stdout.write_all(b"\x1b[32m").await?; // green
                            stdout.write_all(res.message.content.as_bytes()).await?;
                            stdout.flush().await?;
                            stdout.write_all(b"\x1b[0m").await?; // reset color
                        }
                        response_string += res.message.content.as_str();
                        last_res = Some(res);
                    }
                    if emit {
                        stdout.write_all(b"\n").await?;
                    }

                    (last_res, response_string)
                };

                if let Some(_) = &block.model_response {
                    if let Some(ref res) = last_res {
                        self.def(
                            &block.model_response,
                            &resultify_as_litellm(&from_str(&to_string(&res)?)?),
                            &None,
                            state,
                            true,
                        )?;
                    }
                }

                let mut trace = block.clone();
                trace.pdl_result = Some(response_string.clone());

                if let Some(res) = last_res {
                    if let Some(usage) = res.final_data {
                        trace.pdl_usage = Some(PdlUsage {
                            prompt_tokens: usage.prompt_eval_count,
                            prompt_nanos: usage.prompt_eval_duration,
                            completion_tokens: usage.eval_count,
                            completion_nanos: usage.eval_duration,
                        });
                    }
                    let output_messages = vec![ChatMessage::assistant(response_string)];
                    Ok((
                        res.message.content.into(),
                        output_messages,
                        PdlBlock::Model(trace),
                    ))
                } else {
                    // nothing came out of the model
                    Ok(("".into(), vec![], PdlBlock::Model(trace)))
                }
                // dbg!(history);
            }
            _ => Err(Box::from(format!("Unsupported model {}", block.model))),
        }
    }

    /// Run a PdlBlock::Data
    async fn run_data(&mut self, block: &DataBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Data raw={:?} {:?}", block.raw, block.data);
        }

        let mut trace = block.clone();
        if let Some(true) = block.raw {
            let result = self.def(
                &block.metadata.as_ref().and_then(|m| m.def.clone()),
                &resultify(&block.data),
                &block.parser,
                state,
                true,
            )?;
            Ok((result, vec![], PdlBlock::Data(trace)))
        } else {
            let result = self.def(
                &block.metadata.as_ref().and_then(|m| m.def.clone()),
                &self.eval_json(&block.data, state)?,
                &block.parser,
                state,
                true,
            )?;
            trace.data = from_str(to_string(&result)?.as_str())?;
            Ok((result, vec![], PdlBlock::Data(trace)))
        }
    }

    async fn run_object(&mut self, block: &ObjectBlock, state: &mut State) -> Interpretation {
        if self.options.debug {
            eprintln!("Object {:?}", block.object);
        }

        let mut messages = vec![];
        let mut result_map = HashMap::new();
        let mut trace_map = HashMap::new();

        let mut iter = block.object.iter();
        while let Some((k, v)) = iter.next() {
            let (this_result, this_messages, this_trace) = self.run_quiet(v, state).await?;
            messages.extend(this_messages);
            result_map.insert(k.clone(), this_result);
            trace_map.insert(k.clone(), this_trace);
        }

        Ok((
            PdlResult::Dict(result_map),
            messages,
            PdlBlock::Object(ObjectBlock { object: trace_map }),
        ))
    }

    /// Run a PdlBlock::Repeat
    async fn run_repeat(&mut self, block: &RepeatBlock, state: &mut State) -> Interpretation {
        // { i:[1,2,3], j: [4,5,6]} -> ([i,j], [[1,2,3],[4,5,6]])
        //        let (variables, values): (Vec<_>, Vec<Vec<_>>) = block
        //            .into_iter()
        //            .unzip();
        let iter_scopes = block
            .for_
            .iter()
            .map(
                |(var, values)| match self.eval_list_or_string(values, state) {
                    Ok(value) => Ok((var.clone(), value)),
                    Err(e) => Err(e),
                },
            )
            .collect::<Result<HashMap<_, _>, _>>()?;

        if self.options.debug {
            eprintln!("Repeat {:?}", iter_scopes);
        }

        let mut results = vec![];
        let mut messages = vec![];
        let mut trace = vec![];
        let mut iter_state = state.clone();
        if let Some(n) = iter_scopes.iter().map(|(_, v)| v.len()).min() {
            for iter in 0..n {
                let this_iter_scope = iter_scopes
                    .iter()
                    .map(|(k, v)| (k.clone(), v[iter].clone()))
                    .collect();
                iter_state = iter_state.extend_scope(vec![this_iter_scope]);
                let (result, ms, t) = self.run_quiet(&block.repeat, &mut iter_state).await?;
                results.push(result);
                messages.extend(ms);
                trace.push(t);
                //self.pop_scope();
            }
        }

        Ok((
            PdlResult::List(results),
            messages,
            PdlBlock::Repeat(block.clone()),
        ))
    }

    fn to_ollama_role(&self, role: &Role) -> MessageRole {
        match role {
            Role::User => MessageRole::User,
            Role::Assistant => MessageRole::Assistant,
            Role::System => MessageRole::System,
            Role::Tool => MessageRole::Tool,
        }
    }

    fn parse_result(&self, parser: &PdlParser, result: &String) -> Result<PdlResult, PdlError> {
        match parser {
            PdlParser::Json => from_str(result).map_err(|e| Box::from(e)),
            PdlParser::Yaml => from_yaml_str(result).map_err(|e| Box::from(e)),
        }
    }

    async fn process_defs(
        &mut self,
        defs: &Option<indexmap::IndexMap<String, PdlBlock>>,
        state: &mut State,
    ) -> Result<(), PdlError> {
        // in pdl, blocks are not a lexical scope. strange, but true
        //let mut new_state = state.clone();

        if let Some(defs) = defs {
            let mut iter = defs.iter();
            while let Some((var, def)) = iter.next() {
                let (result, _, _) = self.run_quiet(def, state).await?;
                let escape = false; // ?? do we want pdl defs to escape to the parent scope? lexical scoping would say no
                let _ = self.def(&Some(var.clone()), &result, &None, state, escape);
            }
        }

        Ok(())
    }

    /// Run a sequencing block (e.g. TextBlock, LastOfBlock)
    async fn run_sequence(
        &mut self,
        block: &impl SequencingBlock,
        state: &mut State,
    ) -> Interpretation {
        if self.options.debug {
            let description = if let Some(d) = block.description() {
                d
            } else {
                &"<no description>".to_string()
            };
            eprintln!("{} {description}", block.kind());
        }

        let mut output_results = vec![];
        let mut output_messages = vec![];
        let mut output_blocks = vec![];

        if let Some(meta) = block.metadata() {
            self.process_defs(&meta.defs, state).await?;
        }

        // here is where we iterate over the sequence items
        let mut iter = block.items().iter();
        while let Some(block) = iter.next() {
            // run each element of the Text block
            let (this_result, this_messages, trace) = self.run(&block, state).await?;

            state.messages.extend(this_messages.iter().cloned());

            output_results.push(this_result);
            output_messages.extend(this_messages.iter().cloned());
            output_blocks.push(trace);
        }

        // self.scope.pop();

        let trace = block.with_items(output_blocks);
        let result = self.def(
            &block.metadata().as_ref().and_then(|m| m.def.clone()),
            &trace.result_for(output_results),
            trace.parser(),
            state,
            true,
        )?;
        let result_messages = trace.messages_for::<ChatMessage>(&output_messages);
        Ok((
            result,
            match block.role() {
                Some(role) => result_messages
                    .into_iter()
                    .map(|m| ChatMessage::new(self.to_ollama_role(role), m.content))
                    .collect(),
                None => result_messages,
            },
            trace.to_block(),
        ))
    }

    /// Run a PdlBlock::Array
    async fn run_array(&mut self, block: &ArrayBlock, state: &mut State) -> Interpretation {
        let mut result_items = vec![];
        let mut all_messages = vec![];
        let mut trace_items = vec![];

        let mut iter = block.array.iter();
        while let Some(item) = iter.next() {
            // TODO accumulate messages
            let (result, messages, trace) = self.run_quiet(item, state).await?;
            result_items.push(result);
            all_messages.extend(messages);
            trace_items.push(trace);
        }

        Ok((
            PdlResult::List(result_items),
            all_messages,
            PdlBlock::Array(ArrayBlock { array: trace_items }),
        ))
    }

    /// Run a PdlBlock::Message
    async fn run_message(&mut self, block: &MessageBlock, state: &mut State) -> Interpretation {
        let (content_result, content_messages, content_trace) =
            self.run(&block.content, state).await?;
        let name = if let Some(name) = &block.name {
            Some(self.eval_to_string(&name, state)?)
        } else {
            None
        };
        let tool_call_id = if let Some(tool_call_id) = &block.tool_call_id {
            Some(self.eval_to_string(&tool_call_id, state)?)
        } else {
            None
        };

        let mut dict: HashMap<String, PdlResult> = HashMap::new();
        dict.insert("role".into(), PdlResult::String(to_string(&block.role)?));
        dict.insert("content".into(), content_result);
        if let Some(name) = &name {
            dict.insert("name".into(), PdlResult::String(name.clone()));
        }
        if let Some(tool_call_id) = &tool_call_id {
            dict.insert(
                "tool_call_id".into(),
                PdlResult::String(tool_call_id.clone()),
            );
        }

        Ok((
            PdlResult::Dict(dict),
            content_messages
                .into_iter()
                .map(|m| ChatMessage::new(self.to_ollama_role(&block.role), m.content))
                .collect(),
            PdlBlock::Message(MessageBlock {
                role: block.role.clone(),
                content: Box::new(content_trace),
                description: block.description.clone(),
                name: name,
                tool_call_id: tool_call_id,
            }),
        ))
    }
}

pub async fn run<'a>(
    program: &PdlBlock,
    cwd: Option<PathBuf>,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> Interpretation {
    crate::pdl::pull::pull_if_needed(&program).await?;

    let mut interpreter = Interpreter::new(options);
    let mut state = State::new(initial_scope);
    if let Some(cwd) = cwd {
        state.cwd = cwd
    }
    interpreter.run(&program, &mut state).await
}

#[allow(dead_code)]
pub fn run_sync<'a>(
    program: &PdlBlock,
    cwd: Option<PathBuf>,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> InterpretationSync {
    tauri::async_runtime::block_on(run(program, cwd, options, initial_scope))
        .map_err(|err| Box::<dyn Error>::from(err.to_string()))
}

/// Read in a file from disk and parse it as a PDL program
pub fn parse_file(path: &PathBuf) -> Result<PdlBlock, PdlError> {
    from_reader(::std::fs::File::open(path)?).map_err(|err| PdlError::from(err.to_string()))
}

pub async fn run_file<'a>(
    source_file_path: &str,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> Interpretation {
    let path = PathBuf::from(source_file_path);
    let cwd = path.parent().and_then(|cwd| Some(cwd.to_path_buf()));
    let program = parse_file(&path)?;

    run(&program, cwd, options, initial_scope).await
}

pub fn run_file_sync<'a>(
    source_file_path: &str,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> InterpretationSync {
    tauri::async_runtime::block_on(run_file(source_file_path, options, initial_scope))
        .map_err(|err| Box::<dyn Error>::from(err.to_string()))
}

pub async fn run_string<'a>(
    source: &str,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> Interpretation {
    run(&from_yaml_str(source)?, None, options, initial_scope).await
}

#[allow(dead_code)]
pub async fn run_json<'a>(
    source: Value,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> Interpretation {
    run_string(&to_string(&source)?, options, initial_scope).await
}

#[allow(dead_code)]
pub fn run_json_sync<'a>(
    source: Value,
    options: RunOptions<'a>,
    initial_scope: Scope,
) -> InterpretationSync {
    tauri::async_runtime::block_on(run_json(source, options, initial_scope))
        .map_err(|err| Box::<dyn Error>::from(err.to_string()))
}

pub fn pretty_print(messages: &Vec<ChatMessage>) -> String {
    messages
        .into_iter()
        .map(
            |ChatMessage {
                 role: r,
                 content: c,
                 ..
             }| {
                format!(
                    "{:?}: {}",
                    r.bold(),
                    match r {
                        MessageRole::Assistant => c.green().to_string(),
                        MessageRole::System => c.cyan().to_string(),
                        MessageRole::Tool => c.magenta().to_string(),
                        _ => c.to_string(),
                    }
                )
            },
        )
        .collect::<Vec<_>>()
        .join("\n")
}

/// Transform a JSON Value into a PdlResult object
fn resultify(value: &Value) -> PdlResult {
    match value {
        Value::Null => "".into(),
        Value::Bool(b) => b.into(),
        Value::Number(n) => n.clone().into(),
        Value::String(s) => s.clone().into(),
        Value::Array(a) => PdlResult::List(a.iter().map(|v| resultify(v)).collect::<Vec<_>>()),
        Value::Object(m) => PdlResult::Dict(
            m.iter()
                .map(|(k, v)| (k.clone(), resultify(v)))
                .collect::<HashMap<_, _>>(),
        ),
    }
}

/// Transform a JSON Value into a PdlResult object that is compatible with litellm's model response schema
fn resultify_as_litellm(value: &Value) -> PdlResult {
    resultify(&json!({
        "choices": [
            value
        ]
    }))
}

pub fn load_scope(
    data: Option<&str>,
    data_file: Option<&str>,
    value: Option<Value>,
) -> Result<Scope, Box<dyn Error>> {
    let mut scope = HashMap::new();

    if let Some(data_file) = data_file {
        if let PdlResult::Dict(d) = resultify(&from_reader(::std::fs::File::open(data_file)?)?) {
            scope.extend(d);
        } else {
            return Err(Box::from(format!(
                "Data file {data_file} does not contain a dictionary"
            )));
        }
    }

    if let Some(data) = data {
        if let PdlResult::Dict(d) = resultify(&from_yaml_str(data)?) {
            scope.extend(d);
        } else {
            return Err(Box::from(format!("Data is not a dictionary")));
        }
    }

    if let Some(value) = value {
        if let PdlResult::Dict(d) = resultify(&value) {
            scope.extend(d);
        } else {
            return Err(Box::from(format!("Data is not a dictionary")));
        }
    }

    Ok(scope)
}
