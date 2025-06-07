use async_recursion::async_recursion;
use indicatif::MultiProgress;

use crate::{Unit, run::result::SpnlResult};

pub struct RunParameters {
    /// URI of vector database. Could be a local filepath.
    pub vecdb_uri: String,

    /// Name of table to use in vector database.
    pub vecdb_table: String,
}

async fn cross(units: &Vec<Unit>, rp: &RunParameters, mm: Option<&MultiProgress>) -> SpnlResult {
    let mym = MultiProgress::new();
    let m = if let Some(m) = mm { m } else { &mym };

    let mut iter = units.iter();
    let mut evaluated = vec![];
    while let Some(u) = iter.next() {
        evaluated.push(run(u, rp, Some(m)).await?);
    }

    Ok(Unit::Cross(evaluated))
}

async fn plus(units: &Vec<Unit>, rp: &RunParameters) -> SpnlResult {
    let m = MultiProgress::new();
    let evaluated =
        futures::future::try_join_all(units.iter().map(|u| run(u, rp, Some(&m)))).await?;

    if evaluated.len() == 1 {
        Ok(evaluated[0].clone())
    } else {
        Ok(Unit::Plus(evaluated))
    }
}

#[async_recursion]
pub async fn run(unit: &Unit, rp: &RunParameters, m: Option<&MultiProgress>) -> SpnlResult {
    #[cfg(feature = "pull")]
    let _ = crate::run::pull::pull_if_needed(unit).await?;

    match unit {
        Unit::Print((m,)) => {
            println!("{}", m);
            Ok(Unit::Print((m.clone(),)))
        }
        Unit::User(s) => Ok(Unit::User(s.clone())),
        Unit::System(s) => Ok(Unit::System(s.clone())),

        #[cfg(feature = "rag")]
        Unit::Retrieve((embedding_model, body, doc)) => {
            crate::run::with::embed_and_retrieve(
                embedding_model,
                body,
                doc,
                rp.vecdb_uri.as_str(),
                rp.vecdb_table.as_str(),
            )
            .await
        }
        #[cfg(not(feature = "rag"))]
        Unit::Retrieve((embedding_model, body, docs)) => Err(Box::from("rag feature not enabled")),

        Unit::Cross(u) => cross(&u, rp, m).await,
        Unit::Plus(u) => plus(&u, rp).await,
        Unit::Generate((model, input, max_tokens, temp, accumulate)) => match accumulate {
            false => {
                crate::run::generate::generate(
                    model.as_str(),
                    &run(&input, rp, m).await?,
                    *max_tokens,
                    *temp,
                    m,
                )
                .await
            }
            true => {
                let mut accum = match &**input {
                    Unit::Cross(v) => v.clone(),
                    _ => vec![*input.clone()],
                };
                loop {
                    let program = Unit::Generate((
                        model.clone(),
                        Box::new(Unit::Cross(accum.clone())),
                        *max_tokens,
                        *temp,
                        false,
                    ));
                    let out = run(&program, rp, m).await?;
                    accum.push(out.clone());
                }
            }
        },

        #[cfg(not(feature = "cli_support"))]
        Unit::Ask((message,)) => todo!("ask"),
        #[cfg(feature = "cli_support")]
        Unit::Ask((message,)) => {
            use rustyline::error::ReadlineError;
            let mut rl = rustyline::DefaultEditor::new().unwrap();
            let _ = rl.load_history("history.txt");
            let prompt = match rl.readline(message.as_str()) {
                Ok(line) => {
                    rl.add_history_entry(line.as_str()).unwrap();
                    line
                }
                Err(ReadlineError::Interrupted) | Err(ReadlineError::Eof) => {
                    ::std::process::exit(0) // TODO this only works in a CLI
                }
                Err(err) => panic!("{}", err), // TODO this only works in a CLI
            };
            rl.append_history("history.txt").unwrap();
            Ok(Unit::User((prompt,)))
        }

        // should not happen
        Unit::Repeat(_) => todo!("repeat"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::run::result::SpnlError;

    #[tokio::test]
    async fn it_works() -> Result<(), SpnlError> {
        let result = run(
            &"hello".into(),
            &RunParameters {
                vecdb_table: "".into(),
                vecdb_uri: "".into(),
            },
            None,
        )
        .await?;
        assert_eq!(result, Unit::User(("hello".to_string(),)));
        Ok(())
    }
}
