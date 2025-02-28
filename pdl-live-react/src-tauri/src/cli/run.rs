use duct::cmd;
use file_diff::diff;
use std::fs::{copy, create_dir_all};

use tauri::path::BaseDirectory;
use tauri::Manager;

#[cfg(desktop)]
fn pip_install_if_needed(app_handle: tauri::AppHandle) -> Result<String, tauri::Error> {
    let cache_path = app_handle.path().cache_dir()?.join("pdl");

    create_dir_all(&cache_path)?;
    let venv_path = cache_path.join("interpreter-python");
    let activate_path = venv_path
        .join("bin/activate")
        .into_os_string()
        .into_string()
        .unwrap();
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
        let venv_path_string = venv_path.into_os_string().into_string().unwrap();
        cmd!("python3.12", "-mvenv", venv_path_string.as_str()).run()?;
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
        println!("Running pip install...");
        cmd!(
            "sh",
            "-c",
            format!(
                "source {activate} && pip install -r {requirements}",
                activate = activate_path,
                requirements = requirements_path
            )
            .as_str(),
        )
        .run()?;

        copy(requirements_path, cached_requirements_path)?;
    }

    Ok(activate_path)
}

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    app_handle: tauri::AppHandle,
    trace_file: Option<&tauri_plugin_cli::ArgData>,
    data: Option<&tauri_plugin_cli::ArgData>,
    stream: Option<&tauri_plugin_cli::ArgData>,
) -> Result<(), tauri::Error> {
    println!("Running {:?}", source_file_path);
    let activate = pip_install_if_needed(app_handle)?;
    let trace_arg = if let Some(arg) = trace_file {
        if let serde_json::Value::String(f) = &arg.value {
            "--trace ".to_owned() + f
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let data_arg = if let Some(arg) = data {
        if let serde_json::Value::String(s) = &arg.value {
            format!("--data '{}'", s)
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let stream_arg = if let Some(arg) = stream {
        if let serde_json::Value::String(s) = &arg.value {
            "--stream ".to_owned() + s
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    cmd!(
        "sh",
        "-c",
        &[
            "source",
            activate.as_str(),
            "; pdl",
            trace_arg.as_str(),
            data_arg.as_str(),
            stream_arg.as_str(),
            source_file_path.as_str(),
        ]
        .join(" "),
    )
    .env("FORCE_COLOR", "1")
    .run()?;

    Ok(())
}
