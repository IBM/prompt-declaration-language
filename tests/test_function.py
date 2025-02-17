from pdl.pdl import exec_dict, exec_file

hello_def = {
    "def": "hello",
    "description": "Define hello",
    "function": None,
    "return": "Hello world!",
}

hello_call = {"description": "Call hello", "text": [hello_def, {"call": "${ hello }"}]}


def test_function_def():
    text = exec_dict({"text": [hello_def]})
    assert text == ""


def test_function_call():
    text = exec_dict(hello_call)
    assert text == "Hello world!"


hello_params = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "str"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": "World"}},
    ],
}


def test_function_params():
    text = exec_dict(hello_params)
    assert text == "Hello World!"


hello_stutter = {
    "description": "Repeat the context",
    "text": [
        {"def": "stutter", "function": None, "return": "${ pdl_context[0].content }"},
        "Hello World!\n",
        {"call": "${ stutter }"},
    ],
}


def test_function_implicit_context():
    text = exec_dict(hello_stutter)
    assert text == "Hello World!\nHello World!\n"


hello_bye = {
    "description": "Repeat the context",
    "text": [
        {"def": "stutter", "function": {}, "return": "${ pdl_context[0].content }"},
        "Hello World!\n",
        {
            "call": "${ stutter }",
            "args": {"pdl_context": [{"role": None, "content": "Bye!"}]},
        },
    ],
}


def test_function_explicit_context():
    text = exec_dict(hello_bye)
    assert text == "Hello World!\nBye!"


hello_call_template = {
    "description": "Call hello template",
    "text": [
        {"defs": {"alias": {"data": {}}}},
        {
            "description": "Define hello",
            "def": "f",
            "function": {"name": "str"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"lang": "python", "code": "result = alias['hello'] = f"},
        {"call": '${ alias["hello"] }', "args": {"name": "World"}},
    ],
}


def test_call_template():
    text = exec_dict(hello_call_template)
    assert text == "Hello World!"


def test_call_expression_args():
    result = exec_file("tests/data/call_expression_args.pdl")
    assert (
        result
        == "FN::get_current_stock:: 'Simple call!'\n{'product_name': 'from_object'}\nFN::get_current_stock:: 'from_object'\n"
    )
