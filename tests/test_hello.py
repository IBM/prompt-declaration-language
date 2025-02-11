import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError

hello = {
    "description": "Hello world!",
    "text": ["Hello, world!\n", "This is your first prompt descriptor!\n"],
}


def repeat_data(n):
    return {
        "description": "Hello world with a nested block",
        "repeat": {
            "text": [
                "Hello, world!\n",
                "This is your first prompt descriptor!\n",
            ]
        },
        "num_iterations": n,
    }


def nested_repeat_data(n):
    return {
        "description": "Hello world with a nested block",
        "text": [
            "Hello, world!\n",
            "This is your first prompt descriptor!\n",
            {
                "repeat": "This sentence repeats!\n",
                "num_iterations": n,
            },
        ],
    }


def test_hello():
    text = exec_dict(hello)
    assert text == "Hello, world!\nThis is your first prompt descriptor!\n"


def repeat(n):
    text = exec_dict(repeat_data(n))
    assert_string = []
    for _ in range(0, n):
        assert_string.append("Hello, world!\n")
        assert_string.append("This is your first prompt descriptor!\n")
    assert text == "".join(assert_string)


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
    text = exec_dict(nested_repeat_data(n))
    assert_string = ["Hello, world!\n", "This is your first prompt descriptor!\n"]
    for _ in range(0, n):
        assert_string.append("This sentence repeats!\n")
    assert text == "".join(assert_string)


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
    "repeat": {
        "lastOf": [
            "Hello,",
            {"model": "watsonx/ibm/granite-20b-code-instruct-v", "def": "NAME"},
        ]
    },
    "num_iterations": 3,
    "join": {"as": "lastOf"},
}


def test_repeat_error():
    with pytest.raises(PDLRuntimeError):
        exec_dict(repeat_data_error)


def test_program_as_list():
    prog = """
    lastOf:
    - Hello
    - Bye
    """
    result = exec_str(prog)
    assert result == "Bye"


def test_bool():
    prog = """
    defs:
      tt: true
      ff: false
    if: ${tt}
    then: false
    else: true
    """
    result = exec_str(prog)
    assert isinstance(result, bool)
    assert not result


def test_null():
    prog = """
    text:
    """
    result = exec_str(prog)
    assert result == "null"


def test_none():
    prog = """
    lastOf:
    - null
    """
    result = exec_str(prog)
    assert result is None
