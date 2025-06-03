use ::std::collections::HashMap;
use ::std::error::Error;
use ::std::time::SystemTime;

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

/// Function used to parse to value (https://docs.python.org/3/library/re.html).
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum RegexMode {
    #[serde(rename = "search")]
    Search,
    #[serde(rename = "match")]
    Match,
    #[serde(rename = "fullmatch")]
    Fullmatch,
    #[serde(rename = "split")]
    Split,
    #[serde(rename = "findall")]
    Findall,
}

/// A regular expression parser
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RegexParser {
    /// Regular expression to parse the value
    pub regex: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub mode: Option<RegexMode>,

    /// Expected type of the parsed value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec: Option<IndexMap<String, PdlType>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PdlParser {
    #[serde(rename = "json")]
    Json,
    #[serde(rename = "jsonl")]
    Jsonl,
    #[serde(rename = "yaml")]
    Yaml,
    #[serde(untagged)]
    Regex(RegexParser),
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
    // TODO serde_json doesn't support u128, but (below) as_nanos() returns u128...
    start_nanos: u64,
    end_nanos: u64,
    timezone: String,
}

type TimingError = Box<dyn Error + Send + Sync>;
impl Timing {
    fn now() -> Result<u64, TimingError> {
        Ok(::std::time::SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)?
            .as_nanos() as u64)
    }

    pub fn start() -> Result<Timing, TimingError> {
        let mut t = Timing::default();
        t.start_nanos = Timing::now()?;
        t.timezone = iana_time_zone::get_timezone()?;
        Ok(t)
    }

    pub fn end(&mut self) -> Result<(), TimingError> {
        self.end_nanos = Timing::now()?;
        Ok(())
    }
}

/// Common metadata of blocks
#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(default)]
#[builder(setter(into, strip_option), default)]
pub struct Metadata {
    /// Documentation associated to the block
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Set of definitions executed before the execution of the block
    #[serde(skip_serializing_if = "Option::is_none")]
    pub defs: Option<IndexMap<String, PdlBlock>>,

    /// Name of the variable used to store the result of the execution of the block
    #[serde(skip_serializing_if = "Option::is_none")]
    pub def: Option<String>,

    /// Indicate if the block contributes to the result and background context
    #[serde(skip_serializing_if = "Option::is_none")]
    pub contribute: Option<Vec<String>>, // TODO

    /// Type specification of the result of the block
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec: Option<Value>,

    #[serde(rename = "pdl__id", skip_serializing_if = "Option::is_none")]
    pub pdl_id: Option<String>,

    #[serde(rename = "pdl__result", skip_serializing_if = "Option::is_none")]
    pub pdl_result: Option<Box<PdlResult>>,

    #[serde(rename = "pdl__is_leaf", skip_serializing_if = "Option::is_none")]
    pub pdl_is_leaf: Option<bool>,

    #[serde(rename = "pdl__timing", skip_serializing_if = "Option::is_none")]
    pub pdl_timing: Option<Timing>,
}

/// Call a function
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "call")]
pub struct CallBlock {
    pub call: EvalsTo<String, Box<PdlResult>>,

    /// Arguments of the function with their values
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Value>,

    #[serde(rename = "pdl__trace", skip_serializing_if = "Option::is_none")]
    pub pdl_trace: Option<Box<PdlBlock>>,
}

impl CallBlock {
    pub fn new(call: String) -> Self {
        CallBlock {
            call: EvalsTo::Jinja(call),
            args: None,
            pdl_trace: None,
        }
    }
}

pub trait SequencingBlock {
    fn kind(&self) -> &str;
    fn role(&self) -> &Option<Role>;
    fn items(&self) -> &Vec<PdlBlock>;
    fn with_items(&self, items: Vec<PdlBlock>) -> Self;
    fn parser(&self) -> &Option<PdlParser>;
    fn to_block(&self) -> Body;
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult;
    fn messages_for<T: Clone>(&self, output_messages: &Vec<T>) -> Vec<T>;
}

