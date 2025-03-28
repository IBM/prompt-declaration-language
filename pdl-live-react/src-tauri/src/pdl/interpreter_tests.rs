#[cfg(test)]
mod tests {
    //    use super::*;
    use ::std::error::Error;
    use serde_json::json;

    use crate::pdl::{
        ast::{PdlBlock, PdlModelBlock, PdlParser, PdlTextBlock},
        interpreter::{run_json_sync as run_json, run_sync as run},
    };

    use ollama_rs::generation::chat::MessageRole;

    const DEFAULT_MODEL: &'static str = "ollama/granite3.2:2b";

    #[test]
    fn string() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run(&"hello".into(), false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        Ok(())
    }

    #[test]
    fn single_model_via_input() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run(
            &PdlBlock::Model(PdlModelBlock::new(DEFAULT_MODEL).input_str("hello").build()),
            false,
        )?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::Assistant);
        assert!(messages[0].content.contains("Hello!"));
        Ok(())
    }

    #[test]
    fn single_model_via_text_chain() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run_json(
            json!({
                "text": [
                    "hello",
                    { "model": DEFAULT_MODEL }
                ]
            }),
            false,
        )?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        assert_eq!(messages[1].role, MessageRole::Assistant);
        assert!(messages[1].content.contains("Hello!"));
        Ok(())
    }

    #[test]
    fn two_models_via_text_chain() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run_json(
            json!({
                "text": [
                    "what is the fastest animal?",
                    { "model": DEFAULT_MODEL },
                    "in europe?",
                    { "model": DEFAULT_MODEL },
                ]
            }),
            false,
        )?;
        assert_eq!(messages.len(), 4);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "what is the fastest animal?");
        assert_eq!(messages[1].role, MessageRole::Assistant);
        let m1 = messages[1].content.to_lowercase();
        assert!(m1.contains("cheetah") || m1.contains("springbok"));
        assert_eq!(messages[2].role, MessageRole::User);
        assert_eq!(messages[2].content, "in europe?");
        assert_eq!(messages[3].role, MessageRole::Assistant);

        let m3 = messages[3].content.to_lowercase();
        assert!(
            m3.contains("peregrine")
                || m3.contains("bison")
                || m3.contains("hare")
                || m3.contains("golden eagle")
                || m3.contains("greyhound")
                || m3.contains("gazelle")
                || m3.contains("lynx")
                || m3.contains("boar")
                || m3.contains("sailfish")
                || m3.contains("pronghorn")
        );
        Ok(())
    }

    #[test]
    fn text_parser_json() -> Result<(), Box<dyn Error>> {
        let json = "{\"key\": \"value\"}";
        let program = json!({
            "text": [
                { "def": "foo", "parser": "json", "text":  [json] },
                "${ foo.key }"
            ]
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, json);
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "value");
        Ok(())
    }

    #[test]
    fn text_call_function_no_args() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "defs": {
                "foo": {
                    "function": {},
                    "return": {
                        "description": "nullary function",
                        "text": [
                            "hello world"
                        ]
                    }
                }
            },
            "text": [
                { "call": "${ foo }" },
            ]
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello world");
        Ok(())
    }

    #[test]
    fn text_call_function_with_args() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "defs": {
                "foo": {
                    "function": {
                        "x": "int"
                    },
                    "return": {
                        "description": "unary function",
                        "text": [
                            "hello world ${x+1}"
                        ]
                    }
                }
            },
            "text": [
                { "call": "${ foo }", "args": { "x": 3 } },
            ]
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello world 4");
        Ok(())
    }

    #[test]
    fn text_python_code_result_int() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "lang": "python",
            "code":"print('hi ho'); result = 33"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "33");
        Ok(())
    }

    #[test]
    fn text_python_code_result_str() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "lang": "python",
            "code":"print('hi ho'); result = 'foo'"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "foo");
        Ok(())
    }

    #[test]
    fn text_python_code_result_dict() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "lang": "python",
            "code":"print('hi ho'); result = {\"foo\": 3}"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "{'foo': 3}");
        Ok(())
    }

    #[test]
    fn text_read_file() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "message": "Read a file",
            "read":"./tests/data/foo.txt"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "this should be foo\n");
        Ok(())
    }
}
