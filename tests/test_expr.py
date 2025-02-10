import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError

arith_data = {
    "description": "Test arith",
    "defs": {"X": "${ 1 + 1 }"},
    "text": "${ X }",
}


def test_arith():
    result = exec_dict(arith_data, output="all")
    assert result["result"] == "2"
    assert result["scope"]["X"] == 2


var_data = {
    "defs": {"X": {"data": 1}, "Y": {"data": 2}},
    "text": "${ X + Y }",
}


def test_var():
    result = exec_dict(var_data)
    assert result == "3"


true_data = {
    "text": "${ 1 < 2 }",
}


def test_true():
    result = exec_dict(true_data)
    assert result == "true"


false_data = {
    "text": "${ 1 >= 2 }",
}


def test_false():
    result = exec_dict(false_data)
    assert result == "false"


undefined_var_data = {"text": "Hello ${ X }"}


def test_undefined_var():
    with pytest.raises(PDLRuntimeError):
        exec_dict(undefined_var_data)


autoescape_data = {"text": "<|system|>"}


def test_autoescape():
    text = exec_dict(autoescape_data)
    assert text == "<|system|>"


var_data1 = {"defs": {"X": "something"}, "text": "${ X }"}


def test_var1():
    result = exec_dict(var_data1)
    assert result == "something"


var_data2 = {
    "defs": {"X": "something", "Y": "something else"},
    "text": "${ [X, Y] }",
}


def test_var2():
    result = exec_dict(var_data2, output="all")
    scope = result["scope"]
    assert result["result"] == '["something", "something else"]'
    assert scope["X"] == "something"
    assert scope["Y"] == "something else"


list_data = {"defs": {"X": {"data": [1, 2, 3]}, "Y": "${ X }"}, "text": "${ X }"}


def test_list():
    result = exec_dict(list_data, output="all")
    scope = result["scope"]
    assert result["result"] == "[1, 2, 3]"
    assert scope["X"] == [1, 2, 3]
    assert scope["Y"] == [1, 2, 3]


disable_jinja_block_data = {"text": '{% for x in ["hello", "bye"]%} X {% endfor %}'}


def test_disable_jinja_block():
    text = exec_dict(disable_jinja_block_data)
    assert text == '{% for x in ["hello", "bye"]%} X {% endfor %}'


jinja_block_data = {
    "text": '{%%%%%PDL%%%%%%%%%% for x in ["hello", "bye"]%%%%%PDL%%%%%%%%%%}'
    + " X "
    + "{%%%%%PDL%%%%%%%%%% endfor %%%%%PDL%%%%%%%%%%}"
}


def test_jinja_block():
    text = exec_dict(jinja_block_data)
    assert text == " X  X "


def test_expr_detection1():
    prog = """
lastOf:
- '${ 1 }'
spec: int
"""
    result = exec_str(prog)
    assert result == 1


def test_expr_detection2():
    prog = """
lastOf:
- '${ { "a": 1 }["a"] }'
spec: int
"""
    result = exec_str(prog)
    assert result == 1


def test_expr_detection3():
    prog = """
lastOf:
- '${ 1 } ${ 2 }'
spec: str
"""
    result = exec_str(prog)
    assert result == "1 2"


def test_expr_detection4():
    prog = """
lastOf:
- '${ 1 } { 2 }'
spec: str
"""
    result = exec_str(prog)
    assert result == "1 { 2 }"
