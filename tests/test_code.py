from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

python_data = {
    "title": "Hello world showing call out to python code",
    "prompts": [
        "Hello, ",
        {
            "lan": "python",
            "code": ["import random\n", "import string\n", "result = 'Tracy'"],
        },
        "!\n",
    ],
}


def test_python():
    scope = {}
    log = []
    data = Program.model_validate(python_data)
    document = process_block(log, scope, [], data.root)
    assert document == ["Hello, ", "Tracy", "!\n"]


def show_result_data(show):
    return {
        "title": "Using a weather API and LLM to make a small weather app",
        "prompts": [
            {
                "assign": "QUERY",
                "prompts": [
                    {"lan": "python", "code": ["result = 'How can I help you?: '"]}
                ],
                "show_result": show,
            }
        ],
    }


def test_show_result():
    scope = {}
    log = []
    data = Program.model_validate(show_result_data(True))
    document = process_block(log, scope, [], data.root)
    assert document == ["How can I help you?: "]


def test_show_result_false():
    scope = {}
    log = []
    data = Program.model_validate(show_result_data(False))
    document = process_block(log, scope, [], data.root)
    assert document == []
