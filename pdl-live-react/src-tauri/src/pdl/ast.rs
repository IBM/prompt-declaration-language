use ::std::collections::HashMap;
use serde::Serialize;
use serde_json::Value;

#[derive(Serialize, Debug)]
pub enum PdlParser {
    #[serde(rename = "json")]
    Json,
    /*#[serde(rename = "jsonl")]
    Jsonl,
    #[serde(rename = "yaml")]
    Yaml,*/
}

#[derive(Serialize, Debug, Clone)]
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

#[derive(Serialize, Debug)]
pub struct PdlOptionalType {
    pub optional: PdlBaseType,
}

#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum PdlType {
    Base(PdlBaseType),
    Optional(PdlOptionalType),
    Object(HashMap<String, PdlType>),
}

#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum PdlBlock {
    String(String),
    /*If {
            #[serde(rename = "if")]
            condition: String,
            then: Box<PdlBlock>,
    },*/
    Object {
        object: HashMap<String, PdlBlock>,
    },
    Call {
        call: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        args: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        defs: Option<HashMap<String, PdlBlock>>,
    },
    Array {
        array: Vec<PdlBlock>,
    },
    Message {
        role: String,
        content: Box<PdlBlock>,
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        name: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tool_call_id: Option<String>,
    },
    Repeat {
        #[serde(rename = "for")]
        for_: HashMap<String, String>,
        repeat: Box<PdlBlock>,
    },
    Text {
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        role: Option<String>,
        text: Vec<PdlBlock>,
        #[serde(skip_serializing_if = "Option::is_none")]
        defs: Option<HashMap<String, PdlBlock>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        parser: Option<PdlParser>,
    },
    Model {
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
        model: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        def: Option<String>,
        parameters: HashMap<String, Value>,
        #[serde(skip_serializing_if = "Option::is_none")]
        input: Option<Box<PdlBlock>>, // really this should be restricted to be PdlBlock::Array; how do we do this in rust?
        #[serde(rename = "modelResponse")]
        #[serde(skip_serializing_if = "Option::is_none")]
        model_response: Option<String>,
    },
    Function {
        function: HashMap<String, PdlType>,
        #[serde(rename = "return")]
        return_: Box<PdlBlock>,
    },
    PythonCode {
        lang: String,
        code: String,
    },
}
