mod extract;
mod generate;

#[cfg(feature = "ollama")]
mod ollama;

#[cfg(feature = "openai")]
mod openai;

#[cfg(feature = "run")]
pub mod plan;

#[cfg(feature = "pull")]
pub mod pull;

#[cfg(feature = "run")]
pub mod result;

#[cfg(feature = "run")]
mod run;

#[cfg(feature = "run")]
pub use run::run;

#[cfg(feature = "run")]
pub use run::RunParameters;

#[cfg(feature = "rag")]
mod with;

#[cfg(feature = "rag")]
mod embed;
