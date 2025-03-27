use ::std::fs::{create_dir_all, write};
use ::std::path::{Path, PathBuf};

use duct::cmd;
use tauri::Manager;

use crate::interpreter::shasum;

#[cfg(desktop)]
async fn pip_install_if_needed(
    cache_path: &Path,
    requirements: &str,
) -> Result<PathBuf, Box<dyn ::std::error::Error>> {
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

#[cfg(desktop)]
pub async fn pip_install_internal_if_needed(
    app_handle: tauri::AppHandle,
    requirements: &str,
) -> Result<PathBuf, Box<dyn ::std::error::Error>> {
    let cache_path = app_handle.path().cache_dir()?.join("pdl");
    pip_install_if_needed(&cache_path, requirements).await
}
