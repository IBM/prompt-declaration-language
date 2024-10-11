from pdl.pdl import exec_str


def test_direct_object():
    prog_str = """
object:
  a: 1
  b: hello
  c:
    text:
      - bye
      - "!"
"""
    result = exec_str(prog_str)
    assert result == {"a": 1, "b": "hello", "c": "bye!"}


def test_composed_object():
    prog_str = """
object:
  - object:
      a: 1
      b: hello
  - data:
      c: "bye!"
"""
    result = exec_str(prog_str)
    assert result == {"a": 1, "b": "hello", "c": "bye!"}
