from pdl.pdl_ast import Program
from pdl.pdl_interpreter import (
    InterpreterState,
    contains_error,
    empty_scope,
    process_prog,
)

model_parser = {
    "model": "ibm/granite-20b-code-instruct",
    "spec": {"bob": "int", "carol": "int"},
    "input": {
        "document": [
            "Write a JSON object with 2 fields 'a' and 'b' of type int and set to 0.",
            '{"a": 0, "b": 0}',
            "\n",
            "Write a JSON object with 3 fields 'x' and 'y' and 'z' set to '1', '2', '3' respectively.",
            '{"x": 1, "y": 2, "z": 3}',
            "\n",
            "Write a JSON object with 2 fields 'bob' and 'carol' set to '20' and '30' respectively.",
        ]
    },
    "parser": "json",
    "params": {"stop_sequences": ["}"], "include_stop_sequence": True},
}


def test_model_parser():
    state = InterpreterState()
    data = Program.model_validate(model_parser)
    result, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert result == {"bob": 20, "carol": 30}


model_parser1 = {
    "model": "ibm/granite-34b-code-instruct",
    "spec": {"bob": "int", "carol": "int"},
    "input": {
        "document": [
            "Write a JSON object with 2 fields 'bob' and 'carol' set to '20' and '30' respectively. Write 30 in letters",
        ]
    },
    "parser": "json",
    "params": {"stop_sequences": ["}"], "include_stop_sequence": True},
}


def test_model_parser1():
    state = InterpreterState()
    data = Program.model_validate(model_parser1)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


get_parser = {"get": "x", "parser": "json", "def": "y", "show_result": False}


def test_get_parser():
    state = InterpreterState()
    data = Program.model_validate(get_parser)
    scope = {"x": '{"a": "foo", "b": "bar"}'}
    result, _, scope, trace = process_prog(state, scope, data)
    assert not contains_error(trace)
    assert result == ""
    assert scope["x"] == '{"a": "foo", "b": "bar"}'
    assert scope["y"] == {"a": "foo", "b": "bar"}


code_parser = {
    "lan": "python",
    "parser": "json",
    "code": {
        "document": [
            "import json\n",
            "r = {'a':'b', 'c':'d'}\n",
            "result=json.dumps(r)",
        ]
    },
}


def test_code_parser():
    state = InterpreterState()
    data = Program.model_validate(code_parser)
    result, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert result == {"a": "b", "c": "d"}


code_parser1 = {
    "lan": "python",
    "code": "r = {'a':'b', 'c':'d'}\nresult=str(r)",
}


def test_code_parser1():
    state = InterpreterState()
    data = Program.model_validate(code_parser1)
    result, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert result == "{'a': 'b', 'c': 'd'}"
