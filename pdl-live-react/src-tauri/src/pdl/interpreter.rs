// use ::std::cell::LazyCell;
use ::std::collections::HashMap;
use ::std::env::current_dir;
use ::std::error::Error;
use ::std::fs::{read_to_string as read_file_to_string, File};
use ::std::path::PathBuf;
use std::sync::{Arc, Mutex};

use async_recursion::async_recursion;
use minijinja::{syntax::SyntaxConfig, Environment};
use owo_colors::OwoColorize;
use tokio::io::{stdout, AsyncWriteExt};
use tokio_stream::StreamExt;

use ollama_rs::{
    generation::{
        chat::{request::ChatMessageRequest, ChatMessage, ChatMessageResponse, MessageRole},
        tools::ToolInfo,
    },
    models::ModelOptions,
    Ollama,
};

use serde_json::{from_str, to_string, Value};
use serde_norway::{from_reader, from_str as from_yaml_str};

use crate::pdl::ast::{
    ArrayBlock, CallBlock, Closure, DataBlock, EmptyBlock, FunctionBlock, IfBlock, ImportBlock,
    IncludeBlock, ListOrString, MessageBlock, ModelBlock, ObjectBlock, PdlBlock, PdlParser,
    PdlResult, PdlUsage, PythonCodeBlock, ReadBlock, RepeatBlock, Role, Scope, SequencingBlock,
    StringOrBoolean, StringOrNull,
};

type Context = Vec<ChatMessage>;
type PdlError = Box<dyn Error + Send + Sync>;
type Interpretation = Result<(PdlResult, Context, PdlBlock), PdlError>;
type InterpretationSync = Result<(PdlResult, Context, PdlBlock), Box<dyn Error>>;

struct Interpreter<'a> {
    // batch: u32,
    // role: Role,
    cwd: PathBuf,
    // id_stack: Vec<String>,
    jinja_env: Environment<'a>,
    scope: Vec<Scope>,
    debug: bool,
    emit: bool,
}

