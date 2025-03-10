use duct::cmd;
use rayon::prelude::*;
use serde_json::{Error, Map, Result, Value};

fn from_path(path: &String) -> Result<Map<String, Value>> {
    let content = std::fs::read_to_string(path).unwrap();
    let map: Map<String, Value> = serde_json::from_str(&content).unwrap();

    Ok(map)
}

fn extract_models(program: Map<String, Value>) -> Result<Vec<String>> {
    let mut map: Vec<String> = Vec::new();
    for (key, val) in program {
        match key.as_str() {
            "model" => match &val {
                Value::String(m) => {
                    map.push(m.to_string());
                }
                _ => {}
            },
            _ => {}
        }

        match val {
            Value::Array(a) => {
                for v in a {
                    match v {
                        Value::Object(h) => {
                            for m in extract_models(h).unwrap() {
                                map.push(m)
                            }
                        }
                        _ => {}
                    }
                }
            }
            Value::Object(h) => {
                for m in extract_models(h).unwrap() {
                    map.push(m)
                }
            }
            _ => {}
        }
    }

    Ok(map)
}

pub fn pull_if_needed(path: &String) -> Result<()> {
    extract_models(from_path(path)?)?
        .into_par_iter()
        .try_for_each(|model: String| -> Result<()> {
            match model {
                m if model.starts_with("ollama/") => ollama_pull(&m[7..]),
                m if model.starts_with("ollama_chat/") => ollama_pull(&m[12..]),
                _ => {
                    eprintln!("Skipping model pull for {}", model);
                    Ok(())
                }
            }
        })
        .expect("successfully pulled models");

    Ok(())
}

fn ollama_pull(model: &str) -> Result<()> {
    cmd!("ollama", "pull", model).run().map_err(Error::io)?;
    Ok(())
}
