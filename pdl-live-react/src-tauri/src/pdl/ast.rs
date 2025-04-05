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
    Jsonl,*/
    #[serde(rename = "yaml")]
    Yaml,
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

/// Call a function
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CallBlock {
    /// Function to call
    pub call: String,

    /// Arguments of the function with their values
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<HashMap<String, PdlBlock>>,
}

impl CallBlock {
    pub fn new(call: String) -> Self {
        CallBlock {
            call: call,
            args: None,
            defs: None,
        }
    }
}

/// Create the concatenation of the stringify version of the result of
/// each block of the list of blocks.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TextBlock {
    /// Body of the text
    pub text: Vec<PdlBlock>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<HashMap<String, PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,
}

impl TextBlock {
    pub fn new(text: Vec<PdlBlock>) -> Self {
        TextBlock {
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

impl From<Vec<PdlBlock>> for TextBlock {
    fn from(v: Vec<PdlBlock>) -> Self {
        TextBlock::new(v).build()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FunctionBlock {
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
pub struct ModelBlock {
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

impl ModelBlock {
    pub fn new(model: &str) -> Self {
        ModelBlock {
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
#[serde(untagged)]
pub enum ListOrString {
    String(String),
    List(Vec<Value>),
}

/// Repeat the execution of a block.
///
/// For loop example:
/// ```PDL
/// for:
///     number: [1, 2, 3, 4]
///     name: ["Bob", "Carol", "David", "Ernest"]
/// repeat:
///     "${ name }'s number is ${ number }\\n"
/// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RepeatBlock {
    /// Arrays to iterate over
    #[serde(rename = "for")]
    pub for_: HashMap<String, ListOrString>,

    /// Body of the loop
    pub repeat: Box<PdlBlock>,
}

/// Create a message
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MessageBlock {
    /// Role of associated to the message, e.g. User or Assistant
    pub role: Role,

    /// Content of the message
    pub content: Box<PdlBlock>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// For example, the name of the tool that was invoked, for which this message is the tool response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    /// The id of the tool invocation for which this message is the tool response
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_call_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ObjectBlock {
    pub object: HashMap<String, PdlBlock>,
}

/// Execute a piece of Python code.
///
/// Example:
/// ```yaml
/// lang: python
/// code: |
///     import random
///     # (In PDL, set `result` to the output you wish for your code block.)
///     result = random.randint(1, 20)
/// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PythonCodeBlock {
    pub lang: String,
    pub code: String,
}

/// Read from a file or standard input.
///
/// Example. Read from the standard input with a prompt starting with `> `.
/// ```PDL
/// read:
/// message: "> "
/// ```
///
/// Example. Read the file `./data.yaml` in the same directory of the PDL file containing the block and parse it into YAML.
/// ```PDL
/// read: ./data.yaml
/// parser: yaml
/// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReadBlock {
    /// Name of the file to read. If `None`, read the standard input.
    pub read: Value,

    /// Name of the file to read. If `None`, read the standard input.
    pub message: Option<String>,

    /// Indicate if one or multiple lines should be read.
    pub multiline: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum StringOrBoolean {
    String(String),
    Boolean(bool),
}

/// Conditional control structure.
///
/// Example:
/// ```PDL
/// defs:
///   answer:
///     read:
///     message: "Enter a number? "
/// if: ${ (answer | int) == 42 }
/// then: You won!
/// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IfBlock {
    /// The condition to check
    #[serde(rename = "if")]
    pub condition: StringOrBoolean,

    /// Branch to execute if the condition is true
    pub then: Box<PdlBlock>,

    /// Branch to execute if the condition is false.
    #[serde(rename = "else")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub else_: Option<Box<PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<HashMap<String, PdlBlock>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlBlock {
    Bool(bool),
    Number(Number),
    String(String),
    If(IfBlock),
    Object(ObjectBlock),
    Call(CallBlock),
    Array { array: Vec<PdlBlock> },
    Message(MessageBlock),
    Repeat(RepeatBlock),
    Text(TextBlock),
    Model(ModelBlock),
    Function(FunctionBlock),
    PythonCode(PythonCodeBlock),
    Read(ReadBlock),
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
