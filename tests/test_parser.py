import pytest

from pdl.pdl import exec_str
from pdl.pdl_ast import Program
from pdl.pdl_interpreter import (
    InterpreterState,
    PDLRuntimeError,
    empty_scope,
    process_prog,
)

model_parser = {
    "model": "watsonx/ibm/granite-20b-code-instruct",
    "spec": {"bob": "int", "carol": "int"},
    "input": {
        "text": [
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
    "parameters": {
        "stop": ["}"],
        "mock_response": '{"bob": 20, "carol": 30}',
    },
}


def test_model_parser():
    state = InterpreterState()
    data = Program.model_validate(model_parser)
    result, _, _, _ = process_prog(state, empty_scope, data)
    assert result == {"bob": 20, "carol": 30}


model_parser1 = {
    "model": "watsonx/ibm/granite-34b-code-instruct",
    "spec": {"bob": "int", "carol": "int"},
    "input": {
        "text": [
            "Write a JSON object with 2 fields 'bob' and 'carol' set to '20' and '30' respectively. Write 30 in letters",
        ]
    },
    "parser": "json",
    "parameters": {"stop_sequences": ["}"], "include_stop_sequence": True},
}


def test_model_parser1():
    state = InterpreterState()
    data = Program.model_validate(model_parser1)
    with pytest.raises(PDLRuntimeError):
        process_prog(state, empty_scope, data)


get_parser = {"get": "x", "parser": "json", "def": "y", "contribute": []}


def test_get_parser():
    state = InterpreterState()
    data = Program.model_validate(get_parser)
    scope = {"x": '{"a": "foo", "b": "bar"}'}
    result, _, scope, _ = process_prog(state, scope, data)
    assert result == ""
    assert scope["x"] == '{"a": "foo", "b": "bar"}'
    assert scope["y"] == {"a": "foo", "b": "bar"}


code_parser = {
    "lang": "python",
    "parser": "json",
    "code": {
        "text": [
            "import json\n",
            "r = {'a':'b', 'c':'d'}\n",
            "result=json.dumps(r)",
        ]
    },
}


def test_code_parser():
    state = InterpreterState()
    data = Program.model_validate(code_parser)
    result, _, _, _ = process_prog(state, empty_scope, data)
    assert result == {"a": "b", "c": "d"}


code_parser1 = {
    "lang": "python",
    "code": "r = {'a':'b', 'c':'d'}\nresult=str(r)",
}


def test_code_parser1():
    state = InterpreterState()
    data = Program.model_validate(code_parser1)
    result, _, _, _ = process_prog(state, empty_scope, data)
    assert result == "{'a': 'b', 'c': 'd'}"


def test_json_parser():
    jsonl_parser = """
    text: |
        { "a": 1, "b": 2}
        { "a": "hello" }
        { "b": "bye"}
    parser: jsonl
    """
    result = exec_str(jsonl_parser)
    assert result == [{"a": 1, "b": 2}, {"a": "hello"}, {"b": "bye"}]
