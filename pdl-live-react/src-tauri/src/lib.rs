use std::env::args_os;
use tauri_plugin_pty;

mod cli;
mod commands;
mod compile;
mod gui;
mod pdl;
mod util;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Default to GUI if the app was opened with no CLI args.
            if args_os().count() <= 1 {
                gui::new_window(app.handle().clone(), None)
            } else {
                match cli::setup(app) {
                    Ok(true) => ::std::process::exit(0), // success with CLI
                    Ok(false) => Ok(()), // instead, open GUI (fallthrough to the logic below)
                    Err(s) => {
                        // error with CLI
                        eprintln!("{}", s);
                        ::std::process::exit(1)
                    }
                }
            }
        })
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_pty::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_trace::read_trace,
            commands::replay_prep::replay_prep,
            commands::interpreter::run_pdl_program,
        ])
        .run(tauri::generate_context!())
        .expect("GUI opens")
}
