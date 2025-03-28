use ::std::fs::{create_dir_all, write};
use ::std::path::PathBuf;

use dirs::cache_dir;
use duct::cmd;

use crate::util::shasum;

#[cfg(desktop)]
pub async fn pip_install_if_needed(
    requirements: &str,
) -> Result<PathBuf, Box<dyn ::std::error::Error>> {
    let Some(cache_path) = cache_dir() else {
        return Err(Box::from("Could not find user cache directory"));
    };
    create_dir_all(&cache_path)?;

    let hash = shasum::sha256sum_str(requirements);
    let venv_path = cache_path.join("venvs").join(hash);
    let bin_path = venv_path.join(if cfg!(windows) { "Scripts" } else { "bin" });

    if !venv_path.exists() {
        println!("Creating virtual environment...");
        let python = if cfg!(target_os = "macos") {
            "python3.12"
        } else {
            "python3"
        };
        cmd!(python, "-mvenv", &venv_path)
            .stdout_to_stderr()
            .run()?;

        cmd!(bin_path.join("pip"), "install", &requirements)
            .stdout_to_stderr()
            .run()?;

        let cached_requirements_path = venv_path.join("requirements.txt");
        write(&cached_requirements_path, requirements)?;
    }

    Ok(bin_path.to_path_buf())
}
