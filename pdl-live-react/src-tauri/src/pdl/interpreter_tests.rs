#[cfg(test)]
mod tests {
    use ::std::error::Error;
    use serde_json::json;

    use crate::pdl::{
        ast::{Block, Body::*, ModelBlockBuilder, PdlBlock, PdlBlock::Advanced, PdlResult, Scope},
        interpreter::{RunOptions, load_scope, run_json_sync as run_json, run_sync as run},
    };

    use ollama_rs::generation::chat::MessageRole;

    const DEFAULT_MODEL: &'static str = "ollama/granite3.2:2b";

    fn streaming<'a>() -> RunOptions<'a> {
        let mut o: RunOptions = Default::default();
        o.stream = true;
        o
    }

    /* fn non_streaming<'a>() -> RunOptions<'a> {
        let mut o: RunOptions = Default::default();
        o.stream = false;
        o
    } */

    fn initial_scope() -> Scope {
        Default::default()
    }

    #[test]
    fn string() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run(&"hello".into(), None, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        Ok(())
    }

    #[test]
    fn string_via_initial_scope() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run(
            &"${x}".into(),
            None,
            streaming(),
            load_scope(
                None,
                None,
                Some(json!({
                    "x": 333
                })),
            )?,
        )?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "333");
        Ok(())
    }

    #[test]
    fn single_model_via_input_string() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run(
            &Advanced(Block {
                metadata: None,
                body: Model(
                    ModelBlockBuilder::default()
                        .model(DEFAULT_MODEL)
                        .input(Box::from(PdlBlock::String("hello".to_string())))
                        .build()?,
                ),
            }),
            None,
            streaming(),
            initial_scope(),
        )?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::Assistant);
        assert!(messages[0].content.contains("Hello!"));
        Ok(())
    }

    #[test]
    fn single_model_via_text_chain_expr() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run_json(
            json!({
                "text": [
                    "hello",
                    {"model": { "pdl__expr": DEFAULT_MODEL }}
                ]
            }),
            streaming(),
            initial_scope(),
        )?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        assert_eq!(messages[1].role, MessageRole::Assistant);
        assert!(messages[1].content.contains("Hello!"));
        Ok(())
    }

    #[test]
    fn single_model_via_text_chain() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run_json(
            json!({
                "text": [
                    "hello",
                    { "model": DEFAULT_MODEL }
                ]
            }),
            streaming(),
            initial_scope(),
        )?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello");
        assert_eq!(messages[1].role, MessageRole::Assistant);
        assert!(messages[1].content.contains("Hello!"));
        Ok(())
    }

    #[test]
    fn single_model_via_input_array() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run_json(
            json!({
                "model": DEFAULT_MODEL,
                "input": {
                    "array": [
                        { "role": "system", "content": "answer as if you live in europe" },
                        { "role": "user", "content": "what is the fastest animal where you live?" },
                    ]
                }
            }),
            streaming(),
            initial_scope(),
        )?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::Assistant);
        let m = messages[0].content.to_lowercase();
        assert!(
            m.contains("pronghorn")
                || m.contains("falcon")
                || m.contains("bison")
                || m.contains("native")
        );
        Ok(())
    }

    #[test]
    fn two_models_via_text_chain() -> Result<(), Box<dyn Error>> {
        let (_, messages, _) = run_json(
            json!({
                "text": [
                    "what is the fastest animal?",
                    { "model": DEFAULT_MODEL },
                    "in europe?",
                    { "model": DEFAULT_MODEL },
                ]
            }),
            streaming(),
            initial_scope(),
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
        let json = "{\"key\":\"value\"}";
        let program = json!({
            "text": [
                { "def": "foo", "parser": "json", "text": [json] },
                "${ foo.key }"
            ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, json);
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "value");
        Ok(())
    }

    #[test]
    fn text_parser_jsonl() -> Result<(), Box<dyn Error>> {
        let json = "{\"key\":\"value\"}
{\"key2\":\"value2\"}";
        let program = json!({
            "text": [
                { "def": "foo", "parser": "jsonl", "text": [json] },
                "${ foo[0].key }",
                "${ foo[1].key2 }"
            ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 3);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, json);
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "value");
        assert_eq!(messages[2].role, MessageRole::User);
        assert_eq!(messages[2].content, "value2");
        Ok(())
    }

    #[test]
    fn last_of_parser_json() -> Result<(), Box<dyn Error>> {
        let json = "{\"key\":\"value\"}";
        let program = json!({
            "lastOf": [
                { "def": "foo", "parser": "json", "text": [json] },
                "${ foo.key }"
            ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "value");
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "{'foo': 3}");
        Ok(())
    }

    #[test]
    fn text_python_two_code_result_dict() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "text": [
                { "lang": "python",
                   "code":"print('hi ho'); result = {\"foo\": 3}"
                },
                { "lang": "python",
                   "code":"import os; print('hi ho'); result = {\"foo\": 4}"
                }
            ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "{'foo': 3}");
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "{'foo': 4}");
        Ok(())
    }

    // TODO: illegal instruction, but only during tests
    #[test]
    fn text_python_code_import_venv() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/code-python.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(
            messages[0].content,
            "{'foo': None, 'diff': {'D': {'two': {'N': 3}}}}"
        );
        Ok(())
    }

    #[test]
    fn text_read_file_text() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "message": "Read a file",
            "read":"./tests/data/foo.txt"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
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

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good");
        Ok(())
    }

    #[test]
    fn text_object_via_defs_1() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "defs": {
                "obj": {
                    "object": {
                        "a": {
                            "text": [ "good on object" ]
                        }
                    }
                }
            },
            "text": [ "${ obj.a }" ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good on object");
        Ok(())
    }

    #[test]
    fn text_object_via_defs_2() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "defs": {
                "obj": {
                    "object": {
                        "a": {
                            "object": {
                                "b": {
                                    "text": [ "good on object" ]
                                }
                            }
                        }
                    }
                }
            },
            "text": [ "${ obj.a.b }" ]
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "good on object");
        Ok(())
    }

    #[test]
    fn include() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/call-with-args.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "hello world 4 bye");
        Ok(())
    }

    #[test]
    fn data_1() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/data1.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "xxxx3true");
        Ok(())
    }

    #[test]
    fn data_2() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/data2.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "xxxx3true");
        Ok(())
    }

    #[test]
    fn data_3() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/data3.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "${x}3true");
        Ok(())
    }

    #[test]
    fn data_4() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/data4.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "yyyyxxxx3true");
        Ok(())
    }

    #[test]
    fn import_1() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "../../examples/tutorial/import.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "Bye!");
        Ok(())
    }

    #[test]
    fn scoping_1() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "include": "./tests/cli/scoping_1.pdl"
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "3yo");
        assert_eq!(messages[1].role, MessageRole::User);
        assert_eq!(messages[1].content, "mo");
        Ok(())
    }

    #[test]
    fn regex_findall() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "data": "aaa999bbb888",
            "parser": {
                "regex": "[^0-9]*(?P<answer1>[0-9]+)[^0-9]*(?P<answer2>[0-9]+)$",
                "mode": "findall",
                "spec": {
                    "answer1": "str",
                    "answer2": "str"
                }
            }
        });

        let (_, messages, _) = run_json(program, streaming(), initial_scope())?;
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].role, MessageRole::User);
        assert_eq!(messages[0].content, "[\"999\",\"888\"]");
        Ok(())
    }

    #[test]
    fn regex_plain_1() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "data": "aaa999bbb888",
            "parser": {
                "regex": "[^0-9]*(?P<answer1>[0-9]+)[^0-9]*(?P<answer2>[0-9]+)$",
                "spec": {
                    "answer1": "str",
                    "answer2": "str"
                }
            }
        });

        let (result, _, _) = run_json(program, streaming(), initial_scope())?;
        let mut m = ::std::collections::HashMap::new();
        m.insert("answer1".into(), "999".into());
        m.insert("answer2".into(), "888".into());
        assert_eq!(result, PdlResult::Dict(m));
        Ok(())
    }

    #[test]
    fn regex_plain_2() -> Result<(), Box<dyn Error>> {
        let program = json!({
            "data": "aaa999bbb888",
            "parser": {
                "regex": "[^0-9]*(?P<answer1>[0-9]+)[^0-9]*(?P<answer2>[0-9]+)$",
                "spec": {
                    "answer1": "str",
                }
            }
        });

        let (result, _, _) = run_json(program, streaming(), initial_scope())?;
        let mut m = ::std::collections::HashMap::new();
        m.insert("answer1".into(), "999".into());
        assert_eq!(result, PdlResult::Dict(m));
        Ok(())
    }

    #[test]
    fn bee_1() -> Result<(), Box<dyn Error>> {
        let program = crate::compile::beeai::compile("./tests/data/bee_1.py", false)?;
        // non-streaming currently broken due to issues invoking beeai_framework python tools via RustPython
        let (_, messages, _) = run(&program, None, /*non_*/ streaming(), initial_scope())?;
        assert_eq!(messages.len(), 9);
        assert!(
            messages.iter().any(|m| m.role == MessageRole::User
                && m.content == "Provide a short history of Saint-Tropez."),
            "Could not find message user:Provide a short history of Saint-Tropez. in {:?}",
            messages
        );
        assert!(
            messages.iter().any(|m| m.role == MessageRole::System
                && m.content
                    == "You can combine disparate information into a final coherent summary."),
            "Could not find message system:Provide a short history of Saint-Tropez. in {:?}",
            messages
        );
        // assert!(messages.iter().any(|m| m.role == MessageRole::Assistant && m.content.contains("a renowned French Riviera town")), "Could not find message assistant:a renowned French Riviera town in {:?}", messages);
        //assert_eq!(true, messages.iter().any(|m| m.role == MessageRole::Assistant && m.content.contains("I'll use the OpenMeteoTool")));
        //assert_eq!(true, messages.iter().any(|m| m.role == MessageRole::Assistant && m.content.contains("The current temperature in Saint-Tropez")));

        Ok(())
    }
}
