use file_diff::diff;
use std::fs::{copy, create_dir_all, read};
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use tempfile::NamedTempFile;

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
        let output = Command::new("python3.12")
            .args(["-mvenv", venv_path_string.as_str()])
            .output()
            .expect("Failed to execute venv creation");
        println!("{:?}", output);
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
        let mut child = Command::new("sh")
            .args([
                "-c",
                format!(
                    "source {activate} && pip install -r {requirements}",
                    activate = activate_path,
                    requirements = requirements_path
                )
                .as_str(),
            ])
            .stdout(Stdio::piped())
            .spawn()
            .unwrap();

        let stdout = child.stdout.take().unwrap();

        // Stream output.
        let lines = BufReader::new(stdout).lines();
        for line in lines {
            println!("{}", line.unwrap());
        }

        copy(requirements_path, cached_requirements_path)?;
    }

    Ok(activate_path)
}

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    app_handle: tauri::AppHandle,
    trace: bool,
) -> Result<Option<Vec<u8>>, tauri::Error> {
    println!("Running {:?}", source_file_path);
    let activate = pip_install_if_needed(app_handle)?;

    let (trace_file, trace_arg) = if trace {
        let f = NamedTempFile::new()?;
        let arg = match f.path().to_str() {
            Some(path) => "--trace ".to_owned() + path,
            None => "".to_owned(),
        };
        (Some(f), arg)
    } else {
        (None, "".to_owned())
    };

    let mut child = Command::new("sh")
        .args([
            "-c",
            &[
                "source",
                activate.as_str(),
                "; pdl",
                trace_arg.as_str(),
                source_file_path.as_str(),
            ]
            .join(" "),
        ])
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let stdout = child.stdout.take().unwrap();

    // Stream output.
    let lines = BufReader::new(stdout).lines();
    for line in lines {
        println!("{}", line.unwrap());
    }

    if trace {
        match trace_file {
            Some(path) => {
                return Ok(Some(read(path).unwrap()));
            }
            None => (),
        }
    }

    Ok(None)
}
