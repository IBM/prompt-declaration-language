use ::std::io::Error;

use duct::cmd;
use fs4::fs_std::FileExt;
use rayon::prelude::*;

use crate::pdl::ast::PdlBlock;
use crate::pdl::extract;

/* pub async fn pull_if_needed_from_path(
    source_file_path: &str,
) -> Result<(), Box<dyn ::std::error::Error + Send + Sync>> {
    let program = parse_file(&::std::path::PathBuf::from(source_file_path))?;
    pull_if_needed(&program)
        .await
        .map_err(|e| Box::from(e.to_string()))
} */

/// Pull models (in parallel) from the PDL program in the given filepath.
pub async fn pull_if_needed(program: &PdlBlock) -> Result<(), Error> {
    extract::extract_models(program)
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
    let path = ::std::env::temp_dir().join(format!("pdl-ollama-pull-{model}"));
    let f = ::std::fs::File::create(path)?;
    f.lock_exclusive()?;

    // don't ? the cmd! so that we can "finally" unlock the file
    let res = if !ollama_exists(model) {
        cmd!("ollama", "pull", model)
            .stdout_to_stderr()
            .run()
            .and_then(|_| Ok(()))
    } else {
        Ok(())
    };

    FileExt::unlock(&f)?;
    res
}
