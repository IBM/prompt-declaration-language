from pdl.pdl import exec_str


def test_sequence_text1():
    prog_str = """
sequence:
- Hello
- Bye
join:
  as: text
"""
    result = exec_str(prog_str)
    assert result == "HelloBye"


def test_sequence_text2():
    prog_str = r"""
sequence:
- Hello
- Bye
join:
  as: text
  with: "\n"
"""
    result = exec_str(prog_str)
    assert result == "Hello\nBye"


def test_sequence_text3():
    prog_str = r"""
sequence:
- Hello
- Bye
join:
  as: text
  with: "\n"
"""
    result = exec_str(prog_str)
    assert result == "Hello\nBye"


def test_sequence_array1():
    prog_str = """
sequence:
- Hello
- Bye
join:
  as: array
"""
    result = exec_str(prog_str)
    assert result == ["Hello", "Bye"]


def test_sequence_join1():
    prog_str = """
sequence:
- Hello
- Bye
join:
  as: lastOf
"""
    result = exec_str(prog_str)
    assert result == "Bye"
