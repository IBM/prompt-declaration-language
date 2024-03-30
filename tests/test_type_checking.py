from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import contains_error, process_block  # pyright: ignore

function_call = {
    "description": "Call hello",
    "defs": {"name": "Bob"},
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello"},
    ],
}


def test_function_call():
    log = []
    data = Program.model_validate(function_call)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello Bob!"


function_call1 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "str"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": "Bob"}},
    ],
}


def test_function_call1():
    log = []
    data = Program.model_validate(function_call1)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello Bob!"


function_call2 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "int"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": 42}},
    ],
}


def test_function_call2():
    log = []
    data = Program.model_validate(function_call2)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello 42!"


function_call3 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "list"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": ["Bob", "Carrol"]}},
    ],
}


def test_function_call3():
    log = []
    data = Program.model_validate(function_call3)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == 'Hello ["Bob", "Carrol"]!'


function_call4 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "dict"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": {"bob": "caroll"}}},
    ],
}


def test_function_call4():
    log = []
    data = Program.model_validate(function_call4)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == 'Hello {"bob": "caroll"}!'


function_call5 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "bool"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": True}},
    ],
}


def test_function_call5():
    log = []
    data = Program.model_validate(function_call5)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello true!"


function_call6 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call6():
    log = []
    data = Program.model_validate(function_call6)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello 6.6!"


function_call7 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call7():
    log = []
    data = Program.model_validate(function_call7)
    _, document, _, trace = process_block(log, empty_scope, data.root)
    assert not contains_error(trace)
    assert document == "Hello 6.6!"


function_call8 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "floats"},
            "return": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": 6.6}},
    ],
}


def test_function_call8():
    log = []
    data = Program.model_validate(function_call8)
    _, _, _, trace = process_block(log, empty_scope, data.root)
    assert contains_error(trace)


function_call9 = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "float", "address": "str"},
            "return": ["Hello ", {"get": "name"}, " {{ address}}", "!"],
        },
        {"call": "hello", "args": {"name": 6.6, "address": "street"}},
    ],
}


def test_function_call9():
    log = []
    data = Program.model_validate(function_call9)
    _, document, _, trace = process_block(log, empty_scope, data.root)
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
    log = []
    data = Program.model_validate(function_call10)
    _, _, _, trace = process_block(log, empty_scope, data.root)
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
    log = []
    data = Program.model_validate(function_call11)
    _, _, _, trace = process_block(log, empty_scope, data.root)
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
    log = []
    data = Program.model_validate(function_call12)
    _, _, _, trace = process_block(log, empty_scope, data.root)
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
    log = []
    data = Program.model_validate(function_call13)
    _, _, _, trace = process_block(log, empty_scope, data.root)
    assert contains_error(trace)
