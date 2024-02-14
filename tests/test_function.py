from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

hello_def = {
    "description": "Define hello",
    "function": "hello",
    "prompts": ["Hello world!"],
}

hello_call = {"description": "Call hello", "prompts": [hello_def, {"call": "hello"}]}


def test_function_def():
    log = []
    data = Program.model_validate(hello_def)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == ""


def test_function_call():
    log = []
    data = Program.model_validate(hello_call)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello world!"


hello_params = {
    "description": "Call hello",
    "prompts": [
        {
            "description": "Define hello",
            "function": "hello",
            "params": {"name": "str"},
            "prompts": ["Hello ", {"get": "name"}, "!"],
        },
        {"call": "hello", "args": {"name": "World"}},
    ],
}


def test_function_params():
    log = []
    data = Program.model_validate(hello_params)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!"


hello_stutter = {
    "description": "Repeat the context",
    "prompts": [
        {"function": "stutter", "get": "context"},
        "Hello World!\n",
        {"call": "stutter"},
    ],
}


def test_function_implicit_context():
    log = []
    data = Program.model_validate(hello_stutter)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!\nHello World!\n"


hello_bye = {
    "description": "Repeat the context",
    "prompts": [
        {"function": "stutter", "get": "context"},
        "Hello World!\n",
        {"call": "stutter", "args": {"context": "Bye!"}},
    ],
}


def test_function_explicit_context():
    log = []
    data = Program.model_validate(hello_bye)
    document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello World!\nBye!"
