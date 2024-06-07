from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import (  # pyright: ignore
    InterpreterState,
    contains_error,
    process_prog,
)

var_data = {
    "description": "Hello world with variable use",
    "document": [
        "Hello,",
        {
            "def": "NAME",
            "document": [
                {
                    "model": "ibm/granite-20b-code-instruct-v2",
                    "parameters": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["!"],
                        "include_stop_sequence": False,
                    },
                }
            ],
        },
        "!\n",
        "Tell me about",
        {"get": "NAME"},
        "?\n",
    ],
}


def test_var():
    state = InterpreterState()
    data = Program.model_validate(var_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, world!\nTell me about world?\n"


code_var_data = {
    "description": "simple python",
    "document": [
        {
            "def": "I",
            "lan": "python",
            "code": ["result = 0"],
            "show_result": True,
        },
    ],
}


def test_code_var():
    state = InterpreterState()
    data = Program.model_validate(code_var_data)
    _, document, scope, _ = process_prog(state, empty_scope, data)
    assert scope == {"context": document, "I": 0}
    assert document == "0"


missing_var = {
    "description": "simple python",
    "document": [{"get": "somevar"}],
}


def test_missing_var():
    state = InterpreterState()
    data = Program.model_validate(missing_var)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


missing_call = {
    "description": "simple python",
    "document": [{"call": "somevar"}],
}


def test_missing_call():
    state = InterpreterState()
    data = Program.model_validate(missing_call)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)
