import json
from pdl.pdl.pdl_interpreter import process_block
from pdl.pdl.pdl_ast import Program

python_data = {
    "title": "Hello world showing call out to python code",
    "prompts": [
        "Hello, ",
        {
            "var": "NAME",
            "lookup": {
                "lan": "python",
                "code": ["import random\n", "import string\n", "result = 'Tracy'"],
            },
        },
        "!\n",
    ],
}


def test_python():
    scope = {}
    context = []
    data = Program.model_validate_json(json.dumps(python_data))
    process_block(scope, context, data.root)
    assert context == ["Hello, ", "Tracy", "!\n"]


def show_result_data(show):
    return {
        "title": "Using a weather API and LLM to make a small weather app",
        "prompts": [
            {
                "var": "QUERY",
                "lookup": {
                    "lan": "python",
                    "code": ["result = 'How can I help you?: '"],
                    "show_result": show,
                },
            }
        ],
    }


def test_show_result():
    scope = {}
    context = []
    data = Program.model_validate_json(json.dumps(show_result_data(True)))
    process_block(scope, context, data.root)
    assert context == ["How can I help you?: "]


def test_show_result_false():
    scope = {}
    context = []
    data = Program.model_validate_json(json.dumps(show_result_data(False)))
    process_block(scope, context, data.root)
    assert context == []
