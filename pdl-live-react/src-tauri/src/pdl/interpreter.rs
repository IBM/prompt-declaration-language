use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::path::PathBuf;

use async_recursion::async_recursion;
use minijinja::{Environment, syntax::SyntaxConfig};
use owo_colors::OwoColorize;
use tokio::io::{AsyncWriteExt, stdout};
use tokio_stream::StreamExt;

use ollama_rs::{
    Ollama,
    generation::{
        chat::{ChatMessage, ChatMessageResponse, MessageRole, request::ChatMessageRequest},
        tools::{ToolFunctionInfo, ToolInfo, ToolType},
    },
    models::ModelOptions,
};

use serde_json::{Value, from_str, json, to_string};
use serde_norway::{from_reader, from_str as from_yaml_str};

use crate::pdl::ast::{
    ArrayBlock, Block,
    Body::{self, *},
    CallBlock, Closure, DataBlock, EmptyBlock, EvalsTo, Expr, FunctionBlock, IfBlock, ImportBlock,
    IncludeBlock, ListOrString, MessageBlock, Metadata, MetadataBuilder, ModelBlock, ObjectBlock,
    PdlBlock,
    PdlBlock::Advanced,
    PdlParser, PdlResult, PdlUsage, PythonCodeBlock, ReadBlock, RegexMode, RegexParser,
    RepeatBlock, Role, Scope, SequencingBlock, StringOrBoolean, StringOrNull, Timing,
};

type Messages = Vec<ChatMessage>;
type ThreadSafeError = dyn Error + Send + Sync;
type PdlError = Box<ThreadSafeError>;
type Interpretation = Result<(PdlResult, Messages, PdlBlock), PdlError>;
type BodyInterpretation = Result<(PdlResult, Messages, Body), PdlError>;
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
    id_stack: Vec<String>,
}

impl State {
    fn new(initial_scope: Scope) -> Self {
        Self {
            emit: true,
            cwd: ::std::env::current_dir().unwrap_or(PathBuf::from("/")),
            scope: initial_scope,
            escaped_variables: vec![],
            messages: vec![],
            id_stack: vec![],
        }
    }

