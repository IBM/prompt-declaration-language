from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

python_data = {
    "description": "Hello world showing call out to python code",
    "text": [
        "Hello, ",
        {
            "lan": "python",
            "code": {
                "text": ["import random\n", "import string\n", "result = 'Tracy'"]
            },
        },
        "!\n",
    ],
}


def test_python():
    state = InterpreterState()
    data = Program.model_validate(python_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "Hello, Tracy!\n"


def show_result_data(show):
    return {
        "description": "Using a weather API and LLM to make a small weather app",
        "text": [
            {
                "def": "QUERY",
                "text": [
                    {"lan": "python", "code": ["result = 'How can I help you?: '"]}
                ],
                "contribute": show,
            }
        ],
    }


def test_contribute_result():
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["result"]))
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "How can I help you?: "


def test_contribute_context():
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["context"]))
    _, background, _, _ = process_prog(state, empty_scope, data)
    assert background == [{"role": None, "content": "How can I help you?: "}]


def test_contribute_false():
    state = InterpreterState()
    data = Program.model_validate(show_result_data([]))
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == ""
