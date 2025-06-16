import pytest
import yaml

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_ast import pdl_type_adapter
from pdl.pdl_interpreter import PDLRuntimeError
from pdl.pdl_parser import PDLParseError
from pdl.pdl_schema_utils import pdltype_to_jsonschema

_PDLTYPE_TO_JSONSCHEMA_TESTS = [
    {
        "pdl_type": "null",
        "json_schema": {},
    },
    {
        "pdl_type": '"null"',
        "json_schema": {"type": "null"},
    },
    {
        "pdl_type": "boolean",
        "json_schema": {"type": "boolean"},
    },
    {
        "pdl_type": "{type: string, pattern: '^[A-Za-z][A-Za-z0-9_]*$'}",
        "json_schema": {"type": "string", "pattern": "^[A-Za-z][A-Za-z0-9_]*$"},
    },
    {
        "pdl_type": "number",
        "json_schema": {"type": "number"},
    },
    {
        "pdl_type": "{type: number, minimum: 0, exclusiveMaximum: 1}",
        "json_schema": {"type": "number", "minimum": 0, "exclusiveMaximum": 1},
    },
    {
        "pdl_type": "integer",
        "json_schema": {"type": "integer"},
    },
    {
        "pdl_type": "[integer]",
        "json_schema": {"type": "array", "items": {"type": "integer"}},
    },
    {
        "pdl_type": "{type: array, items: {type: integer}}",
        "json_schema": {"type": "array", "items": {"type": "integer"}},
    },
    {
        "pdl_type": "{type: array, items: {type: integer, minimum: 0}}",
        "json_schema": {"type": "array", "items": {"type": "integer", "minimum": 0}},
    },
    {
        "pdl_type": "[{type: integer, minimum: 0}]",
        "json_schema": {"type": "array", "items": {"type": "integer", "minimum": 0}},
    },
    {
        "pdl_type": "{type: array, minItems: 1, items: {type: integer}}",
        "json_schema": {"type": "array", "items": {"type": "integer"}, "minItems": 1},
    },
    {
        "pdl_type": "{object: {latitude: number, longitude: number}}",
        "json_schema": {
            "type": "object",
            "properties": {
                "latitude": {"type": "number"},
                "longitude": {"type": "number"},
            },
            "required": ["latitude", "longitude"],
            "additionalProperties": False,
        },
    },
    {
        "pdl_type": "{latitude: number, longitude: number}",
        "json_schema": {
            "type": "object",
            "properties": {
                "latitude": {"type": "number"},
                "longitude": {"type": "number"},
            },
            "required": ["latitude", "longitude"],
            "additionalProperties": False,
        },
    },
    {
        "pdl_type": "{object: {question: string, answer: string, context: {optional: string}}}",
        "json_schema": {
            "type": "object",
            "properties": {
                "question": {"type": "string"},
                "answer": {"type": "string"},
                "context": {"type": "string"},
            },
            "required": ["question", "answer"],
            "additionalProperties": False,
        },
    },
    {
        "pdl_type": "{question: string, answer: string, context: {optional: string}}",
        "json_schema": {
            "type": "object",
            "properties": {
                "question": {"type": "string"},
                "answer": {"type": "string"},
                "context": {"type": "string"},
            },
            "required": ["question", "answer"],
            "additionalProperties": False,
        },
    },
    {
        "pdl_type": "{type: array, items: {type: object, properties: {question: {type: string}, answer: {type: string}}, required: [question, answer], additionalProperties: false }}",
        "json_schema": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "answer": {"type": "string"},
                },
                "required": ["question", "answer"],
                "additionalProperties": False,
            },
        },
    },
    {
        "pdl_type": "[{question: string, answer: string}]",
        "json_schema": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "answer": {"type": "string"},
                },
                "required": ["question", "answer"],
                "additionalProperties": False,
            },
        },
    },
    {
        "pdl_type": "{enum: [red, green, blue]}",
        "json_schema": {"enum": ["red", "green", "blue"]},
    },
    {
        "pdl_type": "{ type: string }",
        "json_schema": {"type": "string"},
    },
    {
        "pdl_type": "{ type: [number, string] }",
        "json_schema": {"type": ["number", "string"]},
    },
    {
        "pdl_type": "{ type: array,  prefixItems: [ { type: number }, { type: string }, { enum: [Street, Avenue, Boulevard] }, { enum: [NW, NE, SW, SE] } ]}",
        "json_schema": {
            "type": "array",
            "prefixItems": [
                {"type": "number"},
                {"type": "string"},
                {"enum": ["Street", "Avenue", "Boulevard"]},
                {"enum": ["NW", "NE", "SW", "SE"]},
            ],
        },
    },
]


