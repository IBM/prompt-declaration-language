from pathlib import Path

from pdl.pdl_ast import Program  # pylint: disable=no-name-in-module
from pdl.pdl_interpreter import (  # pylint: disable=no-name-in-module
    InterpreterState,
    empty_scope,
    process_prog,
)

input_data = {
    "description": "Input block example",
    "text": [{"read": "tests/data/input_data.txt"}],
}


input_json_data = {
    "description": "Input block example with json input",
    "text": [
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
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        text
        == "Bob lives at the following address:\n87 Smith Road in the town of Armonk NY"
    )


input_json_data_defs = {
    "description": "Input block example with json input",
    "defs": {"data": {"read": "tests/data/input1.json", "parser": "json"}},
    "text": ["The name in the input is: ${ data.name }"],
}


def test_input_json_defs():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "The name in the input is: Carol"


input_json_data_defs1 = {
    "description": "Input block example with json input",
    "defs": {
        "data": {
            "read": "tests/data/input_data.txt",
        }
    },
    "text": ["${ data }"],
}


def test_input_json_defs1():
    state = InterpreterState()
    data = Program.model_validate(input_json_data_defs1)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"
