use ::std::path::Path;

use tauri_plugin_cli::CliExt;
use urlencoding::encode;

use crate::compile;
use crate::gui::new_window;
use crate::pdl::interpreter::run_file_sync as runr;
use crate::pdl::run::run_pdl_program;

#[cfg(desktop)]
pub fn setup(app: &mut tauri::App) -> Result<bool, Box<dyn ::std::error::Error>> {
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
                "beeai" => compile::beeai::compile(
                    args.get("source")
                        .and_then(|a| a.value.as_str())
                        .expect("valid positional source arg"),
                    args.get("output")
                        .and_then(|a| a.value.as_str())
                        .expect("valid output arg"),
                    args.get("debug")
                        .and_then(|a| a.value.as_bool())
                        .or(Some(false))
                        == Some(true),
                )
                .and_then(|()| Ok(true)),
                _ => Err(Box::from("Unsupported compile command")),
            }
        }
        "runr" => runr(
            subcommand_args
                .get("source")
                .and_then(|a| a.value.as_str())
                .expect("valid positional source arg"),
            subcommand_args
                .get("debug")
                .and_then(|a| a.value.as_bool())
                .or(Some(false))
                == Some(true),
        )
        .and_then(|_trace| Ok(true)),
        "run" => run_pdl_program(
            subcommand_args
                .get("source")
                .and_then(|a| a.value.as_str())
                .expect("valid positional source arg"),
            subcommand_args.get("trace").and_then(|a| a.value.as_str()),
            subcommand_args.get("data").and_then(|a| a.value.as_str()),
            subcommand_args.get("stream").and_then(|a| a.value.as_str()),
        )
        .and_then(|()| Ok(true)),
        "view" => new_window(
            app.handle().clone(),
            subcommand_args.get("trace").and_then(|a| {
                Some(
                    Path::new("#/local")
                        .join(encode(&a.value.as_str().expect("trace arg is string")).as_ref()),
                )
            }),
        )
        .and_then(|()| Ok(false)),
        _ => Err(Box::from("Unsupported command")),
    }
}
