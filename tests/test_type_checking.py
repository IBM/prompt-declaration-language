import yaml

from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import (  # pyright: ignore
    InterpreterState,
    contains_error,
    process_prog,
)
from pdl.pdl.pdl_schema_utils import pdltype_to_jsonschema  # pyright: ignore

_PDLTYPE_TO_JSONSCHEMA_TESTS = [
    {
        "pdl_type": "null",
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
        pdl_type = yaml.safe_load(t["pdl_type"])
        json_schema = pdltype_to_jsonschema(pdl_type)
        assert json_schema == t["json_schema"]


function_call = {
    "description": "Call hello",
    "defs": {"name": "Bob"},
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": {
                "document": ["Hello ", {"get": "name"}, "!"],
            },
        },
        {"call": "hello"},
    ],
}


def test_function_call():
    state = InterpreterState()
    data = Program.model_validate(function_call)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello Bob!"


function_call1 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "str"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": "Bob"}},
    ],
}


def test_function_call1():
    state = InterpreterState()
    data = Program.model_validate(function_call1)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello Bob!"


function_call2 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "int"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": 42}},
    ],
}


def test_function_call2():
    state = InterpreterState()
    data = Program.model_validate(function_call2)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello 42!"


function_call3 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "list"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": ["Bob", "Carrol"]}},
    ],
}


def test_function_call3():
    state = InterpreterState()
    data = Program.model_validate(function_call3)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == 'Hello ["Bob", "Carrol"]!'


function_call4 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "obj"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": {"bob": "caroll"}}},
    ],
}


def test_function_call4():
    state = InterpreterState()
    data = Program.model_validate(function_call4)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == 'Hello {"bob": "caroll"}!'


function_call5 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "bool"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": True}},
    ],
}


def test_function_call5():
    state = InterpreterState()
    data = Program.model_validate(function_call5)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello true!"


function_call6 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call6():
    state = InterpreterState()
    data = Program.model_validate(function_call6)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello 6.6!"


function_call7 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call7():
    state = InterpreterState()
    data = Program.model_validate(function_call7)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello 6.6!"


function_call8 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "floats"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call8():
    state = InterpreterState()
    data = Program.model_validate(function_call8)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call9 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "return": {"document": ["Hello ", {"get": "name"}, " {{ address}}", "!"]},
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call9():
    state = InterpreterState()
    data = Program.model_validate(function_call9)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello 6.6 street!"


function_call10 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "return": ["Hello ", {"get": "name"}, " {{ address}}", "!"],
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street", "extra": "stuff"}},
    ],
}


def test_function_call10():
    state = InterpreterState()
    data = Program.model_validate(function_call10)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call11 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": ["Hello ", {"get": "name"}, " {{ address}}", "!"],
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street", "extra": "stuff"}},
    ],
}


def test_function_call11():
    state = InterpreterState()
    data = Program.model_validate(function_call11)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call12 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "return": ["Hello ", {"get": "name"}, " {{ address}}", "!"],
        },
        {"call": "hello", "args": {}},
    ],
}


def test_function_call12():
    state = InterpreterState()
    data = Program.model_validate(function_call12)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call13 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str", "extra": "int"},
            "return": ["Hello ", "!"],
        },
        {"call": "hello", "args": {"name": "Bob", "extra": 2}},
    ],
}


def test_function_call13():
    state = InterpreterState()
    data = Program.model_validate(function_call13)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call14 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": ["Hello ", "{{ something }}", "!"],
        },
        {"call": "hello", "args": {}},
    ],
}


def test_function_call14():
    state = InterpreterState()
    data = Program.model_validate(function_call14)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call15 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "spec": "str",
            "return": {"document": ["Hello ", {"get": "name"}, " {{ address}}", "!"]},
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call15():
    state = InterpreterState()
    data = Program.model_validate(function_call15)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello 6.6 street!"


function_call16 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "spec": "int",
            "return": ["Hello ", {"get": "name"}, " {{ address}}", "!"],
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call16():
    state = InterpreterState()
    data = Program.model_validate(function_call16)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


function_call17 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "spec": {"list": "int"},
            "return": {"data": [1, 2, 3]},
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call17():
    state = InterpreterState()
    data = Program.model_validate(function_call17)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "[1, 2, 3]"


function_call18 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "spec": {"list": "int"},
            "return": {"data": [1, 2, "foo"]},
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call18():
    state = InterpreterState()
    data = Program.model_validate(function_call18)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


hello = {
    "description": "Hello world!",
    "spec": "str",
    "document": ["Hello, world!"],
}


def test_hello():
    state = InterpreterState()
    data = Program.model_validate(hello)
    document, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert document == "Hello, world!"


hello1 = {
    "description": "Hello world!",
    "spec": {"obj": {"a": "str", "b": "str"}},
    "data": {"a": "Hello", "b": "World"},
}


def test_hello1():
    state = InterpreterState()
    data = Program.model_validate(hello1)
    result, _, _, trace = process_prog(state, empty_scope, data)
    assert not contains_error(trace)
    assert result == {"a": "Hello", "b": "World"}


hello2 = {
    "description": "Hello world!",
    "spec": {"list": {"minItems": 0, "maxItems": 0, "str": {}}},
    "data": ["Hello", "World"],
}


def test_hello2():
    state = InterpreterState()
    data = Program.model_validate(hello2)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)
