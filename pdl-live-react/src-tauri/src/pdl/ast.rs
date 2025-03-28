use ::std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::{Number, Value};

#[derive(Serialize, Deserialize, Debug, Clone)]
//why doesn't this work? #[serde(rename_all_fields(serialize = "lowercase"))]
pub enum Role {
    #[serde(rename = "user")]
    User,
    #[serde(rename = "assistant")]
    Assistant,
    #[serde(rename = "system")]
    System,
    #[serde(rename = "tool")]
    Tool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PdlParser {
    #[serde(rename = "json")]
    Json,
    /*#[serde(rename = "jsonl")]
    Jsonl,
    #[serde(rename = "yaml")]
    Yaml,*/
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PdlBaseType {
    #[serde(rename = "str")]
    Str,
    #[serde(rename = "bool")]
    Bool,
    #[serde(rename = "int")]
    Int,
    #[serde(rename = "null")]
    Null,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlOptionalType {
    pub optional: PdlBaseType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlType {
    Base(PdlBaseType),
    Optional(PdlOptionalType),
    Object(HashMap<String, PdlType>),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlCallBlock {
    pub call: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<HashMap<String, PdlBlock>>,
}

impl PdlCallBlock {
    pub fn new(call: String) -> Self {
        PdlCallBlock {
            call: call,
            args: None,
            defs: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlTextBlock {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,
    pub text: Vec<PdlBlock>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<HashMap<String, PdlBlock>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,
}

impl PdlTextBlock {
    pub fn new(text: Vec<PdlBlock>) -> Self {
        PdlTextBlock {
            def: None,
            defs: None,
            description: None,
            role: None,
            parser: None,
            text: text,
        }
    }

    pub fn def(&mut self, def: &str) -> &mut Self {
        self.def = Some(def.into());
        self
    }

    pub fn description(&mut self, description: String) -> &mut Self {
        self.description = Some(description);
        self
    }

    pub fn parser(&mut self, parser: PdlParser) -> &mut Self {
        self.parser = Some(parser);
        self
    }

    pub fn build(&self) -> Self {
        self.clone()
    }
}

impl From<Vec<PdlBlock>> for PdlTextBlock {
    fn from(v: Vec<PdlBlock>) -> Self {
        PdlTextBlock::new(v).build()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlFunctionBlock {
    pub function: HashMap<String, PdlType>,
    #[serde(rename = "return")]
    pub return_: Box<PdlBlock>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlUsage {
    // Completion tokens consumed
    pub completion_tokens: u64,
    // Prompt tokens consumed
    pub prompt_tokens: u64,
    // Completion nanos
    pub completion_nanos: u64,
    // Prompt nanos
    pub prompt_nanos: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlModelBlock {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parameters: Option<HashMap<String, Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input: Option<Box<PdlBlock>>, // really this should be restricted to be PdlBlock::Array; how do we do this in rust?
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "modelResponse")]
    pub model_response: Option<String>,
    #[serde(rename = "pdl__result")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pdl_result: Option<String>,
    #[serde(rename = "pdl__usage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pdl_usage: Option<PdlUsage>,
}

impl PdlModelBlock {
    pub fn new(model: &str) -> Self {
        PdlModelBlock {
            def: None,
            description: None,
            model_response: None,
            parameters: None,
            pdl_result: None,
            pdl_usage: None,
            model: model.into(),
            input: None,
        }
    }

    pub fn input(&mut self, input: PdlBlock) -> &mut Self {
        self.input = Some(Box::new(input));
        self
    }

    pub fn input_str(&mut self, input: &str) -> &mut Self {
        self.input = Some(Box::new(PdlBlock::String(input.into())));
        self
    }

    pub fn parameters(&mut self, parameters: &HashMap<String, Value>) -> &mut Self {
        self.parameters = Some(parameters.clone());
        self
    }

    pub fn build(&self) -> Self {
        self.clone()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlRepeatBlock {
    #[serde(rename = "for")]
    pub for_: HashMap<String, String>,
    pub repeat: Box<PdlBlock>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlMessageBlock {
    pub role: Role,
    pub content: Box<PdlBlock>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_call_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlObjectBlock {
    pub object: HashMap<String, PdlBlock>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlPythonCodeBlock {
    #[serde(default = "lang_python")]
    pub lang: String,
    pub code: String,
}

fn lang_python() -> String {
    "python".to_string()
}

// Read from a file or standard input.
//
// Example. Read from the standard input with a prompt starting with `> `.
// ```PDL
// read:
// message: "> "
// ```
//
// Example. Read the file `./data.yaml` in the same directory of the PDL file containing the block and parse it into YAML.
// ```PDL
// read: ./data.yaml
// parser: yaml
// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PdlReadBlock {
    // Name of the file to read. If `None`, read the standard input.
    pub read: Value,
    // Name of the file to read. If `None`, read the standard input.
    pub message: Option<String>,
    // Indicate if one or multiple lines should be read.
    pub multiline: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlBlock {
    Bool(bool),
    Number(Number),
    String(String),
    /*If {
            #[serde(rename = "if")]
            condition: String,
            then: Box<PdlBlock>,
    },*/
    Object(PdlObjectBlock),
    Call(PdlCallBlock),
    Array { array: Vec<PdlBlock> },
    Message(PdlMessageBlock),
    Repeat(PdlRepeatBlock),
    Text(PdlTextBlock),
    Model(PdlModelBlock),
    Function(PdlFunctionBlock),
    PythonCode(PdlPythonCodeBlock),
    Read(PdlReadBlock),
}

impl From<&str> for PdlBlock {
    fn from(s: &str) -> Self {
        PdlBlock::String(s.into())
    }
}

impl From<String> for PdlBlock {
    fn from(s: String) -> Self {
        PdlBlock::String(s.clone())
    }
}

impl From<&str> for Box<PdlBlock> {
    fn from(s: &str) -> Self {
        Box::new(PdlBlock::String(s.into()))
    }
}
