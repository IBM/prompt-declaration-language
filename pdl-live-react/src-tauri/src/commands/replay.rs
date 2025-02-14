use std::io::Write;
use tempfile::NamedTempFile;
//use tauri::ipc::Response;

use tauri::path::BaseDirectory;
use tauri::Manager;

use crate::cli::run::run_pdl_program;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub async fn replay(app_handle: tauri::AppHandle, trace: String) -> Result<String, String> {
    let mut file = NamedTempFile::new().map_err(|e| e.to_string())?;
    file.write_all(trace.as_bytes())
        .map_err(|e| e.to_string())?;

    let interpreter_path = app_handle
        .path()
        .resolve("interpreter/", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    match file.path().to_str() {
        Some(path) => {
            let data = run_pdl_program(path.to_string(), interpreter_path, true)
                .map_err(|e| e.to_string())?;
            match data {
                Some(bytes) => {
                    let string = String::from_utf8(bytes).expect("Our bytes should be valid utf8");
                    Ok(string)
                }
                None => Err("Could not replay the trace".to_string()),
            }
        }
        None => Err("Could not stage to file".to_string()),
    }
}
