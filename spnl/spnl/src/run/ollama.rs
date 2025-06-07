use indicatif::{MultiProgress, ProgressBar};
use tokio::io::{AsyncWriteExt, stdout};
use tokio_stream::StreamExt;

use crate::{
    Unit,
    run::result::{SpnlError, SpnlResult},
};

use ollama_rs::{
    Ollama,
    generation::{
        chat::{ChatMessage, /* ChatMessageResponse, MessageRole,*/ request::ChatMessageRequest,},
        // tools::{ToolFunctionInfo, ToolInfo, ToolType},
    },
    models::ModelOptions,
};

pub async fn generate_ollama(
    model: &str,
    input: &Unit,
    max_tokens: i32,
    temp: f32,
    m: Option<&MultiProgress>,
) -> SpnlResult {
    let ollama = Ollama::default();

    let input_messages: Vec<ChatMessage> = messagify(input);

    let (prompt, history_slice): (&ChatMessage, &[ChatMessage]) = match input_messages.split_last()
    {
        Some(x) => x,
        None => (&ChatMessage::user("".into()), &[]),
    };
    let history = Vec::from(history_slice);

    let req = ChatMessageRequest::new(model.into(), vec![prompt.clone()]).options(
        ModelOptions::default()
            .temperature(temp)
            .num_predict(if max_tokens == 0 { -1 } else { max_tokens }),
    );
    // .format(ollama_rs::generation::parameters::FormatType::Json)
    //        .tools(tools);

    let mut stream = ollama
        .send_chat_messages_with_history_stream(
            ::std::sync::Arc::new(::std::sync::Mutex::new(history)),
            req,
        )
        .await?;

    let quiet = m.is_some();
    let mut pb = m.and_then(|m| {
        Some(m.add(if max_tokens == 0 {
            ProgressBar::no_length()
        } else {
            ProgressBar::new(max_tokens as u64)
        }))
    });

    let mut stdout = stdout();
    /* if !quiet {
        stdout.write_all(b"\x1b[1mUser: \x1b[0m").await?;
        stdout.write_all(prompt.content.as_bytes()).await?;
        stdout.write_all(b"\n").await?;
    } */

    // let mut last_res: Option<ChatMessageResponse> = None;
    let mut response_string = String::new();
    if !quiet {
        stdout.write_all(b"\x1b[1mAssistant: \x1b[0m").await?;
    }
    while let Some(Ok(res)) = stream.next().await {
        if !quiet {
            stdout.write_all(b"\x1b[32m").await?; // green
            stdout.write_all(res.message.content.as_bytes()).await?;
            stdout.flush().await?;
            stdout.write_all(b"\x1b[0m").await?; // reset color
        } else {
            pb.as_mut()
                .map(|pb| pb.inc(res.message.content.len() as u64));
        }
        response_string += res.message.content.as_str();
        // last_res = Some(res);
    }
    if !quiet {
        stdout.write_all(b"\n").await?;
    }

    if let Some(_) = m {
        Ok(Unit::User((response_string,)))
    } else {
        Ok(Unit::Generate((
            format!("ollama/{model}"),
            Box::new(Unit::User((response_string,))),
            max_tokens,
            temp,
            false,
        )))
    }
}

fn messagify(input: &Unit) -> Vec<ChatMessage> {
    match input {
        Unit::Cross(v) | Unit::Plus(v) => v.into_iter().flat_map(messagify).collect(),
        Unit::System((s,)) => vec![ChatMessage::system(s.clone())],
        o => vec![ChatMessage::user(o.to_string())],
    }
}

pub async fn embed(
    embedding_model: &str,
    data: &crate::run::embed::EmbedData,
) -> Result<Vec<Vec<f32>>, SpnlError> {
    use ollama_rs::generation::embeddings::request::GenerateEmbeddingsRequest;

    let docs = match data {
        crate::run::embed::EmbedData::Vec(v) => v,
        crate::run::embed::EmbedData::Unit(u) => &messagify(u)
            .into_iter()
            .map(|m| m.content)
            .collect::<Vec<_>>(),
    };

    let request = GenerateEmbeddingsRequest::new(embedding_model.to_string(), docs.clone().into());

    let ollama = Ollama::default();
    Ok(ollama.generate_embeddings(request).await?.embeddings)
}
