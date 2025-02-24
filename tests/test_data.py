from pdl.pdl import exec_str


def test_int():
    prog_str = """
data: 1
"""
    result = exec_str(prog_str)
    assert result == 1


def test_array():
    prog_str = """
data:
  - 1
  - 2
  - 3
  - bye
"""
    result = exec_str(prog_str)
    assert result == [1, 2, 3, "bye"]


def test_object():
    prog_str = """
data:
  text: Hello
  model:
    - a
    - b
"""
    result = exec_str(prog_str)
    assert result == {"text": "Hello", "model": ["a", "b"]}


def test_expr():
    prog_str = """
defs:
  x: a
  y: b
data:
  text: Hello
  model:
    - "${ x }"
    - "${ y }"
"""
    result = exec_str(prog_str)
    assert result == {"text": "Hello", "model": ["a", "b"]}


def test_raw():
    prog_str = """
defs:
  x: a
  y: b
data:
  text: Hello
  model:
    - "${ x }"
    - "${ y }"
raw: true
"""
    result = exec_str(prog_str)
    assert result == {"text": "Hello", "model": ["${ x }", "${ y }"]}


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
