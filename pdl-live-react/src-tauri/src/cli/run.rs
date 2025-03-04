use ::file_diff::diff;
use ::std::fs::{copy, create_dir_all};
use ::std::path::{Path, PathBuf};
use duct::cmd;

use tauri::path::BaseDirectory;
use tauri::Manager;

#[cfg(desktop)]
fn pip_install_if_needed(app_handle: tauri::AppHandle) -> Result<PathBuf, tauri::Error> {
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
                .clone()
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

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    app_handle: tauri::AppHandle,
    trace_file: Option<&tauri_plugin_cli::ArgData>,
    data: Option<&tauri_plugin_cli::ArgData>,
    stream: Option<&tauri_plugin_cli::ArgData>,
) -> Result<(), tauri::Error> {
    println!(
        "Running {:#?}",
        Path::new(&source_file_path).file_name().unwrap()
    );
    let bin_path = pip_install_if_needed(app_handle)?;
    let trace_arg = if let Some(arg) = trace_file {
        if let serde_json::Value::String(f) = &arg.value {
            "--trace=".to_owned() + f
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let data_arg = if let Some(arg) = data {
        if let serde_json::Value::String(s) = &arg.value {
            format!("--data={}", s)
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let stream_arg = if let Some(arg) = stream {
        if let serde_json::Value::String(s) = &arg.value {
            "--stream=".to_owned() + s
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let mut args = vec![
        source_file_path.as_str(),
        trace_arg.as_str(),
        data_arg.as_str(),
        stream_arg.as_str(),
    ];
    args.retain(|x| x.chars().count() > 0);
    cmd(bin_path.join("pdl"), &args).run()?;

    Ok(())
}
