use wasm_bindgen::prelude::*;

use spnl::{from_str, run::plan::plan};

#[wasm_bindgen]
pub fn compile_query(query: &str) -> Result<String, JsError> {
    let program = plan(&from_str(query)?);

    //Ok(serde_wasm_bindgen::to_value(&program)?)
    Ok(serde_json::to_string(&program)?)
}
