#[derive(clap::ValueEnum, Clone, Debug, serde::Serialize)]
#[clap(rename_all = "lowercase")]
pub enum Demo {
    Chat,
    Email,
    Email2,
    Email3,
    SWEAgent,
    GSM8k,
    Rag,
}
