use std::fs::read;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn read_trace(trace_file: &str) -> Result<Vec<u8>, String> {
    let data = read(trace_file).map_err(|e| e.to_string())?;
    Ok(data)
}