    fn id(&self) -> String {
        self.id_stack.join(".")
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

    fn with_iter(&self, iter: usize) -> Self {
        let mut s = self.clone();
        s.id_stack.push(format!("{iter}"));
        s
    }

    fn incr_iter(&self, iter: usize) -> Self {
        let mut s = self.clone();
        s.id_stack.pop();
        s.id_stack.push(format!("{iter}"));
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
        let res = match program {
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
            PdlBlock::Empty(b) => self.run_empty(b, state).await,
            PdlBlock::String(s) => self.run_string(s, state).await,
            Advanced(b) => self.run_advanced(b, state).await,
        }?;

        // copy any escaped variable bindings to the parent scope
        parent_scope.extend(
            state
                .escaped_variables
                .iter()
                .filter_map(|variable| state.scope.remove_entry(&variable.clone())),
        );

        if match &program {
            Advanced(Block {
                body: Message(_), ..
            })
            | Advanced(Block { body: Text(_), .. })
            | Advanced(Block {
                body: Import(_), ..
            })
            | Advanced(Block {
                body: Include(_), ..
            })
            | Advanced(Block {
                body: LastOf(_), ..
            })
            | Advanced(Block { body: Call(_), .. })
            | Advanced(Block { body: Model(_), .. }) => false,
            _ => state.emit,
        } {
            println!("{}", pretty_print(&res.1));
        }

        Ok(res)
    }

    async fn run_advanced(&mut self, block: &Block, state: &mut State) -> Interpretation {
        let mut timing = Timing::start()?;

        // This is just so we can avoid Option<Metadata> in the run_*
        // functions. We pass in an immutable reference, so no harm in
        // the or_default() part.
        let m = &block.metadata.clone().unwrap_or_default();

        self.process_defs(&m.defs, state).await?;

        let (result, messages, trace_body) = match &block.body {
            Call(b) => {
                state.id_stack.push("call".to_string());
                self.run_call(b, m, state).await
            }
            Data(b) => {
                state.id_stack.push("data".to_string());
                self.run_data(b, m, state).await
            }
            If(b) => {
                state.id_stack.push("if".to_string());
                self.run_if(b, m, state).await
            }
            Import(b) => {
                state.id_stack.push("import".to_string());
                self.run_import(b, m, state).await
            }
            Include(b) => {
                state.id_stack.push("include".to_string());
                self.run_include(b, m, state).await
            }
            Model(b) => {
                state.id_stack.push("model".to_string());
                self.run_model(b, m, state).await
            }
            Object(b) => {
                state.id_stack.push("object".to_string());
                self.run_object(b, m, state).await
            }
            PythonCode(b) => {
                state.id_stack.push("code".to_string());
                self.run_python_code(b, m, state).await
            }
            Read(b) => {
                state.id_stack.push("read".to_string());
                self.run_read(b, m, state).await
            }
            Repeat(b) => {
                state.id_stack.push("repeat".to_string());
                self.run_repeat(b, m, state).await
            }
            LastOf(b) => {
                state.id_stack.push("lastOf".to_string());
                self.run_sequence(b, m, state).await
            }
            Text(b) => {
                state.id_stack.push("text".to_string());
                self.run_sequence(b, m, state).await
            }
            Array(b) => {
                state.id_stack.push("array".to_string());
                self.run_array(b, m, state).await
            }
            Message(b) => {
                state.id_stack.push("message".to_string());
                self.run_message(b, m, state).await
            }
        }?;

        let mut trace = Block {
            metadata: block.metadata.clone(),
            body: trace_body,
        };

        timing.end()?;

        let mut trace_metadata = m.clone();
        trace_metadata.pdl_id = Some(state.id());
        trace_metadata.pdl_timing = Some(timing);
        trace_metadata.pdl_result = Some(Box::new(result.clone()));
        trace.metadata = Some(trace_metadata);

        state.id_stack.pop();

        Ok((result, messages, Advanced(trace)))
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
        let tmpl = self.jinja_env.template_from_str(expr.as_str())?;
        let result = tmpl.render(&state.scope)?;
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

    fn eval_string(
        &self,
        expr: &EvalsTo<String, Box<PdlResult>>,
        state: &State,
    ) -> Result<PdlResult, PdlError> {
        match expr {
            EvalsTo::Const(t) => Ok(*t.clone()),
            EvalsTo::Jinja(s) => self.eval(s, state),
            EvalsTo::Expr(e) => self.eval(&e.pdl_expr, state),
        }
    }

    // TODO how can we better cope with the expected String return?
    fn eval_string_to_string(
        &self,
        expr: &EvalsTo<String, String>,
        state: &State,
    ) -> Result<PdlResult, PdlError> {
        match expr {
            EvalsTo::Const(s) | EvalsTo::Jinja(s) => self.eval(s, state),
            EvalsTo::Expr(e) => self.eval(&e.pdl_expr, state),
        }
    }

    /// Evaluate an Expr to a bool
    fn eval_to_bool(
        &self,
        expr: &EvalsTo<StringOrBoolean, bool>,
        state: &State,
    ) -> Result<bool, PdlError> {
        match expr {
            EvalsTo::Const(b)
            | EvalsTo::Expr(Expr {
                pdl_expr: StringOrBoolean::Boolean(b),
                ..
            }) => Ok(b.clone()),

            EvalsTo::Jinja(s)
            | EvalsTo::Expr(Expr {
                pdl_expr: StringOrBoolean::String(s),
                ..
            }) => match self.eval(s, state)? {
                PdlResult::Bool(b) => Ok(b.clone()),
                x => Err(Box::from(format!(
                    "Expression {s} evaluated to non-boolean {:?}",
                    x
                ))),
            },
        }
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
        expr: &EvalsTo<ListOrString, Vec<PdlResult>>,
        state: &State,
    ) -> Result<Vec<PdlResult>, PdlError> {
        match expr {
            EvalsTo::Const(c) => Ok(c.clone()),
            EvalsTo::Jinja(s)
            | EvalsTo::Expr(Expr {
                pdl_expr: ListOrString::String(s),
                ..
            }) => match self.eval(s, state)? {
                PdlResult::List(l) => Ok(l),
                x => Err(Box::from(format!(
                    "Expression {s} evaluated to non-list {:?}",
                    x
                ))),
            },
            EvalsTo::Expr(Expr {
                pdl_expr: ListOrString::List(l),
                ..
            }) => l.iter().map(|v| self.eval_json(v, state)).collect(),
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
        let result = self.eval(msg, state)?;
        if self.options.debug {
            eprintln!("String {} -> {:?}", msg, result);
        }

        let result_string = match &result {
            PdlResult::String(s) => s.clone(),
            x => to_string(&x)?,
        };

        let messages = vec![ChatMessage::user(result_string)];
        let trace = Advanced(Block {
            metadata: Some(MetadataBuilder::default().pdl_id(state.id()).build()?),
            body: Data(DataBlock {
                data: json!({ "pdl__expr": msg.clone(), "pdl__result": result.clone() }),
                parser: None,
                raw: None,
            }),
        });

        Ok((result, messages, trace))
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
    async fn run_read(
        &mut self,
        block: &ReadBlock,
        metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
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
            &metadata.def,
            &buffer.clone().into(),
            &block.parser,
            state,
            true,
        )?;

        Ok((result, vec![ChatMessage::user(buffer)], Read(trace)))
    }

    /// Run a PdlBlock::Call
    async fn run_call(
        &mut self,
        block: &CallBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!("Call {:?}({:?})", block.call, block.args);
            eprintln!("Call scope {:?}", state.scope);
        }

        match self.eval_string(&block.call, state)? {
            PdlResult::Closure(c) => {
                let mut new_state = match &block.args {
                    None => Ok(state.clone()),
                    Some(args) => match self.eval_json(args, state)? {
                        PdlResult::Dict(m) => Ok(state.extend_scope(vec![m, c.scope])),
                        x => Err(PdlError::from(format!("Call arguments not a map: {:?}", x))),
                    },
                }?;

                let (result, messages, call_trace) =
                    self.run(&c.function.return_, &mut new_state).await?;
                let mut trace = block.clone();
                trace.pdl_trace = Some(Box::new(call_trace));
                Ok((result, messages, Body::Call(trace)))
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
    async fn run_if(
        &mut self,
        block: &IfBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!("If {:?}({:?})", block.condition, block.then);
        }

        let mut trace = block.clone();
        let if_result = self.eval_to_bool(&block.condition, state)?;
        trace.if_result = Some(if_result);

        let (result, messages) = if if_result {
            let (result, messages, then_trace) = self.run_quiet(&block.then, state).await?;
            trace.then = Box::new(then_trace);
            (result, messages)
        } else if let Some(else_block) = &block.else_ {
            let (result, messages, else_trace) = self.run_quiet(&else_block, state).await?;
            trace.else_ = Some(Box::new(else_trace));
            (result, messages)
        } else {
            ("".into(), vec![])
        };

        Ok((result, messages, If(trace)))
    }

    /// Run a PdlBlock::Include
    async fn run_include(
        &mut self,
        block: &IncludeBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!("Include {:?}", block.include);
        }

        let path = self.path_to(&block.include, state);
        let mut new_state = if let Some(cwd) = path.parent() {
            state.with_cwd(cwd.to_path_buf())
        } else {
            state.clone()
        };

        let (result, messages, include_trace) =
            self.run(&parse_file(&path)?, &mut new_state).await?;

        let mut trace = block.clone();
        trace.pdl_trace = Some(Box::new(include_trace));

        Ok((result, messages, Include(trace)))
    }

    /// Run a PdlBlock::Import
    async fn run_import(
        &mut self,
        block: &ImportBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!("Import {:?}", block.import);
        }

        let path = self.path_to(&block.import, state);
        let mut new_state = if let Some(cwd) = path.parent() {
            state.with_cwd(cwd.to_path_buf())
        } else {
            state.clone()
        };

        let (result, messages, import_trace) =
            self.run(&parse_file(&path)?, &mut new_state).await?;

        let mut trace = block.clone();
        trace.pdl_trace = Some(Box::new(import_trace));

        Ok((result, messages, Import(trace)))
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
                                    parameters: from_str(&to_string(parameters).unwrap()).unwrap(),
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
        _metadata: &Metadata,
        _state: &mut State,
    ) -> BodyInterpretation {
        use rustpython_vm as vm;

        let mut settings = rustpython_vm::Settings::default();

        // add PYTHONPATH to sys.path
        settings.path_list.extend(get_paths("PDLPYTHONPATH"));
        settings.path_list.extend(get_paths("PYTHONPATH"));

        if let Ok(venv) = ::std::env::var("VIRTUAL_ENV") {
            let path = ::std::path::PathBuf::from(venv).join(if cfg!(windows) {
                "lib/site-packages"
            } else {
                // TODO generalize this!
                "lib/python3.12/site-packages"
            });
            settings = settings.with_path(path.display().to_string());
        }

        let interp = vm::Interpreter::with_init(settings, |vm| {
            vm.add_native_modules(rustpython_stdlib::get_module_inits());
            vm.add_frozen(rustpython_pylib::FROZEN_STDLIB);

            vm.add_native_module("pydantic".to_owned(), Box::new(pydantic::make_module));
            vm.add_native_module(
                "pydantic_settings".to_owned(),
                Box::new(pydantic_settings::make_module),
            );
        });
        interp.enter(|vm| -> BodyInterpretation {
            let scope = vm.new_scope_with_builtins();

            // Sigh, this is copy-pasted from RustPython/src/lib.rs
            // `run_rustpython` as of 20250416 commit hash
            // a917da3b1. Without this (and also: importlib and
            // encodings features on rustpython-vm crate), then
            // pulling in venvs does not work.
            match vm.run_code_string(
                vm.new_scope_with_builtins(),
                "import sys; sys.path.insert(0, '')",
                "<embedded>".to_owned(),
            ) {
                Ok(_) => Ok(()),
                Err(exc) => {
                    vm.print_exception(exc);
                    Err(PdlError::from("Error setting up Python site path"))
                }
            }?;
            let site_result = vm.import("site", 0);
            if site_result.is_err() {
                println!(
                    "Failed to import site, consider adding the Lib directory to your RUSTPYTHONPATH \
                     environment variable",
                );
            }

            match vm.run_code_string(scope.clone(), block.code.as_str(), "<embedded>".to_owned()) {
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
                    let trace = PythonCode(block.clone());
                    Ok((messages[0].content.clone().into(), messages, trace))
                }
                Err(_) => Err(Box::from(
                    "Python code block failed to assign a 'result' variable",
                )),
            }
        })
    }

    /// Ollama Function call template, for models that don't support function calling directly
    /// TODO query ollama API to determine if model supports tool calling
    fn tool_call_prompt(
        &self,
        messages: &Messages,
        tools: &Vec<ToolInfo>,
    ) -> Result<Messages, PdlError> {
        if tools.len() == 0 {
            return Ok(messages.clone());
        }

        let mut function_prompt = format!(
            "Produce JSON OUTPUT ONLY! Adhere to this format {{\"name\": \"function_name\", \"arguments\":{{\"argument_name\": \"argument_value\"}}}} The following functions are available to you:"
        );
        tools.into_iter().try_for_each(|f| {
            function_prompt += format!("\n{:?}\n", to_string(&f)?).as_str();
            Ok::<(), PdlError>(())
        })?;

        Ok(
            match messages
                .into_iter()
                .position(|m| m.role == MessageRole::System)
            {
                Some(idx) => {
                    let mut m = messages.clone();
                    m[idx].content += function_prompt.as_str();
                    m
                }
                None => messages
                    .clone()
                    .splice(0..0, vec![ChatMessage::system(function_prompt)])
                    .collect(),
            },
        )
    }

    async fn run_ollama_model(
        &mut self,
        model: &str,
        block: &ModelBlock,
        metadata: &Metadata,
        state: &mut State,
        input_messages_0: Vec<ChatMessage>,
    ) -> Result<(String, Option<PdlUsage>), PdlError> {
        let mut ollama = Ollama::default();

        let (options, tools) = self.to_ollama_model_options(&block.parameters);
        if self.options.debug {
            eprintln!("Model options {:?} {:?}", metadata.description, options);
            eprintln!("Model tools {:?} {:?}", metadata.description, tools);
        }

        let input_messages = self.tool_call_prompt(&input_messages_0, &tools)?;

        let (prompt, history_slice): (&ChatMessage, &[ChatMessage]) =
            match input_messages.split_last() {
                Some(x) => x,
                None => (&ChatMessage::user("".into()), &[]),
            };
        let mut history = Vec::from(history_slice);
        if self.options.debug {
            eprintln!(
                "Ollama {:?} model={:?} prompt={:?} history={:?}",
                metadata.description, block.model, prompt, history
            );
        }

        let req = ChatMessageRequest::new(model.into(), vec![prompt.clone()])
            .options(options)
            // .format(ollama_rs::generation::parameters::FormatType::Json)
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
                )
                .await?;

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

        let usage = if let Some(res) = last_res {
            if let Some(usage) = res.final_data {
                Some(PdlUsage {
                    prompt_tokens: usage.prompt_eval_count,
                    prompt_nanos: Some(usage.prompt_eval_duration),
                    completion_tokens: usage.eval_count,
                    completion_nanos: Some(usage.eval_duration),
                })
            } else {
                None
            }
        } else {
            None
        };

        Ok((response_string, usage))
    }

