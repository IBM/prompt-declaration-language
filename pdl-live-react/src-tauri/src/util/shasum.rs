use base64ct::{Base64Url, Encoding};
use sha2::{Digest, Sha256};

/* pub fn sha256sum(path: &Path) -> Result<String> {
    let mut hasher = Sha256::new();
    let mut file = File::open(path)?;

    copy(&mut file, &mut hasher)?;
    let hash_bytes = hasher.finalize();

    Ok(Base64Url::encode_string(&hash_bytes))
} */

pub fn sha256sum_str(s: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(s);
    let hash_bytes = hasher.finalize();

    Base64Url::encode_string(&hash_bytes)
}
