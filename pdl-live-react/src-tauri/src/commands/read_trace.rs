use std::fs::read;
use std::path::Path;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn read_trace(trace_file: &str) -> Result<Vec<u8>, String> {
    let path = Path::new(trace_file);
    let allowed_ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
    if allowed_ext != "json" && allowed_ext != "pdl" {
        return Err("Invalid file extension. Only .json and .pdl are allowed.".to_string());
    }
    let canonical = path.canonicalize().map_err(|e| e.to_string())?;
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    let current_dir = current_dir.canonicalize().map_err(|e| e.to_string())?;
    if !canonical.starts_with(&current_dir) {
        return Err("Path is outside of allowed directory.".to_string());
    }
    let data = read(&canonical).map_err(|e| e.to_string())?;
    Ok(data)
}
