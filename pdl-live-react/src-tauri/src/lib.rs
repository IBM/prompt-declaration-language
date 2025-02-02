use std::env::args_os;

mod cli;
mod commands;
mod gui;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Default to GUI if the app was opened with no CLI args.
            if args_os().count() <= 1 {
                gui::setup(app.handle().clone(), "".to_owned())?;
            } else {
                cli::setup::cli(app)?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::read_trace::read_trace])
        .run(tauri::generate_context!())
        .expect("error while running PDL");
}
