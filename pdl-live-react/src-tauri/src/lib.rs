use serde_json::Value;
use std::fs::read;
use std::path::Path;
use urlencoding::encode;

use tauri::ipc::Response;
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
            if std::env::args_os().count() <= 1 {
                gui(app.handle().clone(), "".to_owned())?;
            }
            match app.cli().matches() {
                // `matches` here is a Struct with { args, subcommand }.
                // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
                // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
                Ok(matches) => {
                    match matches.subcommand {
                        Some(subcommand_matches) => {
                            match subcommand_matches.name.as_str() {
                                "view" => {
                                    match subcommand_matches.matches.args.get("trace") {
                                        Some(trace) => {
                                            match &trace.value {
                                                Value::String(trace_file) => {
                                                    // app.handle().plugin(tauri_plugin_fs::init())?;

                                                    //let src = Path::new(trace_file);
                                                    //let name = src.file_name().unwrap();
                                                    //let tmp =  app.path().app_local_data_dir().join("mytraces").join(name);
                                                    //fs::copy(src, &tmp)?;

                                                    // allowed access to the trace directory
                                                    // let src = Path::new(&trace_file);
                                                    //let canon = fs::canonicalize(src)?;
                                                    //let abs = canon.as_path();
                                                    //println!("!!!!!!!!!!!! {:?}", abs);
                                                    //let src = &abs.display().to_string();

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
                                                    std::process::exit(1)
                                                }
                                            }
                                        }
                                        _ => {
                                            println!("Usage: view <tracefile.json>");
                                            std::process::exit(1)
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                        None => {}
                    }
                    //println!(" {:?}", matches);
                    //gui(app.handle().clone(), "".to_owned())?;
                }
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
