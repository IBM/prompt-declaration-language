use ::std::path::Path;
use duct::cmd;
use futures::executor::block_on;

use crate::pdl::pip::pip_install_if_needed;
use crate::pdl::pull::pull_if_needed;
use crate::pdl::requirements::PDL_INTERPRETER;

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: &str,
    trace_file: Option<&str>,
    data: Option<&str>,
    stream: Option<&str>,
) -> Result<(), Box<dyn ::std::error::Error>> {
    println!(
        "Running {:#?}",
        Path::new(&source_file_path).file_name().unwrap()
    );

    // async the model pull and pip installs
    let pull_future = pull_if_needed(&source_file_path);
    let bin_path_future = pip_install_if_needed(&PDL_INTERPRETER);

    // wait for any model pulls to finish
    block_on(pull_future)?;

    // wait for any pip installs to finish
    let bin_path = block_on(bin_path_future)?;

    let mut args = vec![
        source_file_path.to_string(),
        dashdash("--trace", trace_file),
        dashdash("--data", data),
        dashdash("--stream", stream),
    ];
    args.retain(|x| x.chars().count() > 0);
    cmd(bin_path.join("pdl"), &args).run()?;

    Ok(())
}

/// Format `--{opt}={a}` based on whether `a` is given or not
fn dashdash(opt: &str, a: Option<&str>) -> String {
    if let Some(s) = a {
        format!("{}={}", opt, s)
    } else {
        "".to_owned()
    }
}
