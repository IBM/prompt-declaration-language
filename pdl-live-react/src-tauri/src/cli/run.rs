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

    let pull_future = pull_if_needed(&source_file_path);
    let bin_path_future = pip_install_interpreter_if_needed(app_handle);

    let trace_arg = if let Some(arg) = trace_file {
        if let serde_json::Value::String(f) = &arg.value {
            "--trace=".to_owned() + f
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let data_arg = if let Some(arg) = data {
        if let serde_json::Value::String(s) = &arg.value {
            format!("--data={}", s)
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    let stream_arg = if let Some(arg) = stream {
        if let serde_json::Value::String(s) = &arg.value {
            "--stream=".to_owned() + s
        } else {
            "".to_owned()
        }
    } else {
        "".to_owned()
    };

    // wait for any model pulls to finish
    block_on(pull_future).map_err(|e| match e {
        LoadError::IO(ee) => tauri::Error::Io(ee),
        LoadError::Scan(ee) => tauri::Error::Anyhow(ee.into()),
        _ => tauri::Error::FailedToReceiveMessage,
    })?;

    let bin_path = block_on(bin_path_future)?;

    let mut args = vec![
        source_file_path.as_str(),
        trace_arg.as_str(),
        data_arg.as_str(),
        stream_arg.as_str(),
    ];
    args.retain(|x| x.chars().count() > 0);
    cmd(bin_path.join("pdl"), &args).run()?;

    Ok(())
}
