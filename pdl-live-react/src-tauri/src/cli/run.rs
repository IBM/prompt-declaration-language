use ::std::path::Path;
use duct::cmd;
use futures::executor::block_on;
use yaml_rust2::yaml::LoadError;
use yaml_rust2::{ScanError, Yaml, YamlLoader};

use crate::interpreter::pip::{pip_install_code_blocks_if_needed, pip_install_internal_if_needed};
use crate::interpreter::pull::pull_if_needed;

/// Read the given filesystem path and produce a potentially multi-document Yaml
fn from_path(path: &String) -> Result<Vec<Yaml>, ScanError> {
    let content = std::fs::read_to_string(path).unwrap();
    YamlLoader::load_from_str(&content)
}

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    app_handle: tauri::AppHandle,
    trace_file: Option<&tauri_plugin_cli::ArgData>,
    data: Option<&tauri_plugin_cli::ArgData>,
    stream: Option<&tauri_plugin_cli::ArgData>,
) -> Result<(), Box<dyn ::std::error::Error>> {
    println!(
        "Running {:#?}",
        Path::new(&source_file_path).file_name().unwrap()
    );

    // async the model pull and pip installs
    let program = &from_path(&source_file_path).unwrap()[0];
    let pull_future = pull_if_needed(&program);
    let reqs_future = pip_install_code_blocks_if_needed(&app_handle, &program);
    let bin_path_future =
        pip_install_internal_if_needed(&app_handle, &"interpreter/requirements.txt");

    // wait for any model pulls to finish
    block_on(pull_future).map_err(|e| match e {
        LoadError::IO(ee) => tauri::Error::Io(ee),
        LoadError::Scan(ee) => tauri::Error::Anyhow(ee.into()),
        _ => tauri::Error::FailedToReceiveMessage,
    })?;

    // wait for any pip installs to finish
    let bin_path = block_on(bin_path_future)?;
    block_on(reqs_future)?;

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
