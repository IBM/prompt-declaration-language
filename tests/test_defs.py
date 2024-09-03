from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

defs_data = {
    "description": "Hello world with variable use",
    "defs": {
        "HELLO": "Hello,",
        "NAME": {
            "document": [
                {
                    "model": "ibm/granite-34b-code-instruct",
                    "input": {"get": "HELLO"},
                    "params": {
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
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, World!\n"


defs_chain_data = {
    "description": "Hello world with variable use",
    "defs": {
        "X": {"data": "a"},
        "Y": {"data": "b"},
        "Z": {"document": [{"get": "X"}, {"get": "Y"}, "c"]},
    },
    "document": [{"get": "X"}, {"get": "Y"}, {"get": "Z"}],
}


def test_defs_chain():
    state = InterpreterState()
    data = Program.model_validate(defs_chain_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "ababc"


defs_only = {"description": "defs only", "defs": {"var": "hello"}}


def test_defs_only():
    state = InterpreterState()
    data = Program.model_validate(defs_only)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == ""
