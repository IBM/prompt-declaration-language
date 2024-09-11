from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

python_data = {
    "description": "Hello world showing call out to python code",
    "document": [
        "Hello, ",
        {
            "lan": "python",
            "code": {
                "document": ["import random\n", "import string\n", "result = 'Tracy'"]
            },
        },
        "!\n",
    ],
}


def test_python():
    state = InterpreterState()
    data = Program.model_validate(python_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, Tracy!\n"


def show_result_data(show):
    return {
        "description": "Using a weather API and LLM to make a small weather app",
        "document": [
            {
                "def": "QUERY",
                "document": [
                    {"lan": "python", "code": ["result = 'How can I help you?: '"]}
                ],
                "contribute": show,
            }
        ],
    }


def test_contribute_result():
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["result"]))
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "How can I help you?: "


def test_contribute_context():
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["context"]))
    _, background, _, _ = process_prog(state, empty_scope, data)
    assert background[0] == [None, "How can I help you?: "]


def test_contribute_false():
    state = InterpreterState()
    data = Program.model_validate(show_result_data([]))
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == ""
