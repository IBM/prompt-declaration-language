from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

python_data = {
    "description": "Hello world showing call out to python code",
    "document": [
        "Hello, ",
        {
            "lan": "python",
            "code": ["import random\n", "import string\n", "result = 'Tracy'"],
        },
        "!\n",
    ],
}


def test_python():
    log = []
    data = Program.model_validate(python_data)
    _, document, _, _ = process_block(log, empty_scope, data.root)
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
                "show_result": show,
            }
        ],
    }


def test_show_result():
    log = []
    data = Program.model_validate(show_result_data(True))
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "How can I help you?: "


def test_show_result_false():
    log = []
    data = Program.model_validate(show_result_data(False))
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == ""


command_data = {
    "document": [
        {
            "def": "world",
            "document": {"lan": "command", "code": "echo -n World"},
            "show_result": False,
        },
        "Hello {{ world }}!",
    ]
}


def test_command():
    log = []
    data = Program.model_validate(command_data)
    _, document, scope, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!"
    assert scope["world"] == "World"
