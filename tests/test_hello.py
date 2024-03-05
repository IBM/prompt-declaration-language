# from pdl.pdl.pdl_ast import ErrorBlock  # pyright: ignore
from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import contains_error, process_block  # pyright: ignore

hello = {
    "description": "Hello world!",
    "document": ["Hello, world!\n", "This is your first prompt descriptor!\n"],
}


def repeat_data(n):
    return {
        "description": "Hello world with a nested block",
        "document": [
            "Hello, world!\n",
            "This is your first prompt descriptor!\n",
        ],
        "repeats": n,
    }


def nested_repeat_data(n):
    return {
        "description": "Hello world with a nested block",
        "document": [
            "Hello, world!\n",
            "This is your first prompt descriptor!\n",
            {"document": ["This sentence repeats!\n"], "repeats": n},
        ],
    }


def test_hello():
    log = []
    data = Program.model_validate(hello)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "Hello, world!\nThis is your first prompt descriptor!\n"


def repeat(n):
    log = []
    data = Program.model_validate(repeat_data(n))
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert_string = []
    for _ in range(0, n):
        assert_string.append("Hello, world!\n")
        assert_string.append("This is your first prompt descriptor!\n")
    assert document == "".join(assert_string)


def test_repeat_neg():
    repeat(-1)


def test_repeat0():
    repeat(0)


def test_repeat1():
    repeat(1)


def test_repeat2():
    repeat(2)


def test_repeat3():
    repeat(3)


def repeat_nested(n):
    log = []
    data = Program.model_validate(nested_repeat_data(n))
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert_string = ["Hello, world!\n", "This is your first prompt descriptor!\n"]
    for _ in range(0, n):
        assert_string.append("This sentence repeats!\n")
    assert document == "".join(assert_string)


def test_repeat_nested0():
    repeat_nested(0)


def test_repeat_nested1():
    repeat_nested(1)


def test_repeat_nested2():
    repeat_nested(2)


def test_repeat_nested3():
    repeat_nested(3)


repeat_data_error = {
    "description": "Hello world with variable use",
    "document": [
        "Hello,",
        {"model": "ibm/granite-20b-code-instruct-v", "def": "NAME"},
    ],
    "repeats": 3,
}


def test_repeat_error():
    log = []
    data = Program.model_validate(repeat_data_error)
    _, _, _, trace = process_block(log, empty_scope, data.root)
    errors = 0
    print(trace)
    for document in trace.trace:
        if contains_error(document):
            errors += 1

    assert errors == 1
