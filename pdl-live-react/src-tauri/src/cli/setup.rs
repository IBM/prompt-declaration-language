use ::std::path::Path;

use serde_json::Value;
use urlencoding::encode;

use tauri_plugin_cli::CliExt;

use crate::cli::run;
use crate::compile;
use crate::gui::setup as gui_setup;

#[cfg(desktop)]
pub fn cli(app: &mut tauri::App) -> Result<(), Box<dyn ::std::error::Error>> {
    app.handle().plugin(tauri_plugin_cli::init())?;

    // `matches` here is a Struct with { args, subcommand }.
    // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
    // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
    let Some(subcommand_matches) = app.cli().matches()?.subcommand else {
        if let Some(help) = app.cli().matches()?.args.get("help") {
            return Err(Box::from(help.value.as_str().or(Some("Internal Error")).unwrap()));
        } else {
            return Err(Box::from("Internal Error"));
        }
    };

    match subcommand_matches.name.as_str() {
        "compile" => {
            let Some(compile_subcommand_matches) = subcommand_matches.matches.subcommand else {
                return Err(Box::from("Missing compile subcommand"));
            };

            match compile_subcommand_matches.name.as_str() {
                "beeai" => {
                    let Some(source) = compile_subcommand_matches.matches.args.get("source") else {
                        return Err(Box::from("Missing source file"));
                    };
                    let Value::String(source_file_path) = &source.value else {
                        return Err(Box::from("Invalid source file argument"));
                    };
                    let Some(output) = compile_subcommand_matches.matches.args.get("output") else {
                        return Err(Box::from("Missing output argument"));
                    };
                    let Value::String(output_file_path) = &output.value else {
                        return Err(Box::from("Invalid output file argument"));
                    };
                    return compile::beeai::compile(source_file_path, output_file_path);
                }
                _ => {}
            }
        }
        "run" => {
            let Some(source) = subcommand_matches.matches.args.get("source") else {
                return Err(Box::from("Missing source file"));
            };
            let Value::String(source_file_path) = &source.value else {
                return Err(Box::from("Invalid source file argument"));
            };
            return run::run_pdl_program(
                source_file_path.clone(),
                app.handle().clone(),
                subcommand_matches.matches.args.get("trace"),
                subcommand_matches.matches.args.get("data"),
                subcommand_matches.matches.args.get("stream"),
            );
        }
        "view" => {
            let Some(trace) = subcommand_matches.matches.args.get("trace") else {
                return Err(Box::from("Missing trace file"));
            };
            let Value::String(trace_file) = &trace.value else {
                return Err(Box::from("Invalid trace file argument"));
            };
            gui_setup(
                app.handle().clone(),
                Path::new("/local")
                    .join(encode(trace_file).as_ref())
                    .display()
                    .to_string(),
            )?
        }
        _ => {}
    }

    Ok(())
}
