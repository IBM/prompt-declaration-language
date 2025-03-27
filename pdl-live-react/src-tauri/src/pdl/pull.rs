use ::std::io::{Error, ErrorKind};

use duct::cmd;
use rayon::prelude::*;
use yaml_rust2::{Yaml, YamlLoader};

use crate::pdl::extract;

/// Read the given filesystem path and produce a potentially multi-document Yaml
fn from_path(path: &str) -> Result<Vec<Yaml>, Error> {
    let content = std::fs::read_to_string(path)?;
    YamlLoader::load_from_str(&content).map_err(|e| Error::new(ErrorKind::Other, e.to_string()))
}

/// Pull models (in parallel) from the PDL program in the given filepath.
pub async fn pull_if_needed(path: &str) -> Result<(), Error> {
    extract::extract_models(from_path(path)?)
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
fn ollama_pull_if_needed(model: &str) -> Result<(), Error> {
    if !ollama_exists(model) {
        cmd!("ollama", "pull", model).stdout_to_stderr().run()?;
    }
    Ok(())
}
