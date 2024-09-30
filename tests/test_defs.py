from pdl.pdl_ast import Program  # pylint: disable=no-name-in-module
from pdl.pdl_interpreter import (  # pylint: disable=no-name-in-module
    InterpreterState,
    empty_scope,
    process_prog,
)

defs_data = {
    "description": "Hello world with variable use",
    "defs": {
        "HELLO": "Hello,",
        "NAME": {
            "text": [
                {
                    "model": "watsonx/ibm/granite-34b-code-instruct",
                    "input": {"get": "HELLO"},
                    "parameters": {
                        "stop": ["!"],
                        "include_stop_sequence": False,
                        "mock_response": " World",
                    },
                }
            ]
        },
    },
    "text": [
        {"get": "HELLO"},
        {"get": "NAME"},
        "!\n",
    ],
}


def test_defs():
    state = InterpreterState()
    data = Program.model_validate(defs_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "Hello, World!\n"


defs_chain_data = {
    "description": "Hello world with variable use",
    "defs": {
        "X": {"data": "a"},
        "Y": {"data": "b"},
        "Z": {"text": [{"get": "X"}, {"get": "Y"}, "c"]},
    },
    "text": [{"get": "X"}, {"get": "Y"}, {"get": "Z"}],
}


def test_defs_chain():
    state = InterpreterState()
    data = Program.model_validate(defs_chain_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "ababc"


defs_only = {"description": "defs only", "defs": {"var": "hello"}}


def test_defs_only():
    state = InterpreterState()
    data = Program.model_validate(defs_only)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == ""
