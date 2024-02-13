from pdl.pdl.pdl_ast import ErrorBlock  # pyright: ignore
from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

input_data = {
    "description": "Input block example",
    "prompts": [{"filename": "tests/data/input_data.txt"}],
}


def test_input_filename():
    log = []
    data = Program.model_validate(input_data)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"


input_data_error = {
    "description": "Input block example",
    "prompts": [{"filename": "tests/data/input_data.txt", "stdin": True}],
}


def test_input_error():
    log = []
    data = Program.model_validate(input_data_error)
    _, _, trace = process_block(log, empty_scope, data.root)
    assert isinstance(trace.prompts[0], ErrorBlock)


input_data_error1 = {
    "description": "Input block example",
    "prompts": [{"stdin": False}],
}


def test_input_error1():
    log = []
    data = Program.model_validate(input_data_error1)
    _, _, trace = process_block(log, empty_scope, data.root)
    assert isinstance(trace.prompts[0], ErrorBlock)


input_json_data = {
    "description": "Input block example with json input",
    "prompts": [
        {
            "filename": "tests/data/input.json",
            "json_content": True,
            "assign": "PERSON",
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
    log = []
    data = Program.model_validate(input_json_data)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert (
        document
        == "Bob lives at the following address:\n87 Smith Road in the town of Armonk NY"
    )


input_json_data_error = {
    "description": "Input block example with json input",
    "prompts": [
        {
            "filename": "tests/data/input1.json",
            "json_content": True,
            "show_result": False,
        }
    ],
}


def test_input_json_error():
    log = []
    data = Program.model_validate(input_json_data_error)
    _, _, trace = process_block(log, empty_scope, data.root)
    assert isinstance(trace.prompts[0], ErrorBlock)
