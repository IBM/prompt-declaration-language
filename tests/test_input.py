from pdl.pdl.pdl_ast import ErrorBlock  # pyright: ignore
from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

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
    log = []
    data = Program.model_validate(input_json_data)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert (
        document
        == "Bob lives at the following address:\n87 Smith Road in the town of Armonk NY"
    )


input_json_data_error = {
    "description": "Input block example with json input",
    "document": [
        {
            "read": "tests/data/input1.json",
            "parser": "json",
            "show_result": False,
        }
    ],
}


def test_input_json_error():
    log = []
    data = Program.model_validate(input_json_data_error)
    _, _, _, trace = process_block(log, empty_scope, data.root)
    assert isinstance(trace.document[0], ErrorBlock)
