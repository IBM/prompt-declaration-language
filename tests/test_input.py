from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

input_data = {
    "description": "Input block example",
    "document": [{"read": "tests/data/input_data.txt"}],
}


input_json_data = {
    "description": "Input block example with json input",
    "document": [
        {
            "read": "tests/data/input.json",
            "parser": "json",
            "def": "PERSON",
            "show_result": False,
        },
        {"get": "PERSON.name"},
        " lives at the following address:\n",
        {"get": "PERSON.address.number"},
        " ",
        {"get": "PERSON.address.street"},
        " in the town of ",
        {"get": "PERSON.address.town"},
        " ",
        {"get": "PERSON.address.state"},
    ],
}


def test_input_json():
    state = InterpreterState()
    data = Program.model_validate(input_json_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert (
        document
        == "Bob lives at the following address:\n87 Smith Road in the town of Armonk NY"
    )


input_json_data_defs = {
    "description": "Input block example with json input",
    "defs": {
        "data": {
            "read": "tests/data/input1.json",
            "parser": "json",
            "show_result": False,
        }
    },
    "document": ["The name in the input is: {{ data.name }}"],
}


def test_input_json_defs():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "The name in the input is: Carol"


input_json_data_defs1 = {
    "description": "Input block example with json input",
    "defs": {
        "data": {
            "read": "tests/data/input_data.txt",
            "show_result": True,
        }
    },
    "document": ["{{ data }}"],
}


def test_input_json_defs1():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs1)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"
