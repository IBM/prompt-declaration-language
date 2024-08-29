from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

hello_def = {
    "def": "hello",
    "description": "Define hello",
    "function": None,
    "return": "Hello world!",
}

hello_call = {"description": "Call hello", "document": [hello_def, {"call": "hello"}]}


def test_function_def():
    state = InterpreterState()
    data = Program.model_validate({"document": [hello_def]})
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == ""


def test_function_call():
    state = InterpreterState()
    data = Program.model_validate(hello_call)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello world!"


hello_params = {
    "description": "Call hello",
    "document": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "str"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "hello", "args": {"name": "World"}},
    ],
}


def test_function_params():
    state = InterpreterState()
    data = Program.model_validate(hello_params)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!"


hello_stutter = {
    "description": "Repeat the context",
    "document": [
        {"def": "stutter", "function": None, "return": "{{ context[0].content }}"},
        "Hello World!\n",
        {"call": "stutter"},
    ],
}


def test_function_implicit_context():
    state = InterpreterState()
    data = Program.model_validate(hello_stutter)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!\nHello World!\n"


hello_bye = {
    "description": "Repeat the context",
    "document": [
        {"def": "stutter", "function": {}, "return": "{{ context[0].content }}"},
        "Hello World!\n",
        {"call": "stutter", "args": {"context": [{"role": None, "content": "Bye!"}]}},
    ],
}


def test_function_explicit_context():
    state = InterpreterState()
    data = Program.model_validate(hello_bye)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!\nBye!"


hello_call_template = {
    "description": "Call hello template",
    "document": [
        {"defs": {"alias": "hello"}},
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "str"},
            "return": {"document": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "{{ alias }}", "args": {"name": "World"}},
    ],
}


def test_call_template():
    state = InterpreterState()
    data = Program.model_validate(hello_call_template)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!"
