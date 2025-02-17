import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError

direct_fallback_data = {"model": "raise an error", "fallback": "The error was caught"}


def test_direct_fallback():
    text = exec_dict(direct_fallback_data)
    assert text == "The error was caught"


indirect_fallback_data = {
    "text": [{"model": "raise an error"}],
    "fallback": "The error was caught",
}


def test_indirect_fallback():
    text = exec_dict(indirect_fallback_data)
    assert text == "The error was caught"


error_in_sequence_data = {
    "text": ["Hello ", {"model": "raise an error"}, "Bye!"],
    "fallback": "The error was caught",
}


def test_error_in_sequence():
    text = exec_dict(error_in_sequence_data)
    assert text == "The error was caught"


def test_python_exception():
    prog_str = """
code: "raise Exception()"
lang: python
fallback: "Exception caught"
"""
    result = exec_str(prog_str)
    assert result == "Exception caught"


def test_parse_regex_error():
    prog_str = """
text: "Hello"
parser:
    regex: "(e"
fallback: "Exception caught"
"""
    result = exec_str(prog_str)
    assert result == "Exception caught"


def test_type_checking():
    prog_str = """
text: "Hello"
spec: int
fallback: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_type_checking_in_fallback():
    prog_str = """
model: "raise an error"
spec: int
fallback: "Error"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        _ = exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Type errors during spec checking:\nline 4 - Error should be of type <class 'int'>"
    )
