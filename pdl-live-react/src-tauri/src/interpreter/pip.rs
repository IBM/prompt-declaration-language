use ::std::fs::{copy, create_dir_all};
use ::std::path::{Path, PathBuf};

use duct::cmd;
use tauri::path::BaseDirectory;
use tauri::Manager;

use crate::interpreter::shasum;

#[cfg(desktop)]
pub async fn pip_install_if_needed(
    cache_path: &Path,
    requirements_path: &Path,
) -> Result<PathBuf, tauri::Error> {
    create_dir_all(&cache_path)?;

    let hash = shasum::sha256sum(&requirements_path)?;
    let venv_path = cache_path.join(hash);
    let bin_path = venv_path.join(if cfg!(windows) { "Scripts" } else { "bin" });

    if !venv_path.exists() {
        println!("Creating virtual environment...");
        let python = if cfg!(target_os = "macos") {
            "python3.12"
        } else {
            "python3"
        };
        cmd!(python, "-mvenv", &venv_path).run()?;

        cmd!(bin_path.join("pip"), "install", "-r", &requirements_path,).run()?;

        let cached_requirements_path = venv_path.join("requirements.txt");
        copy(requirements_path, cached_requirements_path)?;
    }

    Ok(bin_path.to_path_buf())
}

#[cfg(desktop)]
pub async fn pip_install_interpreter_if_needed(
    app_handle: tauri::AppHandle,
) -> Result<PathBuf, tauri::Error> {
    // the interpreter requirements.txt
    let requirements_path = app_handle
        .path()
        .resolve("interpreter/requirements.txt", BaseDirectory::Resource)?;

    let cache_path = app_handle.path().cache_dir()?.join("pdl");

    pip_install_if_needed(&cache_path, &requirements_path).await
}