    async fn run_openai_model(
        &mut self,
        model: &str,
        _block: &ModelBlock,
        _metadata: &Metadata,
        _state: &mut State,
        _input_messages: Vec<ChatMessage>,
    ) -> Result<(String, Option<PdlUsage>), PdlError> {
        use async_openai::types::ChatCompletionRequestUserMessageArgs;
        use async_openai::{Client, types::CreateChatCompletionRequestArgs};

        let client = Client::new();

        let request = CreateChatCompletionRequestArgs::default()
            .model(model)
            .max_tokens(512u32)
            .messages([ChatCompletionRequestUserMessageArgs::default()
                .content(
                    "Write a marketing blog praising and introducing Rust library async-openai",
                )
                .build()?
                .into()])
            .build()?;

        let mut stream = client.chat().create_stream(request).await?;
        let mut stdout = stdout();
        let mut response_string = String::new();
        while let Some(result) = stream.next().await {
            match result {
                Ok(response) => {
                    let mut iter = response.choices.iter();
                    while let Some(chat_choice) = iter.next() {
                        if let Some(ref content) = chat_choice.delta.content {
                            stdout.write_all(content.as_bytes()).await?;
                            stdout.flush().await?;
                            response_string += content.as_str();
                        }
                    }
                }
                Err(e) => return Err(Box::from(e)),
            }
        }

        Ok((response_string, None))
    }

