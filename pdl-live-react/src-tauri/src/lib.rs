use std::env::args_os;
use std::fs::read;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{exit, Command, Stdio};

use serde_json::Value;
use urlencoding::encode;

use tauri::ipc::Response;
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri_plugin_cli::CliExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn read_trace(trace_file: &str) -> Response {
    let data = read(trace_file).unwrap();
    Response::new(data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_cli::init())?;

            // Default to GUI if the app was opened with no CLI args.
            if args_os().count() <= 1 {
                gui(app.handle().clone(), "".to_owned())?;
            }
            match app.cli().matches() {
                // `matches` here is a Struct with { args, subcommand }.
                // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
                // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
                Ok(matches) => match matches.subcommand {
                    Some(subcommand_matches) => match subcommand_matches.name.as_str() {
                        "run" => {
                            if let Some(source) = subcommand_matches.matches.args.get("source") {
                                if let Value::String(source_file_path) = &source.value {
                                    let interpreter_path = app
                                        .path()
                                        .resolve("interpreter/", BaseDirectory::Resource)?;

                                    eval_pdl_program(source_file_path.clone(), interpreter_path)?;
                                    exit(0)
                                }
                            }
                            println!("Usage: run <source.pdl>");
                            exit(1)
                        }
                        "view" => match subcommand_matches.matches.args.get("trace") {
                            Some(trace) => match &trace.value {
                                Value::String(trace_file) => {
                                    let encoded = encode(trace_file);
                                    gui(
                                        app.handle().clone(),
                                        Path::new("/local")
                                            .join(encoded.as_ref())
                                            .display()
                                            .to_string(),
                                    )?
                                }
                                _ => {
                                    println!("Usage: view <tracefile.json>");
                                    exit(1)
                                }
                            },
                            _ => {
                                println!("Usage: view <tracefile.json>");
                                exit(1)
                            }
                        },
                        _ => {}
                    },
                    None => {}
                },
                Err(_) => {}
            }
            Ok(())
        })
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_trace])
        .run(tauri::generate_context!())
        .expect("error while running PDL");
}

fn gui(app: tauri::AppHandle, path: String) -> Result<(), tauri::Error> {
    #[cfg(all(not(debug_assertions), windows))]
    remove_windows_console();
    tauri::WebviewWindowBuilder::new(&app, "main", tauri::WebviewUrl::App(path.into()))
        .title("Prompt Declaration Language")
        .zoom_hotkeys_enabled(true)
        .inner_size(1400.0, 1050.0)
        .build()?;
    Ok(())
}

#[cfg(desktop)]
fn eval_pdl_program(
    source_file_path: String,
    interpreter_path: PathBuf,
) -> Result<(), tauri::Error> {
    println!("Evaluating {:?}", source_file_path);
    //let interp = interpreter_path.display().to_string()
    let activate = interpreter_path.join("bin/activate").display().to_string();
    let mut child = Command::new("sh")
        .args([
            "-c",
            &[
                "source",
                activate.as_str(),
                "; pdl",
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

    Ok(())
}
