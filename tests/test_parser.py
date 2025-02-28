import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError
from pdl.pdl_lazy import PdlDict

model_parser = {
    "model": "watsonx_text/ibm/granite-20b-code-instruct",
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
    result = exec_dict(model_parser)
    assert result == {"bob": 20, "carol": 30}


model_parser1 = {
    "model": "watsonx_text/ibm/granite-34b-code-instruct",
    "spec": {"bob": "int", "carol": "int"},
    "input": {
        "text": [
            "Write a JSON object with 2 fields 'bob' and 'carol' set to '20' and '30' respectively. Write 30 in letters",
        ]
    },
    "parser": "json",
    "parameters": {
        "stop_sequences": ["}"],
        "include_stop_sequence": True,
        "mock_response": '{"bob": 20, "carol": "thirty"}',
    },
}


def test_model_parser1():
    with pytest.raises(PDLRuntimeError):
        exec_dict(model_parser1)


get_parser = {"get": "x", "parser": "json", "def": "y", "contribute": []}


def test_get_parser():
    scope = PdlDict({"x": '{"a": "foo", "b": "bar"}'})
    result = exec_dict(get_parser, scope=scope, output="all")
    scope = result["scope"]
    assert result["result"] == ""
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
    result = exec_dict(code_parser)
    assert result == {"a": "b", "c": "d"}


code_parser1 = {
    "lang": "python",
    "code": "r = {'a':'b', 'c':'d'}\nresult=str(r)",
}


def test_code_parser1():
    result = exec_dict(code_parser1)
    assert result == "{'a': 'b', 'c': 'd'}"


def test_json_parser():
    # Test json-repair,
    # see https://github.com/mangiucugna/json_repair/blob/main/tests/test_json_repair.py
    json_parser = """
    text: |
        The next 64 elements are:
        ```json
        { "key": "value" }
        ```
    parser: json
    """
    result = exec_str(json_parser)
    assert result == {"key": "value"}

    json_parser = """
    text: |
        {'key': 'string', 'key2': false, \"key3\": null, \"key4\": unquoted}
    parser: json
    """
    result = exec_str(json_parser)
    assert result == {"key": "string", "key2": False, "key3": None, "key4": "unquoted"}


def test_jsonl_parser():
    jsonl_parser = """
    text: |
        { "a": 1, "b": 2}
        { "a": "hello" }
        { "b": "bye"}
    parser: jsonl
    """
    result = exec_str(jsonl_parser)
    assert result == [{"a": 1, "b": 2}, {"a": "hello"}, {"b": "bye"}]


def test_regex_findall():
    prog = """
    text: |
        (1,2,3,4)
    parser:
        regex: '[0-9]+'
        mode: findall
    """
    result = exec_str(prog)
    assert result == ["1", "2", "3", "4"]


def test_regex_split():
    prog = """
    text: (1,2,3,4)
    parser:
        regex: '[0-9]+'
        mode: split
    """
    result = exec_str(prog)
    assert result == ["(", ",", ",", ",", ")"]


def test_parser_case1():
    jsonl_parser = """
    text: |
        { "a": 1, "b": 2}
    parser: JSON
    """
    result = exec_str(jsonl_parser)
    assert result == {"a": 1, "b": 2}


def test_parser_case2():
    prog = """
    text: |
        (1,2,3,4)
    parser:
        regex: '[0-9]+'
        mode: findAll
    """
    result = exec_str(prog)
    assert result == ["1", "2", "3", "4"]
