use ::std::collections::HashMap;
use ::std::time::{SystemTime, SystemTimeError};

use indexmap::IndexMap;
use serde::{Deserialize, Serialize};
use serde_json::{Number, Value, to_string};

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

/// Timing information
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct Timing {
    start_nanos: u128,
    end_nanos: u128,
    timezone: String,
}

/// Common metadata of blocks
#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(default)]
#[builder(setter(into, strip_option), default)]
pub struct Metadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<IndexMap<String, PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,

    #[serde(rename = "pdl__id", skip_serializing_if = "Option::is_none")]
    pub pdl_id: Option<String>,

    #[serde(rename = "pdl__result", skip_serializing_if = "Option::is_none")]
    pub pdl_result: Option<Box<PdlResult>>,

    #[serde(rename = "pdl__is_leaf", skip_serializing_if = "Option::is_none")]
    pub pdl_is_leaf: Option<bool>,

    #[serde(rename = "pdl__timing", skip_serializing_if = "Option::is_none")]
    pub pdl_timing: Option<Timing>,
}

impl Metadata {
    fn start(&mut self) -> Result<(), SystemTimeError> {
        let nanos = ::std::time::SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)?
            .as_nanos();
        if let Some(t) = &mut self.pdl_timing {
            t.start_nanos = nanos;
        } else {
            let mut t = Timing::default();
            t.start_nanos = nanos;
            self.pdl_timing = Some(t)
        }

        Ok(())
    }
}

/// Call a function
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "call")]
pub struct CallBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Function to call
    pub call: EvalsTo<String, Box<PdlResult>>,

    /// Arguments of the function with their values
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Value>,
}

impl CallBlock {
    pub fn new(call: String) -> Self {
        CallBlock {
            call: EvalsTo::Jinja(call),
            args: None,
            metadata: None,
        }
    }
}

pub trait SequencingBlock {
    fn kind(&self) -> &str;
    fn role(&self) -> &Option<Role>;
    fn metadata(&self) -> &Option<Metadata>;
    fn items(&self) -> &Vec<PdlBlock>;
    fn with_items(&self, items: Vec<PdlBlock>) -> Self;
    fn parser(&self) -> &Option<PdlParser>;
    fn to_block(&self) -> PdlBlock;
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult;
    fn messages_for<T: Clone>(&self, output_messages: &Vec<T>) -> Vec<T>;
}

/// Return the value of the last block if the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "lastOf")]
pub struct LastOfBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Sequence of blocks to execute
    #[serde(rename = "lastOf")]
    pub last_of: Vec<PdlBlock>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
}
impl SequencingBlock for LastOfBlock {
    fn kind(&self) -> &str {
        "lastOf"
    }
    fn role(&self) -> &Option<Role> {
        &self.role
    }
    fn metadata(&self) -> &Option<Metadata> {
        &self.metadata
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
        PdlBlock::Advanced(Block::LastOf(self.clone()))
    }
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult {
        match output_results.last() {
            Some(result) => result.clone(),
            None => "".into(),
        }
    }
    fn messages_for<T: Clone>(&self, output_messages: &Vec<T>) -> Vec<T> {
        match output_messages.last() {
            Some(m) => vec![m.clone()],
            None => vec![],
        }
    }
}

/// Create the concatenation of the stringify version of the result of
/// each block of the list of blocks.
#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(tag = "kind", rename = "text")]
#[builder(setter(into, strip_option), default)]
pub struct TextBlock {
    #[serde(default, flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Body of the text
    // Note: do NOT apply #[serde(default)] here. This seems to give
    // permission for the deserializer to match everything to
    // TextBlock, since ... all fields are optional/have defaults.
    pub text: Vec<PdlBlock>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
}
impl SequencingBlock for TextBlock {
    fn kind(&self) -> &str {
        "text"
    }
    fn role(&self) -> &Option<Role> {
        &self.role
    }
    fn metadata(&self) -> &Option<Metadata> {
        &self.metadata
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
        PdlBlock::Advanced(Block::Text(self.clone()))
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
    fn messages_for<T: Clone>(&self, output_messages: &Vec<T>) -> Vec<T> {
        output_messages.clone()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "function")]
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

#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(tag = "kind", rename = "model")]
#[builder(setter(into, strip_option), default)]
pub struct ModelBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parameters: Option<HashMap<String, Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input: Option<Box<PdlBlock>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "modelResponse")]
    pub model_response: Option<String>,
    #[serde(rename = "pdl__usage")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pdl_usage: Option<PdlUsage>,
}