    /// Run a PdlBlock::Model
    async fn run_model(
        &mut self,
        block: &ModelBlock,
        metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        // The input messages to the model is either:
        // a) block.input, if given
        // b) the current state's accumulated messages
        if let Some(c) = &block.context {
            state.scope.insert(
                "pdl_context".to_string(),
                PdlResult::List(
                    c.iter()
                        .map(|m| {
                            PdlResult::Block(PdlBlock::Advanced(Block {
                                metadata: None,
                                body: Body::Message(m.clone()),
                            }))
                        })
                        .collect(),
                ),
            );
        }

        let input_messages = match &block.input {
            Some(input) => {
                // TODO ignoring result and trace
                let (_result, messages, _trace) = self.run_quiet(&*input, state).await?;
                messages
            }
            None => state.messages.clone(),
        };

        let mut trace = block.clone();

        // TODO, does this belong in run_advanced(), and does
        // trace.context belong in Metadata rather than ModelBlock
        trace.context = Some(
            state
                .messages
                .iter()
                .map(|m| MessageBlock {
                    role: self.from_ollama_role(&m.role),
                    content: Box::new(PdlBlock::String(m.content.clone())),
                    name: None,
                    tool_call_id: None,
                    defsite: None,
                })
                .collect(),
        );
        // TODO, what is the difference between context and pdl_model_input fields?
        trace.pdl_model_input = Some(
            input_messages
                .iter()
                .map(|m| MessageBlock {
                    role: self.from_ollama_role(&m.role),
                    content: Box::new(PdlBlock::String(m.content.clone())),
                    name: None,
                    tool_call_id: None,
                    defsite: None,
                })
                .collect(),
        );

        let (response_string, usage) =
            if let PdlResult::String(s) = self.eval_string_to_string(&block.model, state)? {
                if s.starts_with("ollama/") || s.starts_with("ollama_chat/") {
                    let model = if s.starts_with("ollama/") {
                        &s[7..]
                    } else {
                        &s[12..]
                    };

                    self.run_ollama_model(model, block, metadata, state, input_messages)
                        .await
                } else if s.starts_with("openai/") {
                    let model = &s[7..];
                    self.run_openai_model(model, block, metadata, state, input_messages)
                        .await
                } else {
                    Err(Box::from(format!("Unsupported model {:?}", block.model)))
                }
            } else {
                Err(Box::from(format!(
                    "Model expression evaluated to non-string {:?}",
                    block.model
                )))
            }?;

        trace.pdl_usage = usage;

        Ok((
            PdlResult::String(response_string.clone()),
            vec![ChatMessage::assistant(response_string)],
            Model(trace),
        ))
    }

