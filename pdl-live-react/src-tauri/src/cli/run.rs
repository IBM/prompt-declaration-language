use duct::cmd;
use file_diff::diff;
use std::fs::{copy, create_dir_all, read};
use std::io::{BufRead, BufReader};
use tempfile::NamedTempFile;

use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Clone, serde::Serialize)]
pub struct Payload {
    done: bool,
    message: String,
}

#[cfg(desktop)]
fn pip_install_if_needed(
    app_handle: tauri::AppHandle,
    reader: &Option<tauri::ipc::Channel<Payload>>,
) -> Result<String, tauri::Error> {
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
        match reader {
            Some(r) => {
                r.send(Payload {
                    done: false,
                    message: "Creating virtual environment...".to_string(),
                })
                .unwrap();
            }
            None => {
                println!("Creating virtual environment...");
            }
        }
        let venv_path_string = venv_path.into_os_string().into_string().unwrap();
        let stdout = cmd!("python3.12", "-mvenv", venv_path_string.as_str())
            .stderr_to_stdout()
            .reader()?;
        // Stream output.
        let lines = BufReader::new(stdout).lines();
        match reader {
            Some(r) => {
                for line in lines {
                    r.send(Payload {
                        done: false,
                        message: line.unwrap(),
                    })
                    .unwrap();
                }
            }
            None => {
                for line in lines {
                    println!("{}", line.unwrap());
                }
            }
        }
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
        let stdout = cmd!(
            "sh",
            "-c",
            format!(
                "source {activate} && pip install -r {requirements}",
                activate = activate_path,
                requirements = requirements_path
            )
            .as_str(),
        )
        .stderr_to_stdout()
        .reader()?;
        // Stream output.
        let lines = BufReader::new(stdout).lines();
        match reader {
            Some(r) => {
                for line in lines {
                    r.send(Payload {
                        done: false,
                        message: line.unwrap(),
                    })
                    .unwrap();
                }
            }
            None => {
                for line in lines {
                    println!("{}", line.unwrap());
                }
            }
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
    reader: Option<tauri::ipc::Channel<Payload>>,
) -> Result<Option<Vec<u8>>, tauri::Error> {
    println!("Running {:?}", source_file_path);
    let activate = pip_install_if_needed(app_handle, &reader)?;

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

    let stdout = cmd!(
        "sh",
        "-c",
        &[
            "source",
            activate.as_str(),
            "; pdl",
            trace_arg.as_str(),
            source_file_path.as_str(),
        ]
        .join(" "),
    )
    .env("FORCE_COLOR", "1")
    .stderr_to_stdout()
    .reader()?;
    // Stream output.
    let lines = BufReader::new(stdout).lines();
    match reader {
        Some(r) => {
            for line in lines {
                r.send(Payload {
                    done: false,
                    message: line.unwrap(),
                })
                .unwrap();
            }

            r.send(Payload {
                done: true,
                message: "".to_string(),
            })
            .unwrap();
        }
        None => {
            for line in lines {
                println!("{}", line.unwrap());
            }
        }
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
