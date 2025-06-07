use indicatif::MultiProgress;

use crate::{Unit, run::result::SpnlResult};

pub async fn generate(
    model: &str,
    input: &Unit,
    max_tokens: i32,
    temp: f32,
    mp: Option<&MultiProgress>,
) -> SpnlResult {
    let res = match model {
        #[cfg(feature = "ollama")]
        m if m.starts_with("ollama/") => {
            crate::run::ollama::generate_ollama(&m[7..], input, max_tokens, temp, mp).await
        }

        #[cfg(feature = "ollama")]
        m if m.starts_with("ollama_chat/") => {
            crate::run::ollama::generate_ollama(&m[12..], input, max_tokens, temp, mp).await
        }

        #[cfg(feature = "openai")]
        m if m.starts_with("openai/") => {
            crate::run::openai::generate_openai(&m[7..], input, max_tokens, temp, mp).await
        }

        _ => todo!("Unknown model {model}"),
    };

    res
}
