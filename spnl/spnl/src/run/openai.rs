use futures::StreamExt;
use indicatif::{MultiProgress, ProgressBar};
use tokio::io::{AsyncWriteExt, stdout};

use async_openai::{
    Client,
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestSystemMessage,
        ChatCompletionRequestSystemMessageContent, ChatCompletionRequestUserMessage,
        ChatCompletionRequestUserMessageContent, CreateChatCompletionRequestArgs,
    },
};

use crate::{Unit, run::result::SpnlResult};

pub async fn generate_openai(
    model: &str,
    input: &Unit,
    max_tokens: i32,
    temp: f32,
    m: Option<&MultiProgress>,
) -> SpnlResult {
    let client = Client::with_config(OpenAIConfig::new().with_api_base("http://localhost:8000/v1"));

    let input_messages = messagify(input);

    let quiet = m.is_some();
    let mut stdout = stdout();
    /* if !quiet {
        if let Some(ChatCompletionRequestMessage::User(ChatCompletionRequestUserMessage {
            content: ChatCompletionRequestUserMessageContent::Text(content),
            ..
        })) = input_messages.last()
        {
            stdout.write_all(b"\x1b[1mUser: \x1b[0m").await?;
            stdout.write_all(content.as_bytes()).await?;
            stdout.write_all(b"\n").await?;
        }
    } */

    let request = CreateChatCompletionRequestArgs::default()
        .model(model)
        .messages(input_messages)
        .temperature(temp)
        .max_completion_tokens(if max_tokens == 0 {
            10000
        } else {
            max_tokens as u32
        })
        .build()?;

    let mut pb = m.and_then(|m| {
        Some(m.add(if max_tokens == 0 {
            ProgressBar::no_length()
        } else {
            ProgressBar::new(max_tokens as u64)
        }))
    });

    // println!("A {:?}", client.models().list().await?);

    let mut response_string = String::new();
    if !quiet {
        stdout.write_all(b"\x1b[1mAssistant: \x1b[0m").await?;
    }

    let mut stream = client.chat().create_stream(request).await?;
    while let Some(Ok(res)) = stream.next().await {
        let mut iter = res.choices.iter();
        while let Some(chat_choice) = iter.next() {
            if let Some(ref content) = chat_choice.delta.content {
                if !quiet {
                    stdout.write_all(b"\x1b[32m").await?; // green
                    stdout.write_all(content.as_bytes()).await?;
                    stdout.flush().await?;
                    stdout.write_all(b"\x1b[0m").await?; // reset color
                } else {
                    pb.as_mut().map(|pb| pb.inc(content.len() as u64));
                }
                response_string += content.as_str();
            }
        }
    }
    if !quiet {
        stdout.write_all(b"\n").await?;
    }

    if let Some(_) = m {
        Ok(Unit::User((response_string,)))
    } else {
        Ok(Unit::Generate((
            format!("openai/{model}"),
            Box::new(Unit::User((response_string,))),
            max_tokens,
            temp,
            false,
        )))
    }
}

fn messagify(input: &Unit) -> Vec<ChatCompletionRequestMessage> {
    match input {
        Unit::Cross(v) | Unit::Plus(v) => v.into_iter().flat_map(messagify).collect(),
        Unit::System((s,)) => vec![ChatCompletionRequestMessage::System(
            ChatCompletionRequestSystemMessage {
                name: None,
                content: ChatCompletionRequestSystemMessageContent::Text(s.clone()),
            },
        )],
        o => {
            let s = o.to_string();
            if s.len() == 0 {
                vec![]
            } else {
                vec![ChatCompletionRequestMessage::User(
                    ChatCompletionRequestUserMessage {
                        name: None,
                        content: ChatCompletionRequestUserMessageContent::Text(o.to_string()),
                    },
                )]
            }
        }
    }
}
