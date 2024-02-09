from pdl.pdl.pdl_ast import ErrorBlock  # pyright: ignore
from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

input_data = {
    "description": "Input block example",
    "prompts": [{"filename": "tests/data/input_data.txt"}],
}


def test_input_filename():
    scope = {}
    log = []
    data = Program.model_validate(input_data)
    document, _ = process_block(log, scope, "", data.root)
    assert document == "Hello World!\nThis is a prompt descriptor.\nOr is it?\n"


input_data_error = {
    "description": "Input block example",
    "prompts": [{"filename": "tests/data/input_data.txt", "stdin": True}],
}


def test_input_error():
    scope = {}
    log = []
    data = Program.model_validate(input_data_error)
    _, trace = process_block(log, scope, "", data.root)
    assert isinstance(trace.prompts[0], ErrorBlock)


input_data_error1 = {
    "description": "Input block example",
    "prompts": [{"stdin": False}],
}


def test_input_error1():
    scope = {}
    log = []
    data = Program.model_validate(input_data_error1)
    _, trace = process_block(log, scope, "", data.root)
    assert isinstance(trace.prompts[0], ErrorBlock)