    /// Run a PdlBlock::Data
    async fn run_data(
        &mut self,
        block: &DataBlock,
        metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!("Data raw={:?} {:?}", block.raw, block.data);
        }

        let mut trace = block.clone();
        if let Some(true) = block.raw {
            let result = self.def(
                &metadata.def,
                &resultify(&block.data),
                &block.parser,
                state,
                true,
            )?;
            Ok((result, vec![], Data(trace)))
        } else {
            let result = self.def(
                &metadata.def,
                &self.eval_json(&block.data, state)?,
                &block.parser,
                state,
                true,
            )?;
            trace.data = from_str(to_string(&result)?.as_str())?;
            let messages = match &trace.data {
                Value::Object(m) => match m.get("pdl__result") {
                    Some(Value::Array(a)) => a
                        .iter()
                        .filter_map(|m| match m {
                            Value::Object(d) => match d.get("content") {
                                Some(Value::String(s)) => Some(ChatMessage::user(s.clone())),
                                _ => None,
                            },
                            m => Some(ChatMessage::user(m.to_string())),
                        })
                        .collect(),
                    _ => vec![ChatMessage::user(to_string(m)?)],
                },
                Value::Array(a) => vec![ChatMessage::user(to_string(a)?)],
                m => vec![ChatMessage::user(m.to_string())],
            };
            Ok((result, messages, Data(trace)))
        }
    }

    async fn run_object(
        &mut self,
        block: &ObjectBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
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
            Object(ObjectBlock { object: trace_map }),
        ))
    }

    /// Run a PdlBlock::Repeat
    async fn run_repeat(
        &mut self,
        block: &RepeatBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
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
        let mut iter_state = state.with_iter(0);
        if let Some(n) = iter_scopes.iter().map(|(_, v)| v.len()).min() {
            for iter in 0..n {
                let this_iter_scope = iter_scopes
                    .iter()
                    .map(|(k, v)| (k.clone(), v[iter].clone()))
                    .collect();
                iter_state = iter_state
                    .incr_iter(iter)
                    .extend_scope(vec![this_iter_scope]);
                let (result, ms, t) = self.run_quiet(&block.repeat, &mut iter_state).await?;
                results.push(result);
                messages.extend(ms);
                trace.push(t);
                //self.pop_scope();
            }
        }

        state.scope = iter_state.scope;
        state.escaped_variables = iter_state.escaped_variables;

        Ok((PdlResult::List(results), messages, Repeat(block.clone())))
    }

    fn to_ollama_role(&self, role: &Role) -> MessageRole {
        match role {
            Role::User => MessageRole::User,
            Role::Assistant => MessageRole::Assistant,
            Role::System => MessageRole::System,
            Role::Tool => MessageRole::Tool,
        }
    }

    fn from_ollama_role(&self, role: &MessageRole) -> Role {
        match role {
            MessageRole::User => Role::User,
            MessageRole::Assistant => Role::Assistant,
            MessageRole::System => Role::System,
            MessageRole::Tool => Role::Tool,
        }
    }

    fn parse_result(&self, parser: &PdlParser, result: &String) -> Result<PdlResult, PdlError> {
        match parser {
            PdlParser::Json => from_str(result).map_err(|e| Box::from(e)), // .map_err(|e| PdlError::from(e))
            PdlParser::Jsonl => Ok(PdlResult::List(
                serde_json::Deserializer::from_str(result)
                    .into_iter::<PdlResult>()
                    .collect::<Result<_, _>>()?,
            )),
            PdlParser::Yaml => from_yaml_str(result).map_err(|e| Box::from(e)),
            PdlParser::Regex(RegexParser { regex, mode, spec }) => {
                use regex::Regex;
                let re = Regex::new(regex)?;
                let expected_captures: Vec<&str> = if let Some(spec) = spec {
                    spec.keys().map(|k| k.as_str()).collect()
                } else {
                    vec![]
                };

                match mode {
                    Some(RegexMode::Findall) => Ok(PdlResult::List(
                        re.captures_iter(result)
                            .flat_map(|cap| {
                                expected_captures.iter().filter_map(move |k| {
                                    cap.name(k).and_then(|m| Some(m.as_str().into()))
                                })
                            })
                            .collect(),
                    )),
                    Some(RegexMode::Split) => todo!(),
                    _ => Ok(PdlResult::Dict(
                        re.captures_iter(result)
                            .flat_map(|cap| {
                                expected_captures.iter().filter_map(move |k| {
                                    cap.name(k)
                                        .and_then(|m| Some((k.to_string(), m.as_str().into())))
                                })
                            })
                            .collect(),
                    )),
                }
            }
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
        metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
        if self.options.debug {
            eprintln!(
                "{} {:?}",
                block.kind(),
                metadata.description.clone().unwrap_or_default()
            );
        }

        let mut output_results = vec![];
        let mut output_messages = vec![];
        let mut output_blocks = vec![];

        // here is where we iterate over the sequence items
        let mut iter = block.items().iter();
        let mut idx = 0;
        let mut iter_state = state.with_iter(idx);
        while let Some(block) = iter.next() {
            idx += 1;

            // run each element of the Text block
            let (this_result, this_messages, trace) = self.run(&block, &mut iter_state).await?;

            iter_state = iter_state.incr_iter(idx);
            iter_state.messages.extend(this_messages.iter().cloned());

            output_results.push(this_result);
            output_messages.extend(this_messages.iter().cloned());
            output_blocks.push(trace);
        }

        let trace = block.with_items(output_blocks);
        let result = self.def(
            &metadata.def,
            &trace.result_for(output_results),
            trace.parser(),
            &mut iter_state,
            true,
        )?;

        state.scope = iter_state.scope;
        state.escaped_variables = iter_state.escaped_variables;

        // We may be asked to overlay a role on to the messages (TODO,
        // does this belong in common code, i.e. run_advanced()?)
        let result_messages = trace.messages_for::<ChatMessage>(&output_messages);
        let messages = match block.role() {
            Some(role) => result_messages
                .into_iter()
                .map(|m| ChatMessage::new(self.to_ollama_role(role), m.content))
                .collect(),
            None => result_messages,
        };

        Ok((result, messages, trace.to_block()))
    }

    /// Run a PdlBlock::Array
    async fn run_array(
        &mut self,
        block: &ArrayBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
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

        let mut trace = block.clone();
        trace.array = trace_items;

        Ok((PdlResult::List(result_items), all_messages, Array(trace)))
    }

    /// Run a PdlBlock::Message
    async fn run_message(
        &mut self,
        block: &MessageBlock,
        _metadata: &Metadata,
        state: &mut State,
    ) -> BodyInterpretation {
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
            Message(MessageBlock {
                role: block.role.clone(),
                content: Box::new(content_trace),
                name: name,
                defsite: None,
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
    let trace_file = options.trace.clone();
    let mut interpreter = Interpreter::new(options);
    let mut state = State::new(initial_scope);
    if let Some(cwd) = cwd {
        state.cwd = cwd
    }

    let res = interpreter.run(&program, &mut state).await?;
    if let Some(trace_file) = trace_file {
        let file = ::std::fs::File::create(trace_file)?;
        let mut writer = ::std::io::BufWriter::new(file);
        serde_json::to_writer(&mut writer, &res.2)?;
    }

    Ok(res)
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
    // println!("{}", serde_json::to_string_pretty(&program)?);

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

/// Helper function to retrieve a sequence of paths from an environment variable.
fn get_paths(env_variable_name: &str) -> impl Iterator<Item = String> + '_ {
    ::std::env::var_os(env_variable_name)
        .into_iter()
        .flat_map(move |paths| {
            split_paths(&paths)
                .map(|path| {
                    path.into_os_string()
                        .into_string()
                        .unwrap_or_else(|_| panic!("{env_variable_name} isn't valid unicode"))
                })
                .collect::<Vec<_>>()
        })
}

#[cfg(not(target_os = "wasi"))]
pub(crate) use ::std::env::split_paths;
#[cfg(target_os = "wasi")]
pub(crate) fn split_paths<T: AsRef<std::ffi::OsStr> + ?Sized>(
    s: &T,
) -> impl Iterator<Item = std::path::PathBuf> + '_ {
    use std::os::wasi::ffi::OsStrExt;
    let s = s.as_ref().as_bytes();
    s.split(|b| *b == b':')
        .map(|x| std::ffi::OsStr::from_bytes(x).to_owned().into())
}

use rustpython_vm::pymodule;
#[pymodule]
mod pydantic {
    // use super::*;
    use rustpython_vm::{PyPayload, pyclass};

    #[pyattr]
    const __version__: u32 = 1;

    #[pyattr]
    #[pyclass(module = "pydantic", name = "BaseModel")]
    #[derive(Debug, PyPayload)]
    struct BaseModel {}

    #[pyclass(flags(BASETYPE))]
    impl BaseModel {}

    #[pyattr]
    #[pyclass(module = "pydantic", name = "Field")]
    #[derive(Debug, PyPayload)]
    struct Field {}

    #[pyclass]
    impl Field {}

    #[pyattr]
    #[pyclass(module = "pydantic", name = "ValidationError")]
    #[derive(Debug, PyPayload)]
    struct ValidationError {}

    #[pyclass]
    impl ValidationError {}

    #[pyattr]
    #[pyclass(module = "pydantic", name = "InstanceOf")]
    #[derive(Debug, PyPayload)]
    struct InstanceOf {}

    #[pyclass]
    impl InstanceOf {}

    #[pyattr]
    #[pyclass(module = "pydantic", name = "ConfigDict")]
    #[derive(Debug, PyPayload)]
    struct ConfigDict {}

    #[pyclass]
    impl ConfigDict {}
}

#[pymodule]
mod pydantic_settings {
    use rustpython_vm::{
        PyPayload, PyResult, VirtualMachine, builtins::PyDict, function::FuncArgs, pyclass,
    };

    #[pyfunction]
    fn SettingsConfigDict(_rest: FuncArgs, _vm: &VirtualMachine) -> PyResult<PyDict> {
        Ok(PyDict::default())
    }

    #[pyattr]
    #[pyclass(module = "pydantic_settings", name = "BaseSettings")]
    #[derive(Debug, PyPayload)]
    struct BaseSettings {}

    #[pyclass(flags(BASETYPE))]
    impl BaseSettings {}
}
