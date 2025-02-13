use std::fs::read;
use tauri::ipc::Response;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn read_trace(trace_file: &str) -> Response {
    let data = read(trace_file).unwrap();
    Response::new(data)
}
