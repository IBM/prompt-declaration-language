use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::fs::File;
use ::std::io::BufReader;

use serde::Deserialize;
use serde_json::{from_reader, json, to_string, Value};

use crate::interpreter::ast::{PdlBaseType, PdlBlock, PdlOptionalType, PdlParser, PdlType};

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
    options: Option<HashMap<String, Value>>,
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
                "properties": tool.input_schema.properties,
            }),
            "options": tool.options
        })
    })
}

fn with_tools(
    tools: &Option<Vec<BeeAiTool>>,
    parameters: &HashMap<String, Value>,
) -> HashMap<String, Value> {
    match tools {
        Some(tools) => {
            match tools.len() {
                0 => parameters.clone(), // litellm barfs on tools: []
                _ => {
                    let mut copy = parameters.clone();
                    copy.insert(
                        "tools".to_string(),
                        tools.into_iter().map(|tool| a_tool(&tool.state)).collect(),
                    );
                    copy
                }
            }
        }
        _ => parameters.clone(),
    }
}

fn call_tools(model: &String, parameters: &HashMap<String, Value>) -> PdlBlock {
    let repeat = PdlBlock::Text {
        defs: None,
        role: None,
        parser: None,
        description: Some("Calling tool ${ tool.function.name }".to_string()),
        text: vec![PdlBlock::Model {
            parameters: parameters.clone(),
            description: None, /*Some(
                                   "Sending tool ${ tool.function.name } response back to model".to_string(),
                               ),*/
            def: None,
            model_response: None,
            model: model.clone(),
            input: Some(Box::new(PdlBlock::Array {
                array: vec![PdlBlock::Message {
                    role: "tool".to_string(),
                    description: None,
                    name: Some("${ tool.function.name }".to_string()),
                    tool_call_id: Some("${ tool.id }".to_string()),
                    content: Box::new(PdlBlock::Call {
                        defs: json_loads(&"args", &"pdl__args", &"${ tool.function.arguments }"),
                        call: "${ pdl__tools[tool.function.name] }".to_string(), // look up tool in tool_declarations def (see below)
                        args: Some("${ args }".to_string()), // invoke with arguments as specified by the model
                    }),
                }],
            })),
        }],
    };

    let mut for_ = HashMap::new();
    for_.insert(
        "tool".to_string(),
        "${ response.choices[0].message.tool_calls }".to_string(),
    );

    // response.choices[0].message.tool_calls
    PdlBlock::Repeat {
        for_: for_,
        repeat: Box::new(repeat),
    }
}

fn json_loads(
    outer_name: &str,
    inner_name: &str,
    value: &str,
) -> Option<HashMap<String, PdlBlock>> {
    let mut m = HashMap::new();
    m.insert(
        outer_name.to_owned(),
        PdlBlock::Text {
            defs: None,
            role: None,
            description: Some(format!("Parsing json for {}={}", inner_name, value)),
            text: vec![PdlBlock::String(format!(
                "{{\"{}\": {}}}",
                inner_name, value
            ))],
            parser: Some(PdlParser::Json),
        },
    );
    Some(m)
}

fn json_schema_type_to_pdl_type(spec: &Value) -> PdlType {
    match spec.get("type") {
        Some(Value::String(t)) => {
            let base = match t.as_str() {
                "string" => PdlBaseType::Str,
                "boolean" => PdlBaseType::Bool,
                "integer" => PdlBaseType::Int,
                "null" => PdlBaseType::Null,
                _ => PdlBaseType::Null,
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
                    _ => PdlType::Base(PdlBaseType::Null),
                }
            }
            _ => PdlType::Base(PdlBaseType::Null),
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

pub fn compile(
    source_file_path: &String,
    output_path: &String,
    debug: &bool,
) -> Result<(), Box<dyn Error>> {
    println!("Compiling beeai {} to {}", source_file_path, output_path);

    // Open the file in read-only mode with buffer.
    let file = File::open(source_file_path)?;
    let reader = BufReader::new(file);

    // Read the JSON contents of the file as an instance of `User`.
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
                        PdlBlock::Function {
                            return_: Box::new(PdlBlock::PythonCode {
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
                                    if *debug {
                                        format!("print('Invoking tool {}')", tool_name)
                                    } else {
                                        "".to_string()
                                    },
                                    import_fn,
                                    if *debug {
                                        format!(
                                            "print(f'Response from tool {}: {{result}}')",
                                            tool_name
                                        )
                                    } else {
                                        "".to_string()
                                    }
                                ),
                            }),
                            function: schema,
                        },
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
                    model_call.push(PdlBlock::Text {
                        role: Some(String::from("system")),
                        text: vec![PdlBlock::String(instructions)],
                        defs: None,
                        parser: None,
                        description: None,
                    });
                }

                let model_response = if let Some(tools) = &tools {
                    match tools.len() {
                        0 => None,
                        _ => Some("response".to_string()),
                    }
                } else {
                    None
                };

                model_call.push(PdlBlock::Model {
                    input: None,
                    description: Some(description),
                    def: None,
                    model: model.clone(),
                    model_response: model_response,
                    parameters: with_tools(&tools, &parameters.state.dict),
                });

                if let Some(tools) = tools {
                    if tools.len() > 0 {
                        model_call.push(call_tools(&model, &parameters.state.dict));
                    }
                }

                let closure_name = format!("agent_closure_{}", agent_name);
                let mut defs = HashMap::new();
                defs.insert(
                    closure_name.clone(),
                    PdlBlock::Function {
                        function: HashMap::new(),
                        return_: Box::new(PdlBlock::Text {
                            defs: None,
                            role: None,
                            parser: None,
                            description: None,
                            text: model_call,
                        }),
                    },
                );
                PdlBlock::Text {
                    defs: Some(defs),
                    role: None,
                    parser: None,
                    description: Some("Model call wrapper".to_string()),
                    text: vec![PdlBlock::Call {
                        call: format!("${{ {} }}", closure_name),
                        defs: None,
                        args: None,
                    }],
                }
            },
        )
        .collect::<Vec<_>>();

    let body = zip!(inputs, model_calls)
        .flat_map(|(a, b)| [a, b])
        .collect::<Vec<_>>();

    let pdl: PdlBlock = PdlBlock::Text {
        defs: if tool_declarations.len() == 0 {
            None
        } else {
            let mut m = HashMap::new();
            m.insert(
                "pdl__tools".to_string(),
                PdlBlock::Object {
                    object: tool_declarations,
                },
            );
            Some(m)
        },
        description: Some(bee.workflow.workflow.name),
        role: None,
        parser: None,
        text: body,
    };

    match output_path.as_str() {
        "-" => println!("{}", to_string(&pdl)?),
        _ => {
            ::std::fs::write(output_path, to_string(&pdl)?)?;
        }
    }

    Ok(())
}
