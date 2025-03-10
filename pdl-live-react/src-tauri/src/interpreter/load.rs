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
pub fn pull_if_needed(path: &String) -> Result<(), LoadError> {
    from_path(path)
        .unwrap()
        .into_iter()
        .flat_map(extract_models)
        .collect::<Vec<String>>()
        .into_par_iter()
        .try_for_each(|model| match model {
            m if model.starts_with("ollama/") => ollama_pull(&m[7..]),
            m if model.starts_with("ollama_chat/") => ollama_pull(&m[12..]),
            _ => {
                eprintln!("Skipping model pull for {}", model);
                Ok(())
            }
        })
        .expect("successfully pulled models");

    Ok(())
}

/// The Ollama implementation of a single model pull
fn ollama_pull(model: &str) -> Result<(), LoadError> {
    cmd!("ollama", "pull", model).run().map_err(LoadError::IO)?;
    Ok(())
}
