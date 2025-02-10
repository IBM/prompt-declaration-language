import pytest

from pdl.pdl import exec_str
from pdl.pdl_interpreter import PDLRuntimeError


def test_jinja_undefined():
    prog_str = """
${ x }
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Error during the evaluation of ${ x }: 'x' is undefined"
    )


def test_jinja_access():
    prog_str = """
${ {}['x'] }
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Error during the evaluation of ${ {}['x'] }: 'dict object' has no attribute 'x'"
    )


def test_jinja_syntax():
    prog_str = """
${ {}[ }
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Syntax error in ${ {}[ }: unexpected '}', expected ']'"
    )


def test_parser_jsonl():
    prog_str = """
text: "{ x: 1 + 1 }"
parser: jsonl
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Attempted to parse ill-formed JSON: JSONDecodeError('Expecting property name enclosed in double quotes: line 1 column 3 (char 2)')"
    )


def test_parser_regex():
    prog_str = """
text: "Hello"
parser:
  regex: "("
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Fail to parse with regex (: error('missing ), unterminated subpattern at position 0')"
    ) or (
        str(exc.value.message)
        == "Fail to parse with regex (: PatternError('missing ), unterminated subpattern at position 0')"
    )


def test_type_result():
    prog_str = """
text: "Hello"
spec: int
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Type errors during spec checking:\nline 0 - Hello should be of type <class 'int'>"
    )


def test_get():
    prog_str = """
text:
- "Hello"
- get: x
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Error during the evaluation of ${ x }: 'x' is undefined"
    )


def test_call_undefined():
    prog_str = """
call: "${ f }"
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Error during the evaluation of ${ f }: 'f' is undefined"
    )


def test_call_bad_name():
    prog_str = """
call: ${ ( f }
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Syntax error in ${ ( f }: unexpected '}', expected ')'"
    )


def test_call_bad_args():
    prog_str = """
defs:
    f:
      function:
        x: int
      return: Hello
call: ${ f }
args:
    x: ${ (x }
"""
    with pytest.raises(PDLRuntimeError) as exc:
        exec_str(prog_str)
    assert (
        str(exc.value.message)
        == "Syntax error in ${ (x }: unexpected '}', expected ')'"
    )
