import pytest

from pdl.pdl import exec_str
from pdl.pdl_interpreter import PDLRuntimeError


def test_jinja_undefined():
    prog_str = """
"{{ x }}"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_jinja_access():
    prog_str = """
"{{ {}['x'] }}"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_jinja_syntax():
    prog_str = """
"{{ {}[ }}"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_parser_json():
    prog_str = """
document: "{ x: 1 + 1 }"
parser: json
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_parser_regex():
    prog_str = """
document: "Hello"
parser:
  regex: "("
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_type_result():
    prog_str = """
document: "Hello"
spec: int
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_get():
    prog_str = """
document:
- "Hello"
- get: x
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_call_undefined():
    prog_str = """
call: "f"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_call_bad_name():
    prog_str = """
call: "{{ ( f }}"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"


def test_call_bad_args():
    prog_str = """
defs:
    f:
      function:
        x: int
      return: Hello
call: "f"
args:
    x: "{{ (x }}"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert str(exc.message) == "XXX"
