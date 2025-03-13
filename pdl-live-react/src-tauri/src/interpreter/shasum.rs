use ::std::fs::File;
use ::std::io::{copy, Result};
use ::std::path::Path;

use base64ct::{Base64, Encoding};
use sha2::{Digest, Sha256};

pub fn sha256sum(path: &Path) -> Result<String> {
    let mut hasher = Sha256::new();
    let mut file = File::open(path)?;

    copy(&mut file, &mut hasher)?;
    let hash_bytes = hasher.finalize();

    Ok(Base64::encode_string(&hash_bytes))
}
