use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};

#[cfg(desktop)]
pub fn run_pdl_program(
    source_file_path: String,
    interpreter_path: PathBuf,
) -> Result<(), tauri::Error> {
    println!("Running {:?}", source_file_path);
    //let interp = interpreter_path.display().to_string()
    let activate = interpreter_path.join("bin/activate").display().to_string();
    let mut child = Command::new("sh")
        .args([
            "-c",
            &[
                "source",
                activate.as_str(),
                "; pdl",
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

    Ok(())
}
