import json

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
        "max_iterations": n,
    }


def nested_repeat_data(n):
    return {
        "description": "Hello world with a nested block",
        "text": [
            "Hello, world!\n",
            "This is your first prompt descriptor!\n",
            {
                "repeat": "This sentence repeats!\n",
                "max_iterations": n,
            },
        ],
    }


def test_hello():
    text = exec_dict(hello)
    assert text == "Hello, world!\nThis is your first prompt descriptor!\n"


def test_hello_json():
    result = exec_str(json.dumps(hello))
    assert result == "Hello, world!\nThis is your first prompt descriptor!\n"


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
    "max_iterations": 3,
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


def _while_prog(n):
    return f"""
    defs:
      i: 0
    while: {'${ i < '}{n}{'}'}
    repeat:
      defs:
        i: {'${i + 1}'}
      text: {'${i}'}
    """


def test_while1():
    prog = _while_prog(-1)
    result = exec_str(prog)
    assert result == ""


def test_while2():
    prog = _while_prog(3)
    result = exec_str(prog)
    assert result == "123"


def _for_max_iterations_prog(n):
    return f"""
    for:
      i: [0, 1, 2, 3, 4, 5]
    repeat: {'${i}'}
    max_iterations: {'${'}{n}{'}'}
    """


def test_for_max_iterations1():
    prog = _for_max_iterations_prog(10)
    result = exec_str(prog)
    assert result == "012345"


def test_for_max_iterations2():
    prog = _for_max_iterations_prog(3)
    result = exec_str(prog)
    assert result == "012"


def _for_until_prog(n):
    return f"""
    for:
      i: [0, 1, 2, 3, 4, 5]
    repeat: {'${i}'}
    until: {'${ i == '}{n}{'}'}
    """


def test_for_until1():
    prog = _for_until_prog(10)
    result = exec_str(prog)
    assert result == "012345"


def test_for_until2():
    prog = _for_until_prog(4)
    result = exec_str(prog)
    assert result == "01234"


def _for_until_max_iterations_prog(n, m):
    return f"""
    for:
      i: [0, 1, 2, 3, 4, 5]
    repeat: {'${i}'}
    until: {'${ i == '}{n}{'}'}
    max_iterations: {'${'}{m}{'}'}
    """


def test_for_until_max_iterations1():
    prog = _for_until_max_iterations_prog(10, 10)
    result = exec_str(prog)
    assert result == "012345"


def test_for_until_max_iterations2():
    prog = _for_until_max_iterations_prog(2, 3)
    result = exec_str(prog)
    assert result == "012"


def test_for_until_max_iterations3():
    prog = _for_until_max_iterations_prog(4, 2)
    result = exec_str(prog)
    assert result == "01"
