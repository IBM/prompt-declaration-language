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
    document = []
    data = Program.model_validate(var_data)
    process_block(scope, document, data.root)
    assert document == ["Hello,", " world", "!\n", "Who is", " world", "?\n"]


code_var_data = {
    "title": "simple python",
    "prompts": [
        {
            "var": "I",
            "lookup": {"lan": "python", "code": ["result = 0"], "show_result": True},
        },
    ],
}


def test_code_var():
    scope = {}
    document = []
    data = Program.model_validate(code_var_data)
    process_block(scope, document, data.root)
    assert scope == {"I": "0"}
    assert document == ["0"]
