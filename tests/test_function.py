from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

hello_def = {
    "def": "hello",
    "description": "Define hello",
    "params": None,
    "document": ["Hello world!"],
}

hello_call = {"description": "Call hello", "document": [hello_def, {"call": "hello"}]}


def test_function_def():
    log = []
    data = Program.model_validate(hello_def)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == ""


def test_function_call():
    log = []
    data = Program.model_validate(hello_call)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello world!"


hello_params = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "params": {"name": "str"},
            "document": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": "World"}},
    ],
}


def test_function_params():
    log = []
    data = Program.model_validate(hello_params)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!"


hello_stutter = {
    "description": "Repeat the context",
    "document": [
        {"def": "stutter", "params": None, "get": "context"},
        "Hello World!\n",
        {"call": "stutter"},
    ],
}


def test_function_implicit_context():
    log = []
    data = Program.model_validate(hello_stutter)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!\nHello World!\n"


hello_bye = {
    "description": "Repeat the context",
    "document": [
        {"def": "stutter", "params": {}, "get": "context"},
        "Hello World!\n",
        {"call": "stutter", "args": {"context": "Bye!"}},
    ],
}


def test_function_explicit_context():
    log = []
    data = Program.model_validate(hello_bye)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!\nBye!"
