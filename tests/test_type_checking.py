import pytest
import yaml

from pdl.pdl import exec_dict
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
        "pdl_type": "bool",
        "json_schema": {"type": "boolean"},
    },
    {
        "pdl_type": "{str: {pattern: '^[A-Za-z][A-Za-z0-9_]*$'}}",
        "json_schema": {"type": "string", "pattern": "^[A-Za-z][A-Za-z0-9_]*$"},
    },
    {
        "pdl_type": "float",
        "json_schema": {"type": "number"},
    },
    {
        "pdl_type": "{float: {minimum: 0, exclusiveMaximum: 1}}",
        "json_schema": {"type": "number", "minimum": 0, "exclusiveMaximum": 1},
    },
    {
        "pdl_type": "int",
        "json_schema": {"type": "integer"},
    },
    {
        "pdl_type": "{list: int}",
        "json_schema": {"type": "array", "items": {"type": "integer"}},
    },
    {
        "pdl_type": "[int]",
        "json_schema": {"type": "array", "items": {"type": "integer"}},
    },
    {
        "pdl_type": "{list: {int: {minimum: 0}}}",
        "json_schema": {"type": "array", "items": {"type": "integer", "minimum": 0}},
    },
    {
        "pdl_type": "[{int: {minimum: 0}}]",
        "json_schema": {"type": "array", "items": {"type": "integer", "minimum": 0}},
    },
    {
        "pdl_type": "{list: {minItems: 1, int: {}}}",
        "json_schema": {"type": "array", "items": {"type": "integer"}, "minItems": 1},
    },
    {
        "pdl_type": "{obj: {latitude: float, longitude: float}}",
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
        "pdl_type": "{latitude: float, longitude: float}",
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
        "pdl_type": "{obj: {question: str, answer: str, context: {optional: str}}}",
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
        "pdl_type": "{question: str, answer: str, context: {optional: str}}",
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
        "pdl_type": "{list: {obj: {question: str, answer: str}}}",
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
        "pdl_type": "[{question: str, answer: str}]",
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
            "function": {"name": "str"},
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
            "function": {"name": "int"},
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
            "function": {"name": "list"},
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
            "function": {"name": "obj"},
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
            "function": {"name": "bool"},
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
            "function": {"name": "float"},
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
            "function": {"name": "float"},
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
            "function": {"name": "floats"},
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
            "function": {"name": "float", "address": "str"},
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
            "function": {"name": "float", "address": "str"},
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
            "function": {"name": "float", "address": "str"},
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
            "function": {"name": "float", "address": "str", "extra": "int"},
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
            "function": {"name": "float", "address": "str"},
            "spec": "str",
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
            "function": {"name": "float", "address": "str"},
            "spec": "int",
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
            "function": {"name": "float", "address": "str"},
            "spec": {"list": "int"},
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
            "function": {"name": "float", "address": "str"},
            "spec": {"list": "int"},
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
    "spec": "str",
    "text": ["Hello, world!"],
}


def test_hello():
    text = exec_dict(hello)
    assert text == "Hello, world!"


hello1 = {
    "description": "Hello world!",
    "spec": {"obj": {"a": "str", "b": "str"}},
    "data": {"a": "Hello", "b": "World"},
}


def test_hello1():
    result = exec_dict(hello1)
    assert result == {"a": "Hello", "b": "World"}


hello2 = {
    "description": "Hello world!",
    "spec": {"list": {"minItems": 0, "maxItems": 0, "str": {}}},
    "data": ["Hello", "World"],
}


def test_hello2():
    with pytest.raises(PDLRuntimeError):
        exec_dict(hello2)