impl ModelBlock {
    pub fn with_result(&self, result: PdlResult) -> Self {
        let mut c = self.clone();
        let mut metadata = if let Some(meta) = c.metadata {
            meta
        } else {
            Default::default()
        };
        metadata.pdl_result = Some(Box::from(result));
        c.metadata = Some(metadata);
        c
    }

    pub fn description(&self) -> Option<String> {
        self.metadata.as_ref().and_then(|m| m.description.clone())
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
#[serde(tag = "kind", rename = "repeat")]
pub struct RepeatBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Arrays to iterate over
    #[serde(rename = "for")]
    pub for_: HashMap<String, EvalsTo<ListOrString, Vec<PdlResult>>>,

    /// Body of the loop
    pub repeat: Box<PdlBlock>,
}

/// Create a message
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "message")]
pub struct MessageBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Role of associated to the message, e.g. User or Assistant
    pub role: Role,

    /// Content of the message
    pub content: Box<PdlBlock>,

    /// pdl_id of block that defined the `content of this message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub defsite: Option<String>,

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
#[serde(tag = "kind", rename = "object")]
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
#[serde(tag = "kind", rename = "data")]
pub struct DataBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    pub data: Value,

    /// Do not evaluate expressions inside strings.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw: Option<bool>,

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
#[serde(tag = "kind", rename = "code")]
pub struct PythonCodeBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Programming language of the code
    pub lang: String,

    /// Code to execute
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
#[serde(tag = "kind", rename = "read")]
pub struct ReadBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Name of the file to read. If `None`, read the standard input.
    pub read: StringOrNull,

    /// Name of the file to read. If `None`, read the standard input.
    pub message: Option<String>,

    /// Indicate if one or multiple lines should be read.
    pub multiline: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub parser: Option<PdlParser>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum StringOrBoolean {
    String(String),
    Boolean(bool),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Expr<S, T> {
    #[serde(rename = "pdl__expr")]
    pub pdl_expr: S,

    #[serde(rename = "pdl__result", skip_serializing_if = "Option::is_none")]
    pub pdl_result: Option<T>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum EvalsTo<S, T> {
    Jinja(String),
    Const(T),
    Expr(Expr<S, T>),
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
#[serde(tag = "kind", rename = "if")]
pub struct IfBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// The condition to check
    #[serde(rename = "if")]
    pub condition: EvalsTo<StringOrBoolean, bool>,

    /// Branch to execute if the condition is true
    pub then: Box<PdlBlock>,

    /// Branch to execute if the condition is false.
    #[serde(rename = "else")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub else_: Option<Box<PdlBlock>>,
}

/// Return the array of values computed by each block of the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(tag = "kind", rename = "array")]
#[builder(setter(into, strip_option), default)]
pub struct ArrayBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Elements of the array
    pub array: Vec<PdlBlock>,
}

/// Include a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "include")]
pub struct IncludeBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Name of the file to include.
    pub include: String,
}

/// Import a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "import")]
pub struct ImportBlock {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    /// Name of the file to include.
    pub import: String,
}

/// Block containing only defs
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "empty")]
pub struct EmptyBlock {
    pub defs: IndexMap<String, PdlBlock>,
}

/// A PDL program/sub-program consists of either a literal (string, number, boolean) or some kind of structured block
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum PdlBlock {
    Bool(bool),
    Number(Number),
    String(String),
    Function(FunctionBlock),
    Advanced(Block),
    // must be last to prevent serde from aggressively matching on it, since other block types also (may) have a `defs`
    Empty(EmptyBlock),
}

/// A PDL block that has structure and metadata
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum Block {
    If(IfBlock),
    Import(ImportBlock),
    Include(IncludeBlock),
    Data(DataBlock),
    Object(ObjectBlock),
    Call(CallBlock),
    Array(ArrayBlock),
    Message(MessageBlock),
    Repeat(RepeatBlock),
    PythonCode(PythonCodeBlock),
    Read(ReadBlock),
    Model(ModelBlock),
    LastOf(LastOfBlock),
    Text(TextBlock),
}

impl From<bool> for PdlBlock {
    fn from(b: bool) -> Self {
        PdlBlock::Bool(b)
    }
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
    Closure(Closure),
    Block(PdlBlock),
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
