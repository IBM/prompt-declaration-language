from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

defs_data = {
    "description": "Hello world with variable use",
    "defs": {
        "HELLO": "Hello,",
        "NAME": {
            "document": [
                {
                    "model": "ibm/granite-20b-code-instruct-v2",
                    "input": {"get": "HELLO"},
                    "parameters": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["!"],
                        "include_stop_sequence": False,
                    },
                }
            ]
        },
    },
    "document": [
        {"get": "HELLO"},
        {"get": "NAME"},
        "!\n",
    ],
}


def test_defs():
    state = InterpreterState()
    data = Program.model_validate(defs_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, world!\n"


defs_chain_data = {
    "description": "Hello world with variable use",
    "defs": {
        "X": {"data": "a"},
        "Y": {"data": "b"},
        "Z": [{"get": "X"}, {"get": "Y"}, "c"],
    },
    "document": [{"get": "X"}, {"get": "Y"}, {"get": "Z"}],
}


def test_defs_chain():
    state = InterpreterState()
    data = Program.model_validate(defs_chain_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "abc"


defs_only = {"description": "defs only", "defs": {"var": "hello"}}


def test_defs_only():
    state = InterpreterState()
    data = Program.model_validate(defs_only)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == ""