def test_pdltype_to_jsonschema():
    for t in _PDLTYPE_TO_JSONSCHEMA_TESTS:
        t_data = yaml.safe_load(t["pdl_type"])
        if t_data is None:
            pdl_type = None
        else:
            pdl_type = pdl_type_adapter.validate_python(t_data)
        json_schema = pdltype_to_jsonschema(pdl_type, False)
        assert json_schema == t["json_schema"]


function_call = {
    "description": "Call hello",
    "defs": {"name": "Bob"},
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": {
                "text": ["Hello ", {"get": "name"}, "!"],
            },
        },
        {"call": "${ hello }"},
    ],
}


def test_function_call():
    text = exec_dict(function_call)
    assert text == "Hello Bob!"


function_call1 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": "Bob"}},
    ],
}


def test_function_call1():
    text = exec_dict(function_call1)
    assert text == "Hello Bob!"


function_call2 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "integer"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": 42}},
    ],
}


def test_function_call2():
    text = exec_dict(function_call2)
    assert text == "Hello 42!"


function_call3 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "array"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": ["Bob", "Carrol"]}},
    ],
}


def test_function_call3():
    text = exec_dict(function_call3)
    assert text == 'Hello ["Bob", "Carrol"]!'


function_call4 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "object"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": {"bob": "caroll"}}},
    ],
}


def test_function_call4():
    text = exec_dict(function_call4)
    assert text == 'Hello {"bob": "caroll"}!'


function_call5 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "boolean"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": True}},
    ],
}


def test_function_call5():
    text = exec_dict(function_call5)
    assert text == "Hello true!"


function_call6 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6}},
    ],
}


def test_function_call6():
    text = exec_dict(function_call6)
    assert text == "Hello 6.6!"


function_call7 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": 7.6}},
    ],
}


def test_function_call7():
    text = exec_dict(function_call7)
    assert text == "Hello 7.6!"


function_call8 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "numbers"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6}},
    ],
}


def test_function_call8():
    with pytest.raises(PDLParseError):
        exec_dict(function_call8)


function_call9 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call9():
    text = exec_dict(function_call9)
    assert text == "Hello 6.6 street!"


function_call10 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {
            "call": "${ hello }",
            "args": {"name": 6.6, "address": "street", "extra": "stuff"},
        },
    ],
}


def test_function_call10():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call10)


function_call11 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {
            "call": "${ hello }",
            "args": {"name": 6.6, "address": "street", "extra": "stuff"},
        },
    ],
}


def test_function_call11():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call11)


function_call12 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {"call": "${ hello }", "args": {}},
    ],
}


def test_function_call12():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call12)


function_call13 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string", "extra": "integer"},
            "return": {"text": ["Hello ", "!"]},
        },
        {"call": "${ hello }", "args": {"name": "Bob", "extra": 2}},
    ],
}


def test_function_call13():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call13)


function_call14 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": {"text": ["Hello ", "${ something }", "!"]},
        },
        {"call": "${ hello }", "args": {}},
    ],
}


def test_function_call14():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call14)


function_call15 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "spec": "string",
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call15():
    text = exec_dict(function_call15)
    assert text == "Hello 6.6 street!"


function_call16 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "spec": "integer",
            "return": {"text": ["Hello ", {"get": "name"}, " ${ address}", "!"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call16():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call16)


function_call17 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "spec": ["integer"],
            "return": {"data": [1, 2, 3]},
        },
        {"call": "${ hello }", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call17():
    text = exec_dict(function_call17)
    assert text == "[1, 2, 3]"


function_call18 = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "number", "address": "string"},
            "spec": ["integer"],
            "return": {"data": [1, 2, "foo"]},
        },
        {"call": "${ hello }", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call18():
    with pytest.raises(PDLRuntimeError):
        exec_dict(function_call18)


hello = {
    "description": "Hello world!",
    "spec": "string",
    "text": ["Hello, world!"],
}


def test_hello():
    text = exec_dict(hello)
    assert text == "Hello, world!"


hello1 = {
    "description": "Hello world!",
    "spec": {"object": {"a": "string", "b": "string"}},
    "data": {"a": "Hello", "b": "World"},
}


def test_hello1():
    result = exec_dict(hello1)
    assert result == {"a": "Hello", "b": "World"}


hello2 = {
    "description": "Hello world!",
    "spec": {
        "type": "array",
        "minItems": 0,
        "maxItems": 0,
        "items": {"type": "string"},
    },
    "data": ["Hello", "World"],
}


def test_hello2():
    with pytest.raises(PDLRuntimeError):
        exec_dict(hello2)


def do_test_stderr(capsys, prog, err):
    exec_str(prog)
    captured = capsys.readouterr()
    output = captured.err.split("\n")
    print(output)
    assert set(output) == set(err)


def test_deprecated(capsys: pytest.CaptureFixture[str]):
    prog = """
        data: 1
        spec: int
    """
    do_test_stderr(
        capsys, prog, ["Deprecated type syntax: use integer instead of int.", ""]
    )
