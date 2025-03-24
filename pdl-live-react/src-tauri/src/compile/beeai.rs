use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::fs::File;
use ::std::io::BufReader;

use serde::{Deserialize, Serialize};
use serde_json::{from_reader, to_string, Value};

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
#[derive(Deserialize, Debug)]
struct BeeAiTool {
    //#[serde(rename = "py/object")]
    //tool: String,
    //options: Option<String>, // TODO maybe more general than String?
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
struct BeeAiLlmSettings {
    api_key: String,
    // base_url: String,
}
#[derive(Deserialize, Debug)]
struct BeeAiLlm {
    // might be helpful to know it's Ollama?
    //#[serde(rename = "py/object")]
    //object: String,
    parameters: BeeAiLlmParameters,

    #[serde(rename = "_model_id")]
    model_id: String,
    //#[serde(rename = "_litellm_provider_id")]
    //provider_id: String,
    #[serde(rename = "_settings")]
    settings: BeeAiLlmSettings,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateMeta {
    //name: String,
    role: String,
    llm: BeeAiLlm,
    instructions: Option<String>,
    //tools: Option<Vec<BeeAiTool>>,
}
#[derive(Deserialize, Debug)]
struct BeeAiWorkflowStepStateDict {
    meta: BeeAiWorkflowStepStateMeta,
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

#[derive(Serialize, Debug)]
#[serde(untagged)]
enum PdlBlock {
    String(String),
    Text {
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        role: Option<String>,
        text: Vec<PdlBlock>,
    },
    Model {
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
        model: String,
        parameters: HashMap<String, Value>,
    },
}

pub fn compile(source_file_path: &String, output_path: &String) -> Result<(), Box<dyn Error>> {
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

    let system_prompts = bee
        .workflow
        .workflow
        .steps
        .values()
        .filter_map(|step| step.state.dict.meta.instructions.clone())
        .map(|instructions| PdlBlock::Text {
            role: Some(String::from("system")),
            text: vec![PdlBlock::String(instructions)],
            description: None,
        })
        .collect::<Vec<_>>();

    let model_calls = bee
        .workflow
        .workflow
        .steps
        .into_values()
        .map(|step| (step.state.dict.meta.role, step.state.dict.meta.llm))
        .map(|(role, llm)| PdlBlock::Model {
            description: Some(role),
            model: format!("{}/{}", llm.settings.api_key, llm.model_id),
            parameters: llm.parameters.state.dict,
        })
        .collect::<Vec<_>>();

    let pdl: PdlBlock = PdlBlock::Text {
        description: Some(bee.workflow.workflow.name),
        role: None,
        text: zip!(inputs, system_prompts, model_calls)
            .map(|(a, (b, c))| [a, b, c])
            .flatten()
            .collect(),
    };

    match output_path.as_str() {
        "-" => println!("{}", to_string(&pdl)?),
        _ => {
            ::std::fs::write(output_path, to_string(&pdl)?)?;
        }
    }

    Ok(())
}
