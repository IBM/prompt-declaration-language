use ::std::path::Path;
use duct::cmd;
use futures::executor::block_on;
use yaml_rust2::yaml::LoadError;

use crate::interpreter::pip::pip_install_interpreter_if_needed;
use crate::interpreter::pull::pull_if_needed;

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    app_handle: tauri::AppHandle,
    trace_file: Option<&tauri_plugin_cli::ArgData>,
    data: Option<&tauri_plugin_cli::ArgData>,
    stream: Option<&tauri_plugin_cli::ArgData>,
) -> Result<(), tauri::Error> {
    println!(
        "Running {:#?}",
        Path::new(&source_file_path).file_name().unwrap()
    );

    // async the model pull and pip installs
    let pull_future = pull_if_needed(&source_file_path);
    let bin_path_future = pip_install_interpreter_if_needed(app_handle);

    // wait for any model pulls to finish
    block_on(pull_future).map_err(|e| match e {
        LoadError::IO(ee) => tauri::Error::Io(ee),
        LoadError::Scan(ee) => tauri::Error::Anyhow(ee.into()),
        _ => tauri::Error::FailedToReceiveMessage,
    })?;

    // wait for any pip installs to finish
    let bin_path = block_on(bin_path_future)?;

    let mut args = vec![
        source_file_path,
        dashdash("--trace", trace_file),
        dashdash("--data", data),
        dashdash("--stream", stream),
    ];
    args.retain(|x| x.chars().count() > 0);
    cmd(bin_path.join("pdl"), &args).run()?;

    Ok(())
}

/// Format `--{opt}={a}` based on whether `a` is given or not
fn dashdash(opt: &str, a: Option<&tauri_plugin_cli::ArgData>) -> String {
    if let Some(arg) = a {
        if let serde_json::Value::String(s) = &arg.value {
            format!("{}={}", opt, s)
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    }
}
