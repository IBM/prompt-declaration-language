use ::std::path::PathBuf;
use tauri::WebviewWindowBuilder;

pub fn new_window(
    app: tauri::AppHandle,
    path: Option<PathBuf>,
) -> Result<(), Box<dyn ::std::error::Error>> {
    WebviewWindowBuilder::new(
        &app,
        "main",
        tauri::WebviewUrl::App(path.unwrap_or("".into())),
    )
    .title("Prompt Declaration Language")
    .prevent_overflow()
    .zoom_hotkeys_enabled(true)
    .inner_size(1400.0, 1050.0)
    .build()?;
    Ok(())
}
