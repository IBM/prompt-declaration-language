use ::std::fs::{copy, create_dir_all};
use ::std::path::PathBuf;

use duct::cmd;
use file_diff::diff;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[cfg(desktop)]
pub async fn pip_install_if_needed(app_handle: tauri::AppHandle) -> Result<PathBuf, tauri::Error> {
    let cache_path = app_handle.path().cache_dir()?.join("pdl");

    create_dir_all(&cache_path)?;
    let venv_path = cache_path.join("interpreter-python");
    let activate_path = if cfg!(windows) {
        venv_path.join("Scripts").join("Activate.ps1")
    } else {
        venv_path.join("bin/activate")
    };
    let cached_requirements_path = venv_path
        .join("requirements.txt")
        .into_os_string()
        .into_string()
        .unwrap();
    /* println!(
        "RUN PATHS activate={:?} cached_reqs={:?}",
        activate_path, cached_requirements_path
    ); */

    if !venv_path.exists() {
        println!("Creating virtual environment...");
        let python = if cfg!(target_os = "macos") {
            "python3.12"
        } else {
            "python3"
        };
        cmd!(python, "-mvenv", &venv_path).run()?;
    }

    let requirements_path = app_handle
        .path()
        .resolve("interpreter/requirements.txt", BaseDirectory::Resource)?
        .into_os_string()
        .into_string()
        .unwrap();

    if !diff(
        requirements_path.as_str(),
        cached_requirements_path.as_str(),
    ) {
        cmd!(
            venv_path
                .join(if cfg!(windows) { "Scripts" } else { "bin" })
                .join("pip"),
            "install",
            "-r",
            &requirements_path,
        )
        .run()?;

        copy(requirements_path, cached_requirements_path)?;
    }

    match activate_path.parent() {
        Some(parent) => Ok(parent.to_path_buf()),
        _ => Err(tauri::Error::UnknownPath),
    }
}
