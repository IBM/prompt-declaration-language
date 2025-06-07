use futures::future::try_join_all;
use indicatif::{MultiProgress, ProgressBar};
use itertools::Itertools;
use sha2::Digest;

use crate::{
    Document, Unit,
    run::{
        embed::{EmbedData, embed},
        result::{SpnlError, SpnlResult},
    },
};

mod storage;

/// This fragments and windows the lines in the given PDF content. For
/// example if bytes="a\nb\nc\nd" and window_width=2, this will
/// produce ["a\nb", "b\nc", "c\nd"]
fn windowed_pdf(bytes: &Vec<u8>, window_width: usize) -> Result<Vec<String>, SpnlError> {
    Ok(pdf_extract::extract_text_from_mem(&bytes)?
        .lines()
        .filter(|s| s.len() > 0)
        .collect::<Vec<_>>()
        .windows(window_width)
        .step_by(2)
        .map(|s| s.join("\n"))
        .collect())
}

/// This treats every line of text as a separate document, with no
/// need for windowing or sub-fragmentation.
fn windowed_text(s: &String) -> Result<Vec<String>, SpnlError> {
    Ok(s.lines().map(|s| s.to_string()).collect())
}

#[derive(serde::Deserialize)]
struct JsonlText {
    text: String,
}

/// This treats every jsonl line as a separate document, with no need
/// for windowing or sub-fragmentation.
fn windowed_jsonl(s: &String) -> Result<Vec<String>, SpnlError> {
    Ok(serde_json::Deserializer::from_str(s)
        .into_iter::<JsonlText>()
        .filter_map(|line| match line {
            Ok(JsonlText { text }) => Some(text),
            Err(s) => {
                eprintln!("Error parsing jsonl line {:?}", s);
                None
            }
        })
        .collect())
}

pub async fn embed_and_retrieve(
    embedding_model: &String,
    body: &Unit,
    (filename, content): &(String, Document),
    db_uri: &str,
    table_name_base: &str,
) -> SpnlResult {
    use std::time::Instant;
    let now = Instant::now();

    let embedding_batch_size = 64; // Number of fragment embeddings to perform in a single call
    let max_matches = 100; // Maximum number of relevant fragments to consider

    let window_size = match content {
        Document::Text(_) => 1,
        Document::Binary(_) => 8,
    };

    let table_name = storage::VecDB::sanitize_table_name(
        format!("{table_name_base}.{embedding_model}.{window_size}.{filename}").as_str(),
    );
    let db = storage::VecDB::connect(db_uri, table_name.as_str()).await?;

    let done_file = ::std::path::PathBuf::from(db_uri).join(format!("{table_name}.ok"));
    if !::std::fs::exists(&done_file)? {
        let doc_content = match (
            content,
            ::std::path::Path::new(filename)
                .extension()
                .and_then(std::ffi::OsStr::to_str),
        ) {
            (Document::Text(content), Some("txt")) => windowed_text(content),
            (Document::Text(content), Some("jsonl")) => windowed_jsonl(content),
            (Document::Binary(content), Some("pdf")) => windowed_pdf(&content, window_size),
            _ => Err(Box::from(format!(
                "Unsupported `with` binary document {filename}"
            ))),
        }?;
        let key = doc_content.as_slice();

        eprintln!(
            "Embedding document {filename} with {} fragments using {embedding_model}",
            doc_content.len()
        );
        let m = MultiProgress::new();
        let pb = m.add(ProgressBar::new(
            (doc_content.len() / embedding_batch_size).try_into()?,
        ));
        pb.inc(0);
        let mut iter = doc_content.chunks(embedding_batch_size);
        let mut docs_vectors = vec![];
        while let Some(docs) = iter.next() {
            let vecs = embed(embedding_model, EmbedData::Vec(docs.to_vec()))
                .await?
                .into_iter()
                .map(|vec| {
                    if vec.len() < 1024 {
                        let mut ee = vec.clone();
                        ee.resize(1024, 0.0);
                        ee
                    } else {
                        vec
                    }
                });
            pb.inc(1);
            docs_vectors.extend(vecs);
        }
        pb.finish();

        eprintln!("Inserting document embeddings {}", docs_vectors.len());
        db.add_vector(key, docs_vectors, 1024).await?;

        ::std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .open(done_file)?;
    }

    eprintln!("Embedding question {body}");
    let body_vectors = embed(embedding_model, EmbedData::Unit(body.clone()))
        .await?
        .into_iter()
        .map(|v| {
            if v.len() < 1024 {
                let mut vv = v.clone();
                vv.resize(1024, 0.0);
                vv
            } else {
                v
            }
        })
        .collect::<Vec<_>>();

    eprintln!("Matching question to document");
    let matching_docs = try_join_all(
        body_vectors
            .into_iter()
            .map(|v| db.find_similar(v, max_matches)),
    )
    .await?
    .into_iter()
    .flatten()
    .filter_map(|record_batch| {
        if let Some(files_array) = record_batch.column_by_name("filename") {
            if let Some(files) = files_array
                .as_any()
                .downcast_ref::<arrow_array::StringArray>()
            {
                return Some(
                    files
                        .iter()
                        .filter_map(|b| b.map(|b| b.to_string()))
                        .collect::<Vec<String>>(),
                );
            }
        }

        // no matching docs for this body vector
        None
    })
    .flatten()
    .unique();

    eprintln!(
        "RAGSizes {}",
        matching_docs
            .clone()
            .enumerate()
            .map(|(_idx, doc)| doc.len())
            .join(" ")
    );
    eprintln!(
        "RAGHashes {}",
        matching_docs
            .clone()
            .enumerate()
            .map(|(_idx, doc)| {
                let mut hasher = sha2::Sha256::new();
                hasher.update(doc);
                format!("{:x}", hasher.finalize())
            })
            .join(" ")
    );

    let len1 = match content {
        Document::Text(c) => c.len(),
        Document::Binary(b) => b.len(),
    } as f64;
    let len2 = matching_docs.clone().map(|doc| doc.len()).sum::<usize>() as f64;
    eprintln!(
        "RAG fragments total_fragments {} relevant_fragments {}",
        match content {
            Document::Text(t) => t.len(),
            Document::Binary(b) => b.len(),
        },
        matching_docs.clone().count()
    );
    eprintln!(
        "RAG size reduction factor {:.2} {len1} -> {len2} bytes",
        len1 / len2,
    );

    let d = matching_docs
        .enumerate()
        .map(|(idx, doc)| Unit::User((format!("Relevant document {idx}: {doc}"),)))
        .collect::<Vec<_>>();

    eprintln!("RAG time {:.2?} ms", now.elapsed().as_millis());
    Ok(Unit::Plus(d))
}