/// Return the value of the last block if the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "lastOf")]
pub struct LastOfBlock {
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
    fn to_block(&self) -> Body {
        Body::LastOf(self.clone())
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
    fn to_block(&self) -> Body {
        Body::Text(self.clone())
    }
    fn result_for(&self, output_results: Vec<PdlResult>) -> PdlResult {
        PdlResult::String(
            output_results
                .into_iter()
                .map(|m| match m {
                    PdlResult::String(s) => s,
                    x => x.to_string(),
                })
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
    /// Completion tokens consumed
    pub completion_tokens: u64,
    /// Prompt tokens consumed
    pub prompt_tokens: u64,
    /// Completion nanos
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completion_nanos: Option<u64>,
    /// Prompt nanos
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prompt_nanos: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(tag = "kind", rename = "model")]
#[builder(setter(into, strip_option), default)]
pub struct ModelBlock {
    pub model: EvalsTo<String, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parameters: Option<HashMap<String, Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input: Option<Box<PdlBlock>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform: Option<String>,
    #[serde(rename = "modelResponse", skip_serializing_if = "Option::is_none")]
    pub model_response: Option<String>,
    #[serde(rename = "pdl__usage", skip_serializing_if = "Option::is_none")]
    pub pdl_usage: Option<PdlUsage>,

    /// The result of evaluating the `input` field (if given)
    #[serde(rename = "pdl__model_input", skip_serializing_if = "Option::is_none")]
    pub pdl_model_input: Option<Vec<MessageBlock>>,

    /// The actual input given to the model (whether via `input` or from the incoming messages)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<MessageBlock>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ListOrString {
    String(String),
    List(Vec<Value>),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum IterationType {
    #[serde(rename = "lastOf")]
    LastOf,
    #[serde(rename = "array")]
    Array,
    #[serde(rename = "object")]
    Object,
    #[serde(rename = "text")]
    Text,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JoinAs {
    #[serde(rename = "as")]
    as_: IterationType,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JoinAsWith {
    #[serde(rename = "as")]
    as_: IterationType,
    with: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum JoinType {
    AsWith(JoinAsWith),
    As(JoinAs),
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
    /// Arrays to iterate over
    #[serde(rename = "for")]
    pub for_: HashMap<String, EvalsTo<ListOrString, Vec<PdlResult>>>,

    /// Body of the loop
    pub repeat: Box<PdlBlock>,

    /// Define how to combine the result of each iteration
    #[serde(skip_serializing_if = "Option::is_none")]
    pub join: Option<JoinType>,
}

/// Create a message
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "message")]
pub struct MessageBlock {
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

impl Default for EvalsTo<String, String> {
    fn default() -> Self {
        EvalsTo::Const("".to_string())
    }
}

impl From<&str> for EvalsTo<String, String> {
    fn from(s: &str) -> Self {
        EvalsTo::Const(s.to_string())
    }
}
impl From<String> for EvalsTo<String, String> {
    fn from(s: String) -> Self {
        EvalsTo::Const(s)
    }
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
    /// The condition to check
    #[serde(rename = "if")]
    pub condition: EvalsTo<StringOrBoolean, bool>,

    /// Branch to execute if the condition is true
    pub then: Box<PdlBlock>,

    /// Branch to execute if the condition is false.
    #[serde(rename = "else")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub else_: Option<Box<PdlBlock>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub if_result: Option<bool>,
}

/// Return the array of values computed by each block of the list of blocks
#[derive(Serialize, Deserialize, Debug, Clone, Default, derive_builder::Builder)]
#[serde(tag = "kind", rename = "array")]
#[builder(setter(into, strip_option), default)]
pub struct ArrayBlock {
    /// Elements of the array
    pub array: Vec<PdlBlock>,
}

/// Include a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "include")]
pub struct IncludeBlock {
    /// Name of the file to include.
    pub include: String,

    #[serde(rename = "pdl__trace", skip_serializing_if = "Option::is_none")]
    pub pdl_trace: Option<Box<PdlBlock>>,
}

/// Import a PDL file
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "kind", rename = "import")]
pub struct ImportBlock {
    /// Name of the file to include.
    pub import: String,

    #[serde(rename = "pdl__trace", skip_serializing_if = "Option::is_none")]
    pub pdl_trace: Option<Box<PdlBlock>>,
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

    // Must be last to prevent serde from aggressively matching on it,
    // since other block types also (may) have a `defs`.
    Empty(EmptyBlock),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Block {
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,

    #[serde(flatten)]
    pub body: Body,
}

/// A PDL block that has structure and metadata
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum Body {
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
impl PartialEq for PdlResult {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (PdlResult::Number(a), PdlResult::Number(b)) => a == b,
            (PdlResult::String(a), PdlResult::String(b)) => a == b,
            (PdlResult::Bool(a), PdlResult::Bool(b)) => a == b,
            (PdlResult::List(a), PdlResult::List(b)) => a == b,
            (PdlResult::Dict(a), PdlResult::Dict(b)) => a == b,
            _ => false,
        }
    }
}
