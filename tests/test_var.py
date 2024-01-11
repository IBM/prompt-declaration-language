import json

from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

var_data = {
    "title": "Hello world with variable use",
    "prompts": [
        "Hello,",
        {
            "var": "NAME",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "decoding": "argmax",
                "input": "context",
                "stop_sequences": ["!"],
            },
        },
        "!\n",
        "Who is",
        {"value": "NAME"},
        "?\n",
    ],
}


def test_var():
    scope = {}
    context = []
    data = Program.model_validate_json(json.dumps(var_data))
    process_block(scope, context, data.root)
    assert context == ["Hello,", " world", "!\n", "Who is", " world", "?\n"]
