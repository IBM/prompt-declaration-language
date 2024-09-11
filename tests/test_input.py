from pathlib import Path

from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

input_data = {
    "description": "Input block example",
    "document": [{"read": "tests/data/input_data.txt"}],
}


input_json_data = {
    "description": "Input block example with json input",
    "document": [
        {
            "read": "./data/input.json",
            "parser": "json",
            "def": "PERSON",
            "contribute": [],
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
    state = InterpreterState(cwd=Path(__file__).parent)
    data = Program.model_validate(input_json_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        document
        == "Bob lives at the following address:\n87 Smith Road in the town of Armonk NY"
    )


input_json_data_defs = {
    "description": "Input block example with json input",
    "defs": {"data": {"read": "tests/data/input1.json", "parser": "json"}},
    "document": ["The name in the input is: {{ data.name }}"],
}


def test_input_json_defs():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "The name in the input is: Carol"


input_json_data_defs1 = {
    "description": "Input block example with json input",
    "defs": {
        "data": {
            "read": "tests/data/input_data.txt",
        }
    },
    "document": ["{{ data }}"],
}


def test_input_json_defs1():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs1)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"
