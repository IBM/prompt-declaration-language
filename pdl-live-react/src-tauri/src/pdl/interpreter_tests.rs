#[cfg(test)]
mod tests {
    //    use super::*;
    use ::std::error::Error;
    use serde_json::json;

    use crate::pdl::{
        ast::{ModelBlock, PdlBlock},
        interpreter::{run_json_sync as run_json, run_sync as run},
    };

    use ollama_rs::generation::chat::MessageRole;

    const DEFAULT_MODEL: &'static str = "ollama/granite3.2:2b";

    #[test]
    fn string() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run(&"hello".into(), None, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        Ok(())
    }

    #[test]
    fn single_model_via_input() -> Result<(), Box<dyn Error>> {
        let (messages, _) = run(
            &PdlBlock::Model(ModelBlock::new(DEFAULT_MODEL).input_str("hello").build()),
            None,
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
    fn text_read_file_text() -> Result<(), Box<dyn Error>> {
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

    #[test]
    fn text_read_file_struct() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "text": [
                { "read": "./tests/data/struct.yaml", "def": "struct", "parser": "yaml" },
                "${ struct.a.b }"
            ]
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(
            messages[0].content,
            "a:
  b: 3
"
        );
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "3");
        Ok(())
    }

    #[test]
    fn text_repeat_numbers_1d() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "for": {
                "x": [1,2,3]
            },
            "repeat": {
                "text": [
                    "${ x + 1 }"
                ]
            }
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 3);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "2");
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "3");
        assert_eq!(messages[2].role, MessageRole::User);
        assert_eq!(messages[2].content, "4");
        Ok(())
    }

    #[test]
    fn text_repeat_numbers_2d() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "for": {
                "x": [1,2,3],
                "y": [4,5,6]
            },
            "repeat": {
                "text": [
                    "${ x + y }"
                ]
            }
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 3);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "5");
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "7");
        assert_eq!(messages[2].role, MessageRole::User);
        assert_eq!(messages[2].content, "9");
        Ok(())
    }

    #[test]
    fn text_repeat_mix_2d() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "for": {
                "x": [{"z": 4}, {"z": 5}, {"z": 6}],
                "y": ["a","b","c"]
            },
            "repeat": {
                "text": [
                    "${ x.z ~ y }" // ~ is string concatenation in jinja
                ]
            }
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 3);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "4a");
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "5b");
        assert_eq!(messages[2].role, MessageRole::User);
        assert_eq!(messages[2].content, "6c");
        Ok(())
    }

    #[test]
    fn text_if_true() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "if": true,
            "then": "good"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good");
        Ok(())
    }

    #[test]
    fn text_if_false() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "if": false,
            "then": "bug",
            "else": "good"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good");
        Ok(())
    }

    #[test]
    fn text_if_with_defs() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "defs": {
                "x": 5
            },
            "if": "${x!=5}",
            "then": "bug",
            "else": "good"
        });

        let (messages, _) = run_json(program, false)?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good");
        Ok(())
    }
}
