use ::std::collections::HashMap;
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
use serde_json::{to_string, Number, Value};

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
    pub defs: Option<IndexMap<String, PdlBlock>>,
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

pub trait SequencingBlock {
    fn kind(&self) -> &str;
    fn description(&self) -> &Option<String>;
    fn role(&self) -> &Option<Role>;
    fn def(&self) -> &Option<String>;
    fn defs(&self) -> &Option<IndexMap<String, PdlBlock>>;
    fn items(&self) -> &Vec<PdlBlock>;
    fn with_items(&self, items: Vec<PdlBlock>) -> Self;
    fn parser(&self) -> &Option<PdlParser>;
    fn to_block(&self) -> PdlBlock;
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult;
    fn messages_for<T: Clone>(&self, output_messages: Vec<T>) -> Vec<T>;
}

/// Return the value of the last block if the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LastOfBlock {
    /// Sequence of blocks to execute
    #[serde(rename = "lastOf")]
    pub last_of: Vec<PdlBlock>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<IndexMap<String, PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,
}
impl SequencingBlock for LastOfBlock {
    fn kind(&self) -> &str {
        "lastOf"
    }
    fn description(&self) -> &Option<String> {
        &self.description
    }
    fn role(&self) -> &Option<Role> {
        &self.role
    }
    fn def(&self) -> &Option<String> {
        return &self.def;
    }
    fn defs(&self) -> &Option<IndexMap<String, PdlBlock>> {
        &self.defs
    }
    fn items(&self) -> &Vec<PdlBlock> {
        &self.last_of
    }
    fn with_items(&self, items: Vec<PdlBlock>) -> Self {
        let mut b = self.clone();
        b.last_of = items;
        b
    }
    fn parser(&self) -> &Option<PdlParser> {
        &self.parser
    }
    fn to_block(&self) -> PdlBlock {
        PdlBlock::LastOf(self.clone())
    }
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult {
        match output_results.last() {
            Some(result) => result.clone(),
            None => "".into(),
        }
    }
    fn messages_for<T: Clone>(&self, output_messages: Vec<T>) -> Vec<T> {
        match output_messages.last() {
            Some(m) => vec![m.clone()],
            None => vec![],
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
    pub defs: Option<IndexMap<String, PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,
}
impl SequencingBlock for TextBlock {
    fn kind(&self) -> &str {
        "text"
    }
    fn description(&self) -> &Option<String> {
        &self.description
    }
    fn role(&self) -> &Option<Role> {
        &self.role
    }
    fn def(&self) -> &Option<String> {
        return &self.def;
    }
    fn defs(&self) -> &Option<IndexMap<String, PdlBlock>> {
        &self.defs
    }
    fn items(&self) -> &Vec<PdlBlock> {
        &self.text
    }
    fn with_items(&self, items: Vec<PdlBlock>) -> Self {
        let mut b = self.clone();
        b.text = items;
        b
    }
    fn parser(&self) -> &Option<PdlParser> {
        &self.parser
    }
    fn to_block(&self) -> PdlBlock {
        PdlBlock::Text(self.clone())
    }
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult {
        PdlResult::String(
            output_results
                .into_iter()
                .map(|m| m.to_string())
                .collect::<Vec<_>>()
                .join("\n"),
        )
    }
    fn messages_for<T: Clone>(&self, output_messages: Vec<T>) -> Vec<T> {
        output_messages
    }
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
    pub input: Option<Box<PdlBlock>>,
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

/// Return the object where the value of each field is defined by a
/// block. If the body of the object is an array, the resulting object
/// is the union of the objects computed by each element of the array.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ObjectBlock {
    pub object: HashMap<String, PdlBlock>,
}

/// Arbitrary value, equivalent to JSON.
///
/// Example. As part of a `defs` section, set `numbers` to the list `[1, 2, 3, 4]`:
/// ```PDL
/// defs:
///   numbers:
///     data: [1, 2, 3, 4]
/// ```
///
/// Example.  Evaluate `${ TEST.answer }` in
/// [Jinja](https://jinja.palletsprojects.com/en/stable/), passing
/// the result to a regex parser with capture groups.  Set
/// `EXTRACTED_GROUND_TRUTH` to an object with attribute `answer`,
/// a string, containing the value of the capture group.
/// ```PDL
/// - data: ${ TEST.answer }
///   parser:
///     regex: "(.|\\n)*#### (?P<answer>([0-9])*)\\n*"
///     spec:
///       answer: str
///   def: EXTRACTED_GROUND_TRUTH
/// ```
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DataBlock {
    pub data: Value,

    /// Do not evaluate expressions inside strings.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
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

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum StringOrNull {
    Null,
    String(String),
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
    pub read: StringOrNull,

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
    pub defs: Option<IndexMap<String, PdlBlock>>,
}

/// Return the array of values computed by each block of the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ArrayBlock {
    /// Elements of the array
    pub array: Vec<PdlBlock>,
}

/// Include a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IncludeBlock {
    /// Name of the file to include.
    pub include: String,
}

/// Import a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ImportBlock {
    /// Name of the file to include.
    pub import: String,
}

/// Block containing only defs
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct EmptyBlock {
    pub defs: IndexMap<String, PdlBlock>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlBlock {
    Bool(bool),
    Number(Number),
    String(String),
    If(IfBlock),
    Import(ImportBlock),
    Include(IncludeBlock),
    Data(DataBlock),
    Object(ObjectBlock),
    Call(CallBlock),
    Array(ArrayBlock),
    Message(MessageBlock),
    Repeat(RepeatBlock),
    Text(TextBlock),
    LastOf(LastOfBlock),
    Model(ModelBlock),
    Function(FunctionBlock),
    PythonCode(PythonCodeBlock),
    Read(ReadBlock),

    // must be last to prevent serde from aggressively matching on it, since other block types also (may) have a `defs`
    Empty(EmptyBlock),
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

pub type Scope = HashMap<String, PdlResult>;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Closure {
    pub scope: Scope,
    pub function: FunctionBlock,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlResult {
    Number(Number),
    String(String),
    Bool(bool),
    Block(PdlBlock),
    Closure(Closure),
    List(Vec<PdlResult>),
    Dict(HashMap<String, PdlResult>),
}
impl ::std::fmt::Display for PdlResult {
    fn fmt(&self, f: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        let s = to_string(&self).unwrap(); // TODO: .map_err(|e| e.to_string())?;
        write!(f, "{}", s)
    }
}
impl From<&str> for PdlResult {
    fn from(s: &str) -> Self {
        PdlResult::String(s.to_string())
    }
}
impl From<String> for PdlResult {
    fn from(s: String) -> Self {
        PdlResult::String(s)
    }
}
impl From<&bool> for PdlResult {
    fn from(b: &bool) -> Self {
        PdlResult::Bool(*b)
    }
}
impl From<Number> for PdlResult {
    fn from(n: Number) -> Self {
        PdlResult::Number(n)
    }
}
