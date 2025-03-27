use ::std::path::Path;

use serde_json::Value;
use urlencoding::encode;

use tauri_plugin_cli::{ArgData, CliExt};

use crate::cli::run;
use crate::compile;
use crate::gui::setup as gui_setup;

#[cfg(desktop)]
pub fn cli(app: &mut tauri::App) -> Result<bool, Box<dyn ::std::error::Error>> {
    app.handle().plugin(tauri_plugin_cli::init())?;

    // `matches` here is a Struct with { args, subcommand }.
    // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
    // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
    let Some(subcommand_matches) = app.cli().matches()?.subcommand else {
        if let Some(help) = app.cli().matches()?.args.get("help") {
            return Err(Box::from(
                help.value.as_str().or(Some("Internal Error")).unwrap(),
            ));
        } else {
            return Err(Box::from("Internal Error"));
        }
    };

    let subcommand_args = subcommand_matches.matches.args;
    match subcommand_matches.name.as_str() {
        "compile" => {
            let Some(compile_subcommand_matches) = subcommand_matches.matches.subcommand else {
                return Err(Box::from("Missing compile subcommand"));
            };
            let args = compile_subcommand_matches.matches.args;

            match compile_subcommand_matches.name.as_str() {
                "beeai" => {
                    match (args.get("source"), args.get("output"), args.get("debug")) {
                        (
                            // TODO this probably fails if the source is a number??
                            Some(ArgData {
                                value: Value::String(source_file_path),
                                ..
                            }),
                            Some(ArgData {
                                value: Value::String(output_file_path),
                                ..
                            }),
                            Some(ArgData {
                                value: Value::Bool(debug),
                                ..
                            }),
                        ) => compile::beeai::compile(source_file_path, output_file_path, debug),
                        _ => Err(Box::from("Invalid compile subcommand")),
                    }
                }
                _ => Err(Box::from("Unsupported compile command")),
            }
            .and_then(|()| Ok(true))
        }
        "run" => run::run_pdl_program(
            subcommand_args
                .get("source")
                .and_then(|a| a.value.as_str())
                .expect("valid positional source arg"),
            subcommand_args.get("trace").and_then(|a| a.value.as_str()),
            subcommand_args.get("data").and_then(|a| a.value.as_str()),
            subcommand_args.get("stream").and_then(|a| a.value.as_str()),
        )
        .and_then(|()| Ok(true)),
        "view" => gui_setup(
            app.handle().clone(),
            subcommand_args
                .get("trace")
                .and_then(|a| {
                    Some(
                        Path::new("#/local")
                            .join(encode(&a.value.as_str().expect("trace arg is string")).as_ref())
                            .display()
                            .to_string(),
                    )
                })
                .expect("valid positional trace arg"),
        )
        .and_then(|()| Ok(false)),
        _ => Err(Box::from("Unsupported command")),
    }
}
