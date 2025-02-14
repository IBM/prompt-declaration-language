use std::fs::read;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tempfile::NamedTempFile;

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    interpreter_path: PathBuf,
    trace: bool,
) -> Result<Option<Vec<u8>>, tauri::Error> {
    println!("Running {:?}", source_file_path);
    //let interp = interpreter_path.display().to_string()
    let activate = interpreter_path.join("bin/activate").display().to_string();

    let (trace_file, trace_arg) = if trace {
        let f = NamedTempFile::new()?;
        let arg = match f.path().to_str() {
            Some(path) => "--trace ".to_owned() + path,
            None => "".to_owned(),
        };
        (Some(f), arg)
    } else {
        (None, "".to_owned())
    };

    let mut child = Command::new("sh")
        .args([
            "-c",
            &[
                "source",
                activate.as_str(),
                "; pdl",
                trace_arg.as_str(),
                source_file_path.as_str(),
            ]
            .join(" "),
        ])
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let stdout = child.stdout.take().unwrap();

    // Stream output.
    let lines = BufReader::new(stdout).lines();
    for line in lines {
        println!("{}", line.unwrap());
    }

    if trace {
        match trace_file {
            Some(path) => {
                return Ok(Some(read(path).unwrap()));
            }
            None => (),
        }
    }

    Ok(None)
}
