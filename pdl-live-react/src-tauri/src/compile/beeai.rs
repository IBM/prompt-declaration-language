use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::ffi::OsStr;
use ::std::fs::File;
use ::std::io::BufReader;
use ::std::path::{Path, PathBuf};

use duct::cmd;
use futures::executor::block_on;
use serde::Deserialize;
use serde_json::{Map, Value, from_reader, json, to_string};
use tempfile::Builder;

use crate::pdl::ast::{
    ArrayBlockBuilder, Block, Body::*, CallBlock, EvalsTo, Expr, FunctionBlock, ListOrString,
    MessageBlock, MetadataBuilder, ModelBlockBuilder, ObjectBlock, PdlBaseType, PdlBlock,
    PdlBlock::Advanced, PdlOptionalType, PdlParser, PdlType, PythonCodeBlock, RepeatBlock, Role,
    TextBlock, TextBlockBuilder,
};
use crate::pdl::pip::pip_install_if_needed;
use crate::pdl::requirements::BEEAI_FRAMEWORK;

macro_rules! zip {
    ($x: expr) => ($x);
    ($x: expr, $($y: expr), +) => (
        $x.into_iter().zip(
            zip!($($y), +))
    )
}

#[derive(Deserialize, Debug)]
struct BeeAiInputStateDict {
    prompt: Option<String>,
    // expected_output: Option<String>,
}
#[derive(Deserialize, Debug)]
struct BeeAiInputState {
    #[serde(rename = "__dict__")]
    dict: BeeAiInputStateDict,
}
#[derive(Deserialize, Debug)]
struct BeeAiInput {
    #[serde(rename = "py/state")]
    state: BeeAiInputState,
}
/*#[derive(Deserialize, Debug)]
struct JsonSchemaParameter {
    #[serde(rename = "type")]
    parameter_type: String,
    description: String,
    title: String,
}*/
#[derive(Deserialize, Debug)]
struct BeeAiToolSchema {
    properties: HashMap<String, Value>,
}
#[derive(Deserialize, Debug)]
struct BeeAiToolState {
    name: String,
    description: Option<String>,
    input_schema: BeeAiToolSchema,
    // options: Option<HashMap<String, Value>>,
}
#[derive(Deserialize, Debug)]
struct BeeAiTool {
    #[serde(rename = "py/object")]
    object: String,
    #[serde(rename = "py/state")]
    state: BeeAiToolState,
}
#[derive(Deserialize, Debug)]
struct BeeAiLlmParametersState {
    #[serde(rename = "__dict__")]
    dict: HashMap<String, Value>,
}
#[derive(Deserialize, Debug)]
struct BeeAiLlmParameters {
    #[serde(rename = "py/state")]
    state: BeeAiLlmParametersState,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateAgentMetadataStateDict {
    name: String,
    description: String,
    //extra_description: String,
    llm_provider_id: String,
    llm_model_id: String,
    llm_parameters: BeeAiLlmParameters,
    instructions: Option<String>,
    tools: Option<Vec<BeeAiTool>>,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateAgentMetadataState {
    #[serde(rename = "__dict__")]
    dict: BeeAiWorkflowStepStateAgentMetadataStateDict,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateAgentMetadata {
    #[serde(rename = "py/state")]
    state: BeeAiWorkflowStepStateAgentMetadataState,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateDict {
    agent_metadata: BeeAiWorkflowStepStateAgentMetadata,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepState {
    #[serde(rename = "__dict__")]
    dict: BeeAiWorkflowStepStateDict,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStep {
    #[serde(rename = "py/state")]
    state: BeeAiWorkflowStepState,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowInner {
    #[serde(rename = "_name")]
    name: String,
    #[serde(rename = "_steps")]
    steps: HashMap<String, BeeAiWorkflowStep>,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflow {
    workflow: BeeAiWorkflowInner,
}
#[derive(Deserialize, Debug)]
struct BeeAiProgram {
    inputs: Vec<BeeAiInput>,
    workflow: BeeAiWorkflow,
}

fn a_tool(tool: &BeeAiToolState) -> Value {
    json!({
        "type": "function",
        "function": json!({
            "name": tool.name,
            "description": tool.description,
            "parameters": json!({
                "type": "object",
                "properties": strip_nulls(&tool.input_schema.properties),
            }),
            // "options": tool.options
        })
    })
}

// Strip null values out of the given HashMap
fn strip_nulls(parameters: &HashMap<String, Value>) -> HashMap<String, Value> {
    parameters
        .into_iter()
        .filter_map(|(k, v)| match v {
            Value::Null => None,
            Value::Object(m) => Some((k.clone(), Value::Object(strip_nulls2(m)))),
            _ => Some((k.clone(), v.clone())),
        })
        .collect()
}
// sigh, i need to figure out generics IntoIterator, FromIterator
fn strip_nulls2(parameters: &Map<String, Value>) -> Map<String, Value> {
    parameters
        .into_iter()
        .filter_map(|(k, v)| match v {
            Value::Null => None,
            Value::Object(m) => Some((k.clone(), Value::Object(strip_nulls2(&m)))),
            _ => Some((k.clone(), v.clone())),
        })
        .collect()
}

fn with_tools(
    tools: &Option<Vec<BeeAiTool>>,
    parameters: &HashMap<String, Value>,
) -> HashMap<String, Value> {
    match tools {
        Some(tools) => {
            match tools.len() {
                0 => strip_nulls(parameters), // Note: litellm barfs on tools: []
                _ => {
                    let mut copy = strip_nulls(parameters);
                    copy.insert(
                        "tools".to_string(),
                        tools.into_iter().map(|tool| a_tool(&tool.state)).collect(),
                    );
                    copy
                }
            }
        }
        _ => strip_nulls(parameters),
    }
}

fn call_tools(model: &String, parameters: &HashMap<String, Value>) -> PdlBlock {
    let repeat = Advanced(Block {
        metadata: Some(
            MetadataBuilder::default()
                .description("Calling tool ${ tool.function.name }".to_string())
                .build()
                .unwrap(),
        ),

        body: Text(TextBlock {
            role: None,
            parser: None,
            text: vec![Advanced(Block {
                metadata: None,
                body: Model(
                    ModelBlockBuilder::default()
                        .model(model.as_str())
                        .parameters(strip_nulls(parameters))
                        .input(Advanced(Block {
                            metadata: None,
                            body: Array(
                                ArrayBlockBuilder::default()
                                    .array(vec![Advanced(Block {
                                        metadata: None,
                                        body: Message(MessageBlock {
                                            role: Role::Tool,
                                            defsite: None,
                                            name: Some("${ tool.function.name }".to_string()),
                                            tool_call_id: Some("${ tool.id }".to_string()),
                                            content: Box::new(Advanced(Block {
                                                metadata: Some(
                                                    MetadataBuilder::default()
                                                        .defs(json_loads(
                                                            &"args",
                                                            &"pdl__args",
                                                            &"${ tool.function.arguments }",
                                                        ))
                                                        .build()
                                                        .unwrap(),
                                                ),

                                                body: Call(CallBlock {
                                                    call: EvalsTo::Jinja(
                                                        "${ pdl__tools[tool.function.name] }"
                                                            .to_string(),
                                                    ), // look up tool in tool_declarations def (see below)
                                                    args: Some("${ args }".into()), // invoke with arguments as specified by the model
                                                    pdl_trace: None,
                                                }),
                                            })),
                                        }),
                                    })])
                                    .build()
                                    .unwrap(),
                            ),
                        }))
                        .build()
                        .unwrap(),
                ),
            })],
        }),
    });

    let mut for_ = HashMap::new();
    for_.insert(
        "tool".to_string(),
        EvalsTo::Expr(Expr {
            pdl_expr: ListOrString::String(
                "${ response.choices[0].message.tool_calls }".to_string(),
            ),
            pdl_result: None,
        }),
    );

    // response.choices[0].message.tool_calls
    Advanced(Block {
        metadata: None,
        body: Repeat(RepeatBlock {
            for_: for_,
            repeat: Box::new(repeat),
            join: None,
        }),
    })
}

fn json_loads(
    outer_name: &str,
    inner_name: &str,
    value: &str,
) -> indexmap::IndexMap<String, PdlBlock> {
    let mut m = indexmap::IndexMap::new();
    m.insert(
        outer_name.to_owned(),
        Advanced(Block {
            metadata: Some(
                MetadataBuilder::default()
                    .description(format!("Parsing json for {}={}", inner_name, value))
                    .build()
                    .unwrap(),
            ),

            body: Text(
                TextBlockBuilder::default()
                    .text(vec![PdlBlock::String(format!(
                        "{{\"{}\": {}}}",
                        inner_name, value
                    ))])
                    .parser(PdlParser::Json)
                    .build()
                    .unwrap(),
            ),
        }),
    );
    m
}

fn json_schema_type_to_pdl_type(spec: &Value) -> PdlType {
    match spec.get("type") {
        Some(Value::String(t)) => {
            let base = match t.as_str() {
                "string" => PdlBaseType::Str,
                "boolean" => PdlBaseType::Bool,
                "integer" => PdlBaseType::Int,
                "null" => PdlBaseType::Null,
                x => {
                    eprintln!("Warning: unhandled JSONSchema type mapping to PDL {:?}", x);
                    PdlBaseType::Null
                }
            };
            match spec.get("default") {
                Some(_) => PdlType::Optional(PdlOptionalType { optional: base }),
                _ => PdlType::Base(base),
            }
        }
        _ => match spec.get("anyOf") {
            Some(Value::Array(a)) => {
                let types = a
                    .into_iter()
                    .map(json_schema_type_to_pdl_type)
                    .collect::<Vec<_>>();
                match types.as_slice() {
                    [PdlType::Base(t), PdlType::Base(PdlBaseType::Null)] => {
                        PdlType::Optional(PdlOptionalType {
                            optional: t.clone(),
                        })
                    }
                    x => {
                        eprintln!("Warning: unhandled JSONSchema type mapping to PDL {:?}", x);
                        PdlType::Base(PdlBaseType::Null)
                    }
                }
            }
            x => {
                eprintln!("Warning: unhandled JSONSchema type mapping to PDL {:?}", x);
                PdlType::Base(PdlBaseType::Null)
            }
        },
    }
}

fn json_schema_to_pdl(properties: &HashMap<String, Value>) -> HashMap<String, PdlType> {
    properties
        .into_iter()
        .map(|(arg, spec)| (arg.clone(), json_schema_type_to_pdl_type(&spec)))
        .collect::<HashMap<_, _>>()
}

fn pdl_args_schema(schema: HashMap<String, PdlType>) -> HashMap<String, PdlType> {
    let mut m = HashMap::new();
    m.insert("pdl__args".to_owned(), PdlType::Object(schema));
    m
}

fn tool_imports(object: &String) -> (&str, &str) {
    // e.g. object=beeai_framework.tools.search.wikipedia.WikipediaTool
    match object.rfind('.') {
        Some(n) => (&object[0..n], &object[n + 1..]),
        _ => (&object[..], &object[..]), // TODO
    }
}

fn python_source_to_json(source_file_path: &str, debug: bool) -> Result<PathBuf, Box<dyn Error>> {
    if debug {
        eprintln!("Compiling from Python source");
    }
    let bin_path = block_on(pip_install_if_needed(&BEEAI_FRAMEWORK))?;

    let dry_run_file_path = Builder::new()
        .prefix(&"pdl-bee")
        .suffix(".json")
        .tempfile()?;
    let (_f, dry_run_file) = dry_run_file_path.keep()?;

    let args = vec![source_file_path];

    cmd(bin_path.join("python"), &args)
        .env("DRY_RUN", "True")
        .env("DRY_RUN_FILE", &dry_run_file)
        .stdout_null()
        .run()?;

    if debug {
        eprintln!(
            "Finished generating BeeAi JSON snapshot to {:?}",
            &dry_run_file
        )
    }
    Ok(dry_run_file)
}

pub fn compile(source_file_path: &str, debug: bool) -> Result<PdlBlock, Box<dyn Error>> {
    let file = match Path::new(source_file_path)
        .extension()
        .and_then(OsStr::to_str)
    {
        Some("py") => {
            let json_snapshot_file = python_source_to_json(source_file_path, debug)?;
            File::open(json_snapshot_file)
        }
        _ => {
            if debug {
                eprintln!("Compiling from JSON snapshot");
            }
            File::open(source_file_path)
        }
    }?;

    // Read the JSON contents of the file as a BeeAIProgram
    let reader = BufReader::new(file);
    let bee: BeeAiProgram = from_reader(reader)?;

    let inputs: Vec<PdlBlock> = bee
        .inputs
        .into_iter()
        .map(|input| input.state.dict.prompt)
        .flatten()
        .map(|prompt| PdlBlock::String(format!("{}\n", prompt)))
        .collect::<Vec<_>>();

    let tool_declarations = bee
        .workflow
        .workflow
        .steps
        .values()
        .filter_map(|step| step.state.dict.agent_metadata.state.dict.tools.as_ref())
        .flat_map(|tools| {
            tools
                .into_iter()
                .map(|BeeAiTool { object, state }| {
                    (
                        tool_imports(object),
                        state.name.clone(),
                        pdl_args_schema(json_schema_to_pdl(&state.input_schema.properties)),
                    )
                })
                .map(|((import_from, import_fn), tool_name, schema)| {
                    (
                        tool_name.clone(),
                        PdlBlock::Function(FunctionBlock {
                            function: schema,
                            return_: Box::new(Advanced(Block {
                                metadata: None,
                                body: PythonCode(PythonCodeBlock {
                                    // tool function definition
                                    lang: "python".to_string(),
                                    code: format!(
                                        "
from {} import {}
import asyncio
async def invoke():
    global result
    {}
    tool = {}()
    output = await tool.run(pdl__args)
    result = output.get_text_content()
    {}
asyncio.run(invoke())
",
                                        import_from,
                                        import_fn,
                                        if debug {
                                            format!("print('Invoking tool {}')", tool_name)
                                        } else {
                                            "".to_string()
                                        },
                                        import_fn,
                                        if debug {
                                            format!(
                                                "print(f'Response from tool {}: {{result}}')",
                                                tool_name
                                            )
                                        } else {
                                            "".to_string()
                                        }
                                    ),
                                }),
                            })),
                        }),
                    )
                })
        })
        .collect::<HashMap<_, _>>();

    let model_calls = bee
        .workflow
        .workflow
        .steps
        .into_values()
        .map(|step| {
            (
                step.state.dict.agent_metadata.state.dict.name,
                step.state.dict.agent_metadata.state.dict.description,
                step.state.dict.agent_metadata.state.dict.tools,
                step.state.dict.agent_metadata.state.dict.llm_provider_id,
                step.state.dict.agent_metadata.state.dict.llm_model_id,
                step.state.dict.agent_metadata.state.dict.llm_parameters,
                step.state.dict.agent_metadata.state.dict.instructions,
            )
        })
        .map(
            |(agent_name, description, tools, provider, model, parameters, instructions)| {
                let mut model_call = vec![];
                let model = format!("{}/{}", provider, model);

                if let Some(instructions) = instructions {
                    model_call.push(Advanced(Block {
                        metadata: Some(
                            MetadataBuilder::default()
                                .description("Model instructions".to_string())
                                .build()
                                .unwrap(),
                        ),
                        body: Text(TextBlock {
                            role: Some(Role::System),
                            text: vec![PdlBlock::String(instructions)],
                            parser: None,
                        }),
                    }));
                }

                let mut model_builder = ModelBlockBuilder::default();
                model_builder
                    .model(model.clone())
                    .parameters(with_tools(&tools, &parameters.state.dict));

                if let Some(tools) = &tools {
                    if tools.len() > 0 {
                        // then we want the model response as a
                        // "response" variable, so we can scan for
                        // tool calls
                        model_builder.model_response("response".to_string());
                    }
                }

                model_call.push(Advanced(Block {
                    metadata: Some(
                        MetadataBuilder::default()
                            .description(description)
                            .build()
                            .unwrap(),
                    ),
                    body: Model(model_builder.build().unwrap()),
                }));

                if let Some(tools) = tools {
                    if tools.len() > 0 {
                        model_call.push(call_tools(&model, &parameters.state.dict));
                    }
                }

                let closure_name = format!("agent_closure_{}", agent_name);
                let mut defs = indexmap::IndexMap::new();
                defs.insert(
                    closure_name.clone(),
                    PdlBlock::Function(FunctionBlock {
                        function: HashMap::new(),
                        return_: Box::new(Advanced(Block {
                            metadata: Some(
                                MetadataBuilder::default()
                                    .description(format!("Model call {}", &model))
                                    .build()
                                    .unwrap(),
                            ),
                            body: Text(TextBlock {
                                role: None,
                                parser: None,
                                text: model_call,
                            }),
                        })),
                    }),
                );
                Advanced(Block {
                    metadata: Some(
                        MetadataBuilder::default()
                            .description("Model call wrapper".to_string())
                            .defs(defs)
                            .build()
                            .unwrap(),
                    ),
                    body: Text(TextBlock {
                        role: None,
                        parser: None,
                        text: vec![Advanced(Block {
                            metadata: None,
                            body: Call(CallBlock::new(format!("${{ {} }}", closure_name))),
                        })],
                    }),
                })
            },
        )
        .collect::<Vec<_>>();

    let body = zip!(inputs, model_calls)
        .flat_map(|(a, b)| [a, b])
        .collect::<Vec<_>>();

    let mut metadata = MetadataBuilder::default();
    metadata.description(bee.workflow.workflow.name);
    if tool_declarations.len() > 0 {
        let mut defs = indexmap::IndexMap::new();
        defs.insert(
            "pdl__tools".to_string(),
            Advanced(Block {
                metadata: None,
                body: Object(ObjectBlock {
                    object: tool_declarations,
                }),
            }),
        );
        metadata.defs(defs);
    }

    let pdl: PdlBlock = Advanced(Block {
        metadata: Some(metadata.build().unwrap()),
        body: Text(TextBlock {
            role: None,
            parser: None,
            text: body,
        }),
    });

    Ok(pdl)
}

pub fn compile_to_file(
    source_file_path: &str,
    output_path: &str,
    debug: bool,
) -> Result<(), Box<dyn Error>> {
    if debug {
        eprintln!("Compiling beeai {} to {}", source_file_path, output_path);
    }

    let pdl = compile(source_file_path, debug)?;

    match output_path {
        "-" => println!("{}", to_string(&pdl)?),
        _ => {
            ::std::fs::write(output_path, to_string(&pdl)?)?;
        }
    }

    Ok(())
}
