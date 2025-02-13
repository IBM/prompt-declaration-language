use tauri::WebviewWindowBuilder;

pub fn setup(app: tauri::AppHandle, path: String) -> Result<(), tauri::Error> {
    #[cfg(all(not(debug_assertions), windows))]
    remove_windows_console();
    WebviewWindowBuilder::new(&app, "main", tauri::WebviewUrl::App(path.into()))
        .title("Prompt Declaration Language")
        .zoom_hotkeys_enabled(true)
        .inner_size(1400.0, 1050.0)
        .build()?;
    Ok(())
}
