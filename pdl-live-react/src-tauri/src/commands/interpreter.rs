use crate::pdl::interpreter::{pretty_print, run_string};

#[tauri::command]
pub async fn run_pdl_program(program: String) -> Result<String, String> {
    let (_, messages, _) = run_string(&program, Default::default(), Default::default())
        .await
        .map_err(|err| err.to_string())?;

    Ok(pretty_print(&messages))
}
