from pathlib import Path

from pdl.pdl import InterpreterConfig, exec_dict

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
    config = InterpreterConfig(cwd=Path(__file__).parent)
    text = exec_dict(input_json_data, config=config)
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
    text = exec_dict(input_json_data_defs)
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
    text = exec_dict(input_json_data_defs1)
    assert text == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"
