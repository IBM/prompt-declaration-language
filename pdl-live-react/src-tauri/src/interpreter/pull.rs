use duct::cmd;
use rayon::prelude::*;
use yaml_rust2::yaml::LoadError;
use yaml_rust2::{ScanError, Yaml, YamlLoader};

/// Read the given filesystem path and produce a potentially multi-document Yaml
fn from_path(path: &String) -> Result<Vec<Yaml>, ScanError> {
    let content = std::fs::read_to_string(path).unwrap();
    YamlLoader::load_from_str(&content)
}

/// Take one Yaml fragment and produce the a vector of the models that are used
fn extract_models(program: Yaml) -> Vec<String> {
    let mut models: Vec<String> = Vec::new();

    match program {
        Yaml::Hash(h) => {
            for (key, val) in h {
                match key.as_str() {
                    Some("model") => match &val {
                        Yaml::String(m) => {
                            models.push(m.to_string());
                        }
                        _ => {}
                    },
                    _ => {}
                }

                for m in extract_models(val) {
                    models.push(m)
                }
            }
        }

        Yaml::Array(a) => {
            for val in a {
                for m in extract_models(val) {
                    models.push(m)
                }
            }
        }

        _ => {}
    }

    models
}

/// Pull models (in parallel) from the PDL program in the given filepath.
pub async fn pull_if_needed(path: &String) -> Result<(), LoadError> {
    let mut models = from_path(path)
        .unwrap()
        .into_iter()
        .flat_map(extract_models)
        .collect::<Vec<String>>();

    // A single program may specify the same model more than once. Dedup!
    models.sort();
    models.dedup();

    models
        .into_par_iter()
        .try_for_each(|model| match model {
            m if model.starts_with("ollama/") => ollama_pull_if_needed(&m[7..]),
            m if model.starts_with("ollama_chat/") => ollama_pull_if_needed(&m[12..]),
            _ => {
                eprintln!("Skipping model pull for {}", model);
                Ok(())
            }
        })
        .expect("successfully pulled models");

    Ok(())
}

fn ollama_exists(model: &str) -> bool {
    match cmd!("ollama", "show", model)
        .stdout_null()
        .stderr_null()
        .run()
    {
        Ok(_output) => true,
        _ => false,
    }
}

/// The Ollama implementation of a single model pull
fn ollama_pull_if_needed(model: &str) -> Result<(), LoadError> {
    if !ollama_exists(model) {
        cmd!("ollama", "pull", model).run().map_err(LoadError::IO)?;
    }
    Ok(())
}
