use crate::args::Args;
use spnl::{Unit, spnl};

pub fn demo(args: Args) -> Result<Unit, Box<dyn ::std::error::Error>> {
    let Args {
        model,
        embedding_model,
        question,
        document,
        ..
    } = args;

    let doc = if document == "./rag-doc1.pdf" {
        document
    } else {
        ::std::path::absolute(document)?
            .into_os_string()
            .into_string()
            .expect("string")
    };

    Ok(
        match ::std::path::Path::new(&doc)
            .extension()
            .and_then(std::ffi::OsStr::to_str)
        {
            Some("txt") | Some("json") | Some("jsonl") => spnl!(g model
                      (cross (system r#"You answer only with either "UNANSWERABLE" or "ANSWERABLE" depending on whether or not the given documents are sufficient to answer the question."#)
                       (with embedding_model
                        (user question)
                        (fetchn doc)))),
            _ => spnl!(g model
                       (cross (system r#"The format of your answer is either "UNANSWERABLE" or "ANSWERABLE" depending on whether or not the given documents are sufficient to answer the question."#)
                        (with embedding_model
                    (user question)
                    (fetchb doc)))),
        },
    )
}