impl<'a> Interpreter<'a> {
    fn new() -> Self {
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
            // role: Role::User,
            cwd: current_dir().unwrap_or(PathBuf::from("/")),
            // id_stack: vec![],
            jinja_env: jinja_env,
            scope: vec![Scope::new()],
            debug: false,
            emit: true,
        }
    }

    async fn run_with_emit(
        &mut self,
        program: &PdlBlock,
        context: Context,
        emit: bool,
    ) -> Interpretation {
        if self.debug {
            if let Some(scope) = self.scope.last() {
                if scope.len() > 0 {
                    eprintln!("Run with Scope {:?}", scope);
                }
            }
        }

        let prior_emit = self.emit;
        self.emit = emit;

        let (result, messages, trace) = match program {
            PdlBlock::Number(n) => Ok((
                n.clone().into(),
                vec![ChatMessage::user(format!("{n}"))],
                PdlBlock::Number(n.clone()),
            )),
            PdlBlock::Function(f) => Ok((
                PdlResult::Closure(self.closure(&f)),
                vec![],
                PdlBlock::Function(f.clone()),
            )),
            PdlBlock::String(s) => self.run_string(s, context).await,
            PdlBlock::Call(block) => self.run_call(block, context).await,
            PdlBlock::Empty(block) => self.run_empty(block, context).await,
            PdlBlock::If(block) => self.run_if(block, context).await,
            PdlBlock::Import(block) => self.run_import(block, context).await,
            PdlBlock::Include(block) => self.run_include(block, context).await,
            PdlBlock::Model(block) => self.run_model(block, context).await,
            PdlBlock::Data(block) => self.run_data(block, context).await,
            PdlBlock::Object(block) => self.run_object(block, context).await,
            PdlBlock::PythonCode(block) => self.run_python_code(block, context).await,
            PdlBlock::Read(block) => self.run_read(block, context).await,
            PdlBlock::Repeat(block) => self.run_repeat(block, context).await,
            PdlBlock::LastOf(block) => self.run_sequence(block, context).await,
            PdlBlock::Text(block) => self.run_sequence(block, context).await,
            PdlBlock::Array(block) => self.run_array(block, context).await,
            PdlBlock::Message(block) => self.run_message(block, context).await,
            _ => Err(Box::from(format!("Unsupported block {:?}", program))),
        }?;

        if match program {
            PdlBlock::Call(_) | PdlBlock::Model(_) => false,
            _ => self.emit,
        } {
            println!("{}", pretty_print(&messages));
        }
        self.emit = prior_emit;

        Ok((result, messages, trace))
    }

    #[async_recursion]
    async fn run_quiet(&mut self, program: &PdlBlock, context: Context) -> Interpretation {
        self.run_with_emit(program, context, false).await
    }

    #[async_recursion]
    async fn run(&mut self, program: &PdlBlock, context: Context) -> Interpretation {
        self.run_with_emit(program, context, self.emit).await
    }

    /// Evaluate String as a Jinja2 expression
    fn eval(&self, expr: &String) -> Result<PdlResult, PdlError> {
        let result = self
            .jinja_env
            .render_str(expr.as_str(), self.scope.last().unwrap_or(&HashMap::new()))?;
        if self.debug {
            eprintln!("Eval {} -> {}", expr, result);
        }

        let backup = result.clone();
        Ok(from_str(&result).unwrap_or_else(|err| {
            if self.debug {
                eprintln!("Treating as plain string {}", &result);
                eprintln!("... due to {}", err);
            }
            backup.into()
        }))
    }

    /// Evaluate String as a Jinja2 expression, expecting a string in response
    fn eval_to_string(&self, expr: &String) -> Result<String, PdlError> {
        match self.eval(expr)? {
            PdlResult::String(s) => Ok(s),
            x => Err(Box::from(format!(
                "Expression {expr} evaluated to non-string {:?}",
                x
            ))),
        }
    }

    /// Traverse the given JSON Value, applying `self.eval()` to the value elements within.
    fn eval_json(&self, expr: &Value) -> Result<PdlResult, PdlError> {
        match expr {
            Value::Null => Ok("".into()),
            Value::Bool(b) => Ok(PdlResult::Bool(*b)),
            Value::Number(n) => Ok(PdlResult::Number(n.clone())),
            Value::String(s) => self.eval(s),
            Value::Array(a) => Ok(PdlResult::List(
                a.iter()
                    .map(|v| self.eval_json(v))
                    .collect::<Result<_, _>>()?,
            )),
            Value::Object(o) => Ok(PdlResult::Dict(
                o.iter()
                    .map(|(k, v)| match self.eval_json(v) {
                        Ok(v) => Ok((k.clone(), v)),
                        Err(e) => Err(e),
                    })
                    .collect::<Result<_, _>>()?,
            )),
        }
    }

    /// Evaluate an string or list of Values into a list of Values
    fn eval_list_or_string(&self, expr: &ListOrString) -> Result<Vec<PdlResult>, PdlError> {
        match expr {
            ListOrString::String(s) => match self.eval(s)? {
                PdlResult::List(a) => Ok(a),
                x => Err(Box::from(format!(
                    "Jinja string expanded to non-list. {} -> {:?}",
                    s, x
                ))),
            },
            ListOrString::List(l) => l.iter().map(|v| self.eval_json(v)).collect(),
        }
    }

    /// Create a closure for the given function `f`
    fn closure(&self, f: &FunctionBlock) -> Closure {
        Closure {
            function: f.clone(),
            scope: self.scope.last().unwrap_or(&HashMap::new()).clone(),
        }
    }

    /// Run a PdlBlock::String
    async fn run_string(&self, msg: &String, _context: Context) -> Interpretation {
        let trace = self.eval(msg)?;
        if self.debug {
            eprintln!("String {} -> {:?}", msg, trace);
        }

        let result_string = match &trace {
            PdlResult::String(s) => s.clone(),
            x => to_string(&x)?,
        };
        let messages = vec![ChatMessage::user(result_string)];

        Ok((trace, messages, PdlBlock::String(msg.clone())))
    }

    /// If `file_path` is not absolute, join it with self.cwd
    fn path_to(&self, file_path: &String) -> PathBuf {
        let mut path = self.cwd.clone();
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
            if let Some(scope) = self.scope.last_mut() {
                if self.debug {
                    eprintln!("Def {} -> {}", def, result);
                }
                scope.insert(def.clone(), result.clone());
            }
        }

        Ok(result)
    }

    /// Run a PdlBlock::Read
    async fn run_read(&mut self, block: &ReadBlock, _context: Context) -> Interpretation {
        let trace = block.clone();

        println!(
            "{}",
            match (&block.message, block.multiline) {
                (Some(message), _) => message.as_str(),
                (None, Some(true)) => "Enter/Paste your content. Ctrl-D to save it.",
                _ => "How can i help you?",
            }
        );

        let buffer = match &block.read {
            StringOrNull::String(file_path) => read_file_to_string(self.path_to(file_path))?,
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

        let result = self.def(&block.def, &buffer.clone().into(), &block.parser)?;

        Ok((
            result,
            vec![ChatMessage::user(buffer)],
            PdlBlock::Read(trace),
        ))
    }

    /// Run a PdlBlock::Call
    async fn run_call(&mut self, block: &CallBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Call {:?}({:?})", block.call, block.args);
            eprintln!("Call scope {:?}", self.scope.last());
        }

        let res = match self.eval(&block.call)? {
            PdlResult::Closure(c) => {
                if let Some(args) = &block.args {
                    match self.eval_json(args)? {
                        PdlResult::Dict(m) => {
                            self.push_and_extend_scope_with(m, c.scope);
                            Ok(())
                        }
                        x => Err(Box::<dyn Error + Send + Sync>::from(format!(
                            "Call arguments not a map: {:?}",
                            x
                        ))),
                    }?;
                }

                self.run(&c.function.return_, context.clone()).await
            }
            _ => Err(Box::from(format!("call of non-function {:?}", &block.call))),
        };

        if let Some(_) = block.args {
            self.scope.pop();
        }

        res
    }

    /// Run a PdlBlock::Empty
    async fn run_empty(&mut self, block: &EmptyBlock, _context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Empty");
        }

        let trace = block.clone();
        self.process_defs(&Some(block.defs.clone())).await?;
        Ok((
            PdlResult::Dict(self.scope.last().unwrap_or(&HashMap::new()).clone()),
            vec![],
            PdlBlock::Empty(trace),
        ))
    }

    /// Run a PdlBlock::Call
    async fn run_if(&mut self, block: &IfBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("If {:?}({:?})", block.condition, block.then);
        }

        self.process_defs(&block.defs).await?;

        let cond = match &block.condition {
            StringOrBoolean::Boolean(b) => PdlResult::Bool(*b),
            StringOrBoolean::String(s) => self.eval(s)?,
        };
        let res = match cond {
            PdlResult::Bool(true) => self.run_quiet(&block.then, context).await,
            PdlResult::Bool(false) => match &block.else_ {
                Some(else_block) => self.run_quiet(&else_block, context).await,
                None => Ok(("".into(), vec![], PdlBlock::If(block.clone()))),
            },
            x => Err(Box::from(format!(
                "if block condition evaluated to non-boolean value: {:?}",
                x
            ))),
        };

        self.scope.pop();
        res
    }

    /// Run a PdlBlock::Include
    async fn run_include(&mut self, block: &IncludeBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Include {:?}", block.include);
        }

        let path = self.path_to(&block.include);
        let old_cwd = self.cwd.clone();
        if let Some(cwd) = path.parent() {
            self.cwd = cwd.to_path_buf()
        }
        let res = self.run_quiet(&parse_file(&path)?, context.clone()).await;
        self.cwd = old_cwd;
        res
    }

    /// Run a PdlBlock::Import
    async fn run_import(&mut self, block: &ImportBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Import {:?}", block.import);
        }

        let path = self.path_to(&block.import);
        let old_cwd = self.cwd.clone();
        if let Some(cwd) = path.parent() {
            self.cwd = cwd.to_path_buf()
        }
        let res = self.run_quiet(&parse_file(&path)?, context.clone()).await;
        self.cwd = old_cwd;
        res
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

            let tools = if let Some(Value::Array(_tools)) = parameters.get(&"tools".to_string()) {
                // TODO
                //tools.into_iter().map(|tool| function!()).collect()
                vec![]
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
        _context: Context,
    ) -> Interpretation {
        use rustpython_vm as vm;
        vm::Interpreter::without_stdlib(Default::default()).enter(|vm| -> Interpretation {
            let scope = vm.new_scope_with_builtins();

            // TODO vm.new_syntax_error(&err, Some(block.code.as_str()))
            let code_obj = vm
                .compile(
                    block.code.as_str(),
                    vm::compiler::Mode::Exec,
                    "<embedded>".to_owned(),
                )
                .map_err(|_err| {
                    panic!("Syntax error in Python code");
                })
                .unwrap();

            let _output = vm
                .run_code_obj(code_obj, scope.clone())
                .map_err(|_err| {
                    // TODO vm.print_exception(exc);
                    println!("Error executing Python code");
                })
                .unwrap();

            match scope.globals.get_item("result", vm) {
                Ok(result) => {
                    let result_string = result
                        .str(vm)
                        .map_err(|e| {
                            panic!("Unable to stringify Python 'result' value {:?}", e);
                        })
                        .unwrap();
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
    async fn run_model(&mut self, block: &ModelBlock, context: Context) -> Interpretation {
        match &block.model {
            pdl_model
                if pdl_model.starts_with("ollama/") || pdl_model.starts_with("ollama_chat/") =>
            {
                let ollama = Ollama::default();
                let model = if pdl_model.starts_with("ollama/") {
                    &pdl_model[7..]
                } else {
                    &pdl_model[12..]
                };

                let (options, tools) = self.to_ollama_model_options(&block.parameters);
                if self.debug {
                    println!("Model options {:?}", options);
                }

                let input_messages = match &block.input {
                    Some(input) => {
                        // TODO ignoring result, trace
                        let (_result, messages, _trace) = self.run_quiet(&*input, context).await?;
                        messages
                    }
                    None => context,
                };
                let (prompt, history_slice): (&ChatMessage, &[ChatMessage]) =
                    match input_messages.split_last() {
                        Some(x) => x,
                        None => (&ChatMessage::user("".into()), &[]),
                    };
                let history = Vec::from(history_slice);
                if self.debug {
                    eprintln!(
                        "Ollama {:?} model={:?} prompt={:?} history={:?}",
                        block.description.clone().unwrap_or("".into()),
                        block.model,
                        prompt,
                        history
                    );
                }

                if self.emit {
                    println!("{}", pretty_print(&input_messages));
                }

                let req = ChatMessageRequest::new(model.into(), vec![prompt.clone()])
                    .options(options)
                    .tools(tools);
                /* if we ever want non-streaming:
                let res = ollama
                    .send_chat_messages_with_history(
                        &mut history,
                        req,
                        //ollama.generate(GenerationRequest::new(model.into(), prompt),
                    )
                    .await?;
                // dbg!("Model result {:?}", &res);

                let mut trace = block.clone();
                trace.pdl_result = Some(res.message.content.clone());

                if let Some(usage) = res.final_data {
                    trace.pdl_usage = Some(PdlUsage {
                        prompt_tokens: usage.prompt_eval_count,
                        prompt_nanos: usage.prompt_eval_duration,
                        completion_tokens: usage.eval_count,
                        completion_nanos: usage.eval_duration,
                    });
                }
                // dbg!(history);
                Ok((vec![res.message], PdlBlock::Model(trace)))
                 */
                let mut stream = ollama
                    .send_chat_messages_with_history_stream(
                        Arc::new(Mutex::new(history)),
                        req,
                        //ollama.generate(GenerationRequest::new(model.into(), prompt),
                    )
                    .await?;
                // dbg!("Model result {:?}", &res);

                let mut last_res: Option<ChatMessageResponse> = None;
                let mut response_string = String::new();
                let mut stdout = stdout();
                stdout.write_all(b"\x1b[1mAssistant: \x1b[0m").await?;
                while let Some(Ok(res)) = stream.next().await {
                    stdout.write_all(b"\x1b[32m").await?; // green
                    stdout.write_all(res.message.content.as_bytes()).await?;
                    stdout.flush().await?;
                    stdout.write_all(b"\x1b[0m").await?; // reset color
                    response_string += res.message.content.as_str();
                    last_res = Some(res);
                }
                stdout.write_all(b"\n").await?;

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

    /// Transform a JSON Value into a PdlResult object
    fn resultify(&self, value: &Value) -> PdlResult {
        match value {
            Value::Null => "".into(),
            Value::Bool(b) => b.into(),
            Value::Number(n) => n.clone().into(),
            Value::String(s) => s.clone().into(),
            Value::Array(a) => {
                PdlResult::List(a.iter().map(|v| self.resultify(v)).collect::<Vec<_>>())
            }
            Value::Object(m) => PdlResult::Dict(
                m.iter()
                    .map(|(k, v)| (k.clone(), self.resultify(v)))
                    .collect::<HashMap<_, _>>(),
            ),
        }
    }

    /// Run a PdlBlock::Data
    async fn run_data(&mut self, block: &DataBlock, _context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Data raw={:?} {:?}", block.raw, block.data);
        }

        let mut trace = block.clone();
        if let Some(true) = block.raw {
            let result = self.def(&block.def, &self.resultify(&block.data), &block.parser)?;
            Ok((result, vec![], PdlBlock::Data(trace)))
        } else {
            let result = self.def(&block.def, &self.eval_json(&block.data)?, &block.parser)?;
            trace.data = from_str(to_string(&result)?.as_str())?;
            Ok((result, vec![], PdlBlock::Data(trace)))
        }
    }

    async fn run_object(&mut self, block: &ObjectBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Object {:?}", block.object);
        }

        let mut messages = vec![];
        let mut result_map = HashMap::new();
        let mut trace_map = HashMap::new();

        let mut iter = block.object.iter();
        while let Some((k, v)) = iter.next() {
            let (this_result, this_messages, this_trace) =
                self.run_quiet(v, context.clone()).await?;
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
    async fn run_repeat(&mut self, block: &RepeatBlock, context: Context) -> Interpretation {
        // { i:[1,2,3], j: [4,5,6]} -> ([i,j], [[1,2,3],[4,5,6]])
        //        let (variables, values): (Vec<_>, Vec<Vec<_>>) = block
        //            .into_iter()
        //            .unzip();
        let iter_scopes = block
            .for_
            .iter()
            .map(|(var, values)| match self.eval_list_or_string(values) {
                Ok(value) => Ok((var.clone(), value)),
                Err(e) => Err(e),
            })
            .collect::<Result<HashMap<_, _>, _>>()?;

        if self.debug {
            eprintln!("Repeat {:?}", iter_scopes);
        }

        let mut results = vec![];
        let mut messages = vec![];
        let mut trace = vec![];
        if let Some(n) = iter_scopes.iter().map(|(_, v)| v.len()).min() {
            for iter in 0..n {
                let this_iter_scope = iter_scopes
                    .iter()
                    .map(|(k, v)| (k.clone(), v[iter].clone()))
                    .collect();
                self.push_and_extend_scope(this_iter_scope);
                let (result, ms, t) = self.run_quiet(&block.repeat, context.clone()).await?;
                results.push(result);
                messages.extend(ms);
                trace.push(t);
                self.pop_scope();
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

    fn push_and_extend_scope(&mut self, scope: HashMap<String, PdlResult>) {
        let mut new_scope = self.scope.last().unwrap_or(&HashMap::new()).clone();
        new_scope.extend(scope);
        self.scope.push(new_scope);
    }

    fn push_and_extend_scope_with(
        &mut self,
        mut scope: HashMap<String, PdlResult>,
        other_scope: HashMap<String, PdlResult>,
    ) {
        scope.extend(other_scope);
        self.push_and_extend_scope(scope);
    }

    fn pop_scope(&mut self) {
        self.scope.pop();
    }

    async fn process_defs(
        &mut self,
        defs: &Option<indexmap::IndexMap<String, PdlBlock>>,
    ) -> Result<(), PdlError> {
        let mut new_scope: Scope = HashMap::new();
        if let Some(cur_scope) = self.scope.last() {
            new_scope.extend(cur_scope.clone());
        }
        self.scope.push(new_scope);

        if let Some(defs) = defs {
            let mut iter = defs.iter();
            while let Some((var, def)) = iter.next() {
                let (result, _, _) = self.run_quiet(def, vec![]).await?;
                let _ = self.def(&Some(var.clone()), &result, &None);
            }
        }

        Ok(())
    }

    /// Run a sequencing block (e.g. TextBlock, LastOfBlock)
    async fn run_sequence(
        &mut self,
        block: &impl SequencingBlock,
        context: Context,
    ) -> Interpretation {
        if self.debug {
            let description = if let Some(d) = block.description() {
                d
            } else {
                &"<no description>".to_string()
            };
            eprintln!("{} {description}", block.kind());
        }

        let mut input_messages = context.clone();
        let mut output_results = vec![];
        let mut output_messages = vec![];
        let mut output_blocks = vec![];

        self.process_defs(block.defs()).await?;

        let mut iter = block.items().iter();
        while let Some(block) = iter.next() {
            // run each element of the Text block
            let (this_result, this_messages, trace) =
                self.run_quiet(&block, input_messages.clone()).await?;
            input_messages.extend(this_messages.clone());
            output_results.push(this_result);

            output_messages.extend(this_messages);
            output_blocks.push(trace);
        }

        self.scope.pop();

        let trace = block.with_items(output_blocks);
        let result = self.def(
            trace.def(),
            &trace.result_for(output_results),
            trace.parser(),
        )?;
        let result_messages = trace.messages_for::<ChatMessage>(output_messages);
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
    async fn run_array(&mut self, block: &ArrayBlock, context: Context) -> Interpretation {
        let mut result_items = vec![];
        let mut all_messages = vec![];
        let mut trace_items = vec![];

        let mut iter = block.array.iter();
        while let Some(item) = iter.next() {
            // TODO accumulate messages
            let (result, messages, trace) = self.run_quiet(item, context.clone()).await?;
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
    async fn run_message(&mut self, block: &MessageBlock, context: Context) -> Interpretation {
        let (content_result, content_messages, content_trace) =
            self.run(&block.content, context).await?;
        let name = if let Some(name) = &block.name {
            Some(self.eval_to_string(&name)?)
        } else {
            None
        };
        let tool_call_id = if let Some(tool_call_id) = &block.tool_call_id {
            Some(self.eval_to_string(&tool_call_id)?)
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

pub async fn run(program: &PdlBlock, cwd: Option<PathBuf>, debug: bool) -> Interpretation {
    let mut interpreter = Interpreter::new();
    interpreter.debug = debug;
    if let Some(cwd) = cwd {
        interpreter.cwd = cwd
    };
    interpreter.run(&program, vec![]).await
}

pub fn run_sync(program: &PdlBlock, cwd: Option<PathBuf>, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run(program, cwd, debug))
        .map_err(|err| Box::<dyn Error>::from(err.to_string()))
}

/// Read in a file from disk and parse it as a PDL program
fn parse_file(path: &PathBuf) -> Result<PdlBlock, PdlError> {
    from_reader(File::open(path)?)
        .map_err(|err| Box::<dyn Error + Send + Sync>::from(err.to_string()))
}

pub async fn run_file(source_file_path: &str, debug: bool) -> Interpretation {
    let path = PathBuf::from(source_file_path);
    let cwd = path.parent().and_then(|cwd| Some(cwd.to_path_buf()));
    let program = parse_file(&path)?;

    run(&program, cwd, debug).await
}

pub fn run_file_sync(source_file_path: &str, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run_file(source_file_path, debug))
        .map_err(|err| Box::<dyn Error>::from(err.to_string()))
}

pub async fn run_string(source: &str, debug: bool) -> Interpretation {
    run(&from_yaml_str(source)?, None, debug).await
}

pub async fn run_json(source: Value, debug: bool) -> Interpretation {
    run_string(&to_string(&source)?, debug).await
}

pub fn run_json_sync(source: Value, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run_json(source, debug))
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
