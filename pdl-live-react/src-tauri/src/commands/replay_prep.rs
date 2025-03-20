use ::std::env::args;
use ::std::env::current_dir;
use ::std::io::Write;
use ::std::path::absolute;

use tempfile::Builder;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub async fn replay_prep(
    trace: String,
    name: String,
) -> Result<(String, String, String, String), String> {
    let mut input = Builder::new()
        .prefix(&format!("{}-", name))
        .suffix(".pdl")
        .tempfile()
        .map_err(|e| e.to_string())?;
    input
        .write_all(trace.as_bytes())
        .map_err(|e| e.to_string())?;
    let (_f, input_path) = input.keep().map_err(|e| e.to_string())?;

    let output = Builder::new()
        .prefix(&format!("{}-{}", name, "-out"))
        .suffix(".json")
        .tempfile()
        .map_err(|e| e.to_string())?;
    let (_f2, output_path) = output.keep().map_err(|e| e.to_string())?;

    let myargs: Vec<_> = args().collect();
    let arg0 = absolute(myargs[0].clone()).map_err(|e| e.to_string())?;

    match (input_path.to_str(), output_path.to_str()) {
        (Some(inny), Some(outty)) => Ok((
            arg0.display().to_string(),
            current_dir()
                .map_err(|e| e.to_string())?
                .display()
                .to_string(),
            inny.to_string(),
            outty.to_string(),
        )),
        _ => Err("Could not stage to file".to_string()),
    }
}
