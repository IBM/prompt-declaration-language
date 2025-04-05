// use ::std::cell::LazyCell;
use ::std::collections::HashMap;
use std::sync::{Arc, Mutex};
// use ::std::env::current_dir;
use ::std::error::Error;
use ::std::fs::{read_to_string as read_file_to_string, File};
// use ::std::path::PathBuf;

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

use serde_json::{from_str, to_string, Map, Value};
use serde_norway::{from_reader, from_str as from_yaml_str};

use crate::pdl::ast::{
    CallBlock, ListOrString, ModelBlock, PdlBlock, PdlParser, PdlUsage, PythonCodeBlock, ReadBlock,
    RepeatBlock, Role, TextBlock,
};

type Context = Vec<ChatMessage>;
type Scope = HashMap<String, Value>;
type Interpretation = Result<(Context, PdlBlock), Box<dyn Error + Send + Sync>>;
type InterpretationSync = Result<(Context, PdlBlock), Box<dyn Error>>;

struct Interpreter<'a> {
    // batch: u32,
    // role: Role,
    // cwd: Box<PathBuf>,
    // id_stack: Vec<String>,
    jinja_env: Environment<'a>,
    // rt: Runtime,
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
            // cwd: Box::new(current_dir().unwrap_or(PathBuf::from("/"))),
            // id_stack: vec![],
            jinja_env: jinja_env,
            // rt: Runtime::new().unwrap(),
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
        let prior_emit = self.emit;
        self.emit = emit;

        let (messages, trace) = match program {
            PdlBlock::String(s) => self.run_string(s, context).await,
            PdlBlock::Call(block) => self.run_call(block, context).await,
            PdlBlock::PythonCode(block) => self.run_python_code(block, context).await,
            PdlBlock::Model(block) => self.run_model(block, context).await,
            PdlBlock::Read(block) => self.run_read(block, context).await,
            PdlBlock::Repeat(block) => self.run_repeat(block, context).await,
            PdlBlock::Text(block) => self.run_text(block, context).await,
            _ => Err(Box::from(format!("Unsupported block {:?}", program))),
        }?;

        if match program {
            PdlBlock::Call(_) | PdlBlock::Text(_) => false,
            _ => self.emit,
        } {
            // eprintln!("{:?}", program);
            println!("{}", pretty_print(&messages));
        }
        self.emit = prior_emit;

        Ok((messages, trace))
    }

    #[async_recursion]
    async fn run_quiet(&mut self, program: &PdlBlock, context: Context) -> Interpretation {
        self.run_with_emit(program, context, false).await
    }

    #[async_recursion]
    async fn run(&mut self, program: &PdlBlock, context: Context) -> Interpretation {
        self.run_with_emit(program, context, self.emit).await
    }

    // Evaluate String as a Jinja2 expression
    fn eval<T: serde::de::DeserializeOwned + ::std::convert::From<String>>(
        &self,
        expr: &String,
    ) -> Result<T, Box<dyn Error + Send + Sync>> {
        let result = self
            .jinja_env
            .render_str(expr.as_str(), self.scope.last().unwrap_or(&HashMap::new()))?;
        if self.debug {
            eprintln!("Eval '{}' -> {}", &expr, &result);
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

    fn eval_complex(&self, expr: &Value) -> Result<Value, Box<dyn Error + Send + Sync>> {
        match expr {
            Value::String(s) => self.eval(s),
            Value::Array(a) => Ok(Value::Array(
                a.iter()
                    .map(|v| self.eval_complex(v))
                    .collect::<Result<_, _>>()?,
            )),
            Value::Object(o) => Ok(Value::Object(
                o.iter()
                    .map(|(k, v)| match self.eval_complex(v) {
                        Ok(v) => Ok((k.clone(), v)),
                        Err(e) => Err(e),
                    })
                    .collect::<Result<_, _>>()?,
            )),
            v => Ok(v.clone()),
        }
    }

    // Evaluate an string or list of Values into a list of Values
    fn eval_list_or_string(
        &self,
        expr: &ListOrString,
    ) -> Result<Vec<Value>, Box<dyn Error + Send + Sync>> {
        match expr {
            ListOrString::String(s) => match self.eval::<Value>(s)? {
                Value::Array(a) => Ok(a),
                x => Err(Box::from(format!(
                    "Jinja string expanded to non-list. {} -> {:?}",
                    s, x
                ))),
            },
            ListOrString::List(l) => l.iter().map(|v| self.eval_complex(v)).collect(),
        }
    }

    // Run a PdlBlock::String
    async fn run_string(&self, msg: &String, _context: Context) -> Interpretation {
        let trace = self.eval::<PdlBlock>(msg)?;
        if self.debug {
            eprintln!("String {} -> {:?}", msg, trace);
        }

        let messages = vec![ChatMessage::user(match &trace {
            PdlBlock::String(s) => s.clone(),
            x => to_string(&x)?,
        })];

        Ok((messages, trace))
    }

    // Run a PdlBlock::Read
    async fn run_read(&self, block: &ReadBlock, _context: Context) -> Interpretation {
        let trace = block.clone();

        if let Some(message) = &block.message {
            println!("{}", message);
        }

        let buffer = match &block.read {
            Value::String(file_path) => Ok(read_file_to_string(file_path)?),
            Value::Null => {
                let mut buffer = String::new();
                ::std::io::stdin().read_line(&mut buffer)?;
                Ok(buffer)
            }
            x => Err(Box::<dyn Error + Send + Sync>::from(format!(
                "Unsupported value for read field: {:?}",
                x
            ))),
        }?;

        Ok((vec![ChatMessage::user(buffer)], PdlBlock::Read(trace)))
    }

    // Run a PdlBlock::Call
    async fn run_call(&mut self, block: &CallBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!("Call {:?}({:?})", block.call, block.args);
        }

        if let Some(args) = &block.args {
            match self.eval_complex(args)? {
                Value::Object(m) => Ok(self.extend_scope_with_json_map(m)),
                x => Err(Box::<dyn Error + Send + Sync>::from(format!(
                    "Call arguments not a map: {:?}",
                    x
                ))),
            }?;
        }

        let res = match self.eval::<PdlBlock>(&block.call)? {
            PdlBlock::Function(f) => self.run(&f.return_, context.clone()).await,
            _ => Err(Box::from(format!("call of non-function {:?}", &block.call))),
        };

        if let Some(_) = block.args {
            self.scope.pop();
        }

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

    // Run a PdlBlock::PythonCode
    async fn run_python_code(
        &mut self,
        block: &PythonCodeBlock,
        context: Context,
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
                    Ok((messages, trace))
                }
                Err(_) => Err(Box::from(
                    "Python code block failed to assign a 'result' variable",
                )),
            }
        })
    }

    // Run a PdlBlock::Model
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

                let messages = match &block.input {
                    Some(input) => {
                        // TODO ignoring trace
                        let (messages, _trace) = self.run_quiet(&*input, context).await?;
                        messages
                    }
                    None => context,
                };
                let (prompt, history_slice): (&ChatMessage, &[ChatMessage]) =
                    match messages.split_last() {
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
                    let mut message = res.message.clone();
                    message.content = response_string;
                    Ok((vec![message], PdlBlock::Model(trace)))
                } else {
                    Ok((vec![], PdlBlock::Model(trace)))
                }
                // dbg!(history);
            }
            _ => Err(Box::from(format!("Unsupported model {}", block.model))),
        }
    }

    // Run a PdlBlock::Repeat
    async fn run_repeat(&mut self, block: &RepeatBlock, context: Context) -> Interpretation {
        // { i:[1,2,3], j: [4,5,6]} -> ([i,j], [[1,2,3],[4,5,6]])
        //        let (variables, values): (Vec<_>, Vec<Vec<_>>) = block
        //            .into_iter()
        //            .unzip();
        let map = block
            .for_
            .iter()
            .map(|(var, values)| match self.eval_list_or_string(values) {
                Ok(value) => Ok((var.clone(), value)),
                Err(e) => Err(e),
            })
            .collect::<Result<HashMap<_, _>, _>>()?;

        if self.debug {
            eprintln!("Repeat {:?}", map);
        }

        let mut messages = vec![];
        let mut trace = vec![];
        if let Some(n) = map.iter().map(|(_, v)| v.len()).min() {
            for iter in 0..n {
                let scope: HashMap<String, Value> = map
                    .iter()
                    .map(|(k, v)| (k.clone(), v[iter].clone()))
                    .collect();
                self.extend_scope_with_map(scope);
                let (ms, t) = self.run_quiet(&block.repeat, context.clone()).await?;
                messages.extend(ms);
                trace.push(t);
                self.scope.pop();
            }
        }

        Ok((messages, PdlBlock::Repeat(block.clone())))
    }

    fn to_ollama_role(&self, role: &Role) -> MessageRole {
        match role {
            Role::User => MessageRole::User,
            Role::Assistant => MessageRole::Assistant,
            Role::System => MessageRole::Assistant,
            Role::Tool => MessageRole::Tool,
        }
    }

    fn parse_result(
        &self,
        parser: &PdlParser,
        result: &String,
    ) -> Result<Value, Box<dyn Error + Send + Sync>> {
        match parser {
            PdlParser::Json => Ok(from_str(result)?),
        }
    }

    fn extend_scope_with_map(&mut self, new_scope: HashMap<String, Value>) {
        self.scope.push(new_scope);
    }

    fn extend_scope_with_json_map(&mut self, new_scope: Map<String, Value>) {
        let mut scope = self.scope.last().unwrap_or(&HashMap::new()).clone();
        // TODO figure out iterators
        scope.extend(new_scope.into_iter().collect::<HashMap<String, Value>>());
        self.extend_scope_with_map(scope);
    }

    fn extend_scope_with_block_map(&mut self, map: &Option<HashMap<String, PdlBlock>>) {
        let cur_scope = self.scope.last().unwrap_or(&HashMap::new()).clone();
        let new_scope = match map {
            Some(defs) => {
                // this is all non-optimal
                let mut scope: Scope = HashMap::from(cur_scope);
                scope.extend(defs.iter().map(|(var, def)| {
                    (
                        var.clone(),
                        from_str(to_string(def).unwrap().as_str()).unwrap(),
                    )
                }));
                scope
            }
            None => cur_scope,
        };

        self.extend_scope_with_map(new_scope);
    }

    // Run a PdlBlock::Text
    async fn run_text(&mut self, block: &TextBlock, context: Context) -> Interpretation {
        if self.debug {
            eprintln!(
                "Text {:?}",
                block
                    .description
                    .clone()
                    .unwrap_or("<no description>".to_string())
            );
        }

        let mut input_messages = context.clone();
        let mut output_messages = vec![];
        let mut output_blocks = vec![];

        self.extend_scope_with_block_map(&block.defs);
        let mut iter = block.text.iter();
        while let Some(block) = iter.next() {
            // run each element of the Text block
            let (this_messages, trace) = self.run(&block, input_messages.clone()).await?;
            input_messages.extend(this_messages.clone());
            output_messages.extend(this_messages);
            output_blocks.push(trace);
        }
        self.scope.pop();

        let mut trace = block.clone();
        trace.text = output_blocks;

        let result_string = output_messages
            .iter()
            .map(|m| m.content.clone())
            .collect::<Vec<_>>()
            .join("\n");

        if let Some(def) = &block.def {
            let result = if let Some(parser) = &block.parser {
                self.parse_result(parser, &result_string)?
            } else {
                Value::from(result_string.clone()) // TODO
            };

            if let Some(scope) = self.scope.last_mut() {
                if self.debug {
                    eprintln!("Def {} -> {}", def, result);
                }
                scope.insert(def.clone(), result);
            }
        }

        Ok((
            match &block.role {
                Some(role) => vec![ChatMessage::new(self.to_ollama_role(role), result_string)],
                None => output_messages,
            },
            PdlBlock::Text(trace),
        ))
    }
}

pub async fn run(program: &PdlBlock, debug: bool) -> Interpretation {
    let mut interpreter = Interpreter::new();
    interpreter.debug = debug;
    interpreter.run(&program, vec![]).await
}

pub fn run_sync(program: &PdlBlock, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run(program, debug))
        .map_err(|err| Box::<dyn ::std::error::Error>::from(err.to_string()))
}

pub async fn run_file(source_file_path: &str, debug: bool) -> Interpretation {
    run(&from_reader(File::open(source_file_path)?)?, debug).await
}

pub fn run_file_sync(source_file_path: &str, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run_file(source_file_path, debug))
        .map_err(|err| Box::<dyn ::std::error::Error>::from(err.to_string()))
}

pub async fn run_string(source: &str, debug: bool) -> Interpretation {
    run(&from_yaml_str(source)?, debug).await
}

pub async fn run_json(source: Value, debug: bool) -> Interpretation {
    run_string(&to_string(&source)?, debug).await
}

pub fn run_json_sync(source: Value, debug: bool) -> InterpretationSync {
    tauri::async_runtime::block_on(run_json(source, debug))
        .map_err(|err| Box::<dyn ::std::error::Error>::from(err.to_string()))
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
