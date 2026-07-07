use ::std::fs::{create_dir_all, write};
use ::std::path::PathBuf;

use dirs::cache_dir;
use duct::cmd;

use crate::util::shasum;

fn validate_requirements(requirements: &str) -> Result<(), Box<dyn ::std::error::Error>> {
    if requirements.is_empty() {
        return Err(Box::from("Requirements string cannot be empty"));
    }
    for c in requirements.chars() {
        if !c.is_ascii_alphanumeric()
            && c != '='
            && c != '>'
            && c != '<'
            && c != '!'
            && c != '~'
            && c != ' '
            && c != '\n'
            && c != '\r'
            && c != ','
            && c != '['
            && c != ']'
            && c != '-'
            && c != '_'
            && c != '.'
            && c != '/'
        {
            return Err(Box::from(format!("Invalid character in requirements: {}", c)));
        }
    }
    Ok(())
}

#[cfg(desktop)]
pub async fn pip_install_if_needed(
    requirements: &str,
) -> Result<PathBuf, Box<dyn ::std::error::Error>> {
    validate_requirements(requirements)?;

    let Some(cache_path) = cache_dir() else {
        return Err(Box::from("Could not find user cache directory"));
    };
    create_dir_all(&cache_path)?;

    let hash = shasum::sha256sum_str(requirements);
    let venv_path = cache_path.join("venvs").join(hash);
    let bin_path = venv_path.join(if cfg!(windows) { "Scripts" } else { "bin" });

    if !venv_path.exists() {
        println!("Creating virtual environment...");
        let python = if cfg!(target_os = "macos") {
            "python3.12"
        } else {
            "python3"
        };
        cmd!(python, "-mvenv", &venv_path)
            .stdout_to_stderr()
            .run()?;

        if !venv_path.exists() {
            return Err(Box::from("Failed to create virtual environment"));
        }

        let pip_path = bin_path.join("pip");
        if !pip_path.exists() {
            return Err(Box::from("pip not found in virtual environment"));
        }

        let requirements_file = venv_path.join("requirements.txt");
        write(&requirements_file, requirements)?;

        cmd!(pip_path, "install", "-r", &requirements_file)
            .stdout_to_stderr()
            .run()?;
    }

    Ok(bin_path.to_path_buf())
}
