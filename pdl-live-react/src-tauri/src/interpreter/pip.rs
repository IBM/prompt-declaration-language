use ::std::fs::{copy, create_dir_all, write};
use ::std::path::{Path, PathBuf};

use duct::cmd;
use rayon::prelude::*;
use tauri::path::BaseDirectory;
use tauri::Manager;
use tempfile::Builder;
use yaml_rust2::Yaml;

use crate::interpreter::extract;
use crate::interpreter::shasum;

#[cfg(desktop)]
fn pip_install_if_needed_with_hash(
    cache_path: &Path,
    requirements_path: &Path,
    hash: String,
    force: bool,
) -> Result<PathBuf, tauri::Error> {
    create_dir_all(&cache_path)?;

    let venv_path = cache_path.join("venvs").join(hash);
    let bin_path = venv_path.join(if cfg!(windows) { "Scripts" } else { "bin" });

    // re: force, this is part of the short-term hack to install all
    // code block dependencies in the main interpreter venv. Once we
    // figure out how to support a separate venv for each code block
    // (that needs it), we can undo this hack.
    if !venv_path.exists() {
        println!("Creating virtual environment...");
        let python = if cfg!(target_os = "macos") {
            "python3.12"
        } else {
            "python3"
        };
        cmd!(python, "-mvenv", &venv_path).run()?;

        if !force {
            cmd!(bin_path.join("pip"), "install", "-r", &requirements_path).run()?;

            let cached_requirements_path = venv_path.join("requirements.txt");
            copy(requirements_path, cached_requirements_path)?;
        }
    }

    if force {
        cmd!(bin_path.join("pip"), "install", "-r", &requirements_path).run()?;
    }

    Ok(bin_path.to_path_buf())
}

#[cfg(desktop)]
fn pip_install_if_needed(
    cache_path: &Path,
    requirements_path: &Path,
) -> Result<PathBuf, tauri::Error> {
    let hash = shasum::sha256sum(&requirements_path)?;
    pip_install_if_needed_with_hash(cache_path, requirements_path, hash, false)
}

#[cfg(desktop)]
pub async fn pip_install_code_blocks_if_needed(
    app_handle: &tauri::AppHandle,
    program: &Yaml,
) -> Result<(), tauri::Error> {
    let cache_path = app_handle.path().cache_dir()?.join("pdl");

    // for now, install the requirements in the main interpreter venv
    let requirements_path = app_handle
        .path()
        .resolve("interpreter/requirements.txt", BaseDirectory::Resource)?;

    extract::extract_requirements(program)
        .into_par_iter()
        .try_for_each(|req| -> Result<(), tauri::Error> {
            let req_path = Builder::new()
                .prefix("pdl-requirements-")
                .suffix(".txt")
                .tempfile()?;
            // This is part of the "force" hack described above, where
            // we force the code block dependencies to be installed in
            // the main interpreter venv.
            let hash = shasum::sha256sum(&requirements_path)?;
            write(&req_path, req)?;
            pip_install_if_needed_with_hash(&cache_path, &req_path.path(), hash, true)?;
            Ok(())
        })
        .expect("code block requirements installed");

    Ok(())
}

#[cfg(desktop)]
pub async fn pip_install_interpreter_if_needed(
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, tauri::Error> {
    // the interpreter requirements.txt
    let requirements_path = app_handle
        .path()
        .resolve("interpreter/requirements.txt", BaseDirectory::Resource)?;

    let cache_path = app_handle.path().cache_dir()?.join("pdl");

    pip_install_if_needed(&cache_path, &requirements_path)
}
