use crate::Unit;

pub type SpnlError = Box<dyn ::std::error::Error + Send + Sync>;
pub type SpnlResult = Result<Unit, SpnlError>;
