use std::path::Path;
use std::process::exit;

use serde_json::Value;
use urlencoding::encode;

use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri_plugin_cli::CliExt;

use crate::cli::run;
use crate::gui::setup as gui_setup;

#[cfg(desktop)]
pub fn cli(app: &mut tauri::App) -> Result<(), tauri::Error> {
    app.handle().plugin(tauri_plugin_cli::init())?;

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

                            run::run_pdl_program(source_file_path.clone(), interpreter_path)?;
                            exit(0)
                        }
                    }
                    println!("Usage: run <source.pdl>");
                    exit(1)
                }
                "view" => match subcommand_matches.matches.args.get("trace") {
                    Some(trace) => match &trace.value {
                        Value::String(trace_file) => {
                            gui_setup(
                                app.handle().clone(),
                                Path::new("/local")
                                    .join(encode(trace_file).as_ref())
                                    .display()
                                    .to_string(),
                            )?;
                            Ok(())
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
                _ => {
                    println!("Invalid subcommand");
                    exit(1)
                }
            },
            None => {
                println!("Invalid command");
                exit(1)
            }
        },
        Err(s) => {
            println!("{:?}", s);
            exit(1)
        }
    }
}
