from pdl.pdl_ast import get_default_model_parameters
from pdl.pdl_utils import apply_defaults


def test_default_model_params_empty():
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-8k", {}, []
    )
    assert {} == params


def test_default_model_params_nomatch():
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-8k",
        {},
        [{"dummy": {"foo": "bar"}}],
    )
    assert {} == params


def test_default_model_params_exact_match():
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-8k",
        {"foo": "baz"},
        [
            {
                "replicate/ibm-granite/granite-20b-code-instruct-8k": {
                    "foo": "bar",
                    "max_tokens": 9999,
                }
            }
        ],
    )
    assert {"foo": "baz", "max_tokens": 9999} == params


def test_default_model_params_partial_matches():
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-8k",
        {"foo": "baz"},
        [
            {
                "*granite*": {
                    "foo": "bar",
                    "max_tokens": 9999,
                },
            },
            {
                "*instruct-8k*": {
                    "fruit": "banana",
                    "max_tokens": 777,
                }
            },
            {
                "*destruct-401k*": {
                    "vegetable": "carrot",
                    "max_tokens": 888,
                }
            },
        ],
    )
    assert {"foo": "baz", "fruit": "banana", "max_tokens": 777} == params


def test_default_model_params():
    model_defaults = get_default_model_parameters()
    # No defaults for this model
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-8k", {}, model_defaults
    )
    assert {} == params

    # Granite-3.0 defaults for this model
    params = apply_defaults(
        "replicate/ibm-granite/granite-3.1-8b-instruct", {}, model_defaults
    )
    assert {
        "temperature": 0,
        "roles": {
            "system": {
                "pre_message": "<|start_of_role|>system<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
            "user": {
                "pre_message": "<|start_of_role|>user<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
            "assistant": {
                "pre_message": "<|start_of_role|>assistant<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
            "tools": {
                "pre_message": "<|start_of_role|>tools<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
            "tool_response": {
                "pre_message": "<|start_of_role|>tool_response<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
            "documents": {
                "pre_message": "<|start_of_role|>documents<|end_of_role|>",
                "post_message": "<|end_of_text|>",
            },
        },
        "final_prompt_value": "<|start_of_role|>assistant<|end_of_role|>",
    } == params


def test_default_not_granite_20b_code_instruct_r1_1():
    # Don't apply defaults to granite-20b-code-instruct-r1.1
    model_defaults = get_default_model_parameters()
    params = apply_defaults(
        "replicate/ibm-granite/granite-20b-code-instruct-r1.1", {}, model_defaults
    )
    assert {} == params


def test_default_granite_3_2():
    model_defaults = get_default_model_parameters()
    params = apply_defaults("ollama/granite3.2", {}, model_defaults)
    assert {"temperature": 0} == params
