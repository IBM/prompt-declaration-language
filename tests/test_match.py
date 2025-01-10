from pdl.pdl import exec_str


def test_match0():
    prog_str = """
match: 0
with:
- case: 0
  return: 42
- case: 1
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 42


def test_match1():
    prog_str = """
match: 1
with:
- case: 0
  return: 42
- case: 1
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_fail():
    prog_str = """
match: 2
with:
- case: 0
  return: 42
- case: 1
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == ""


def test_match_if0():
    prog_str = """
defs:
    x: 0
match:
with:
- if: ${x == 0}
  return: 42
- if: ${x == 1}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 42


def test_match_if1():
    prog_str = """
defs:
    x: 1
match:
with:
- if: ${x == 0}
  return: 42
- if: ${x == 1}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_if_fail():
    prog_str = """
defs:
    x: 2
match:
with:
- if: ${x == 0}
  return: 42
- if: ${x == 1}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == ""


def test_match_case_if1():
    prog_str = """
defs:
    x: 1
match: ${x}
with:
- case: 1
  if: ${x == 0}
  return: 42
- case: 1
  if: ${x == 1}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_expr0():
    prog_str = """
defs:
    x: 1
match: ${x}
with:
- case: 0
  return: 42
- case: 1
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_expr_in_case1():
    prog_str = """
defs:
    x: 1
match: ${x}
with:
- case: 0
  return: 42
- case: ${x}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == ""


def test_match_expr_in_case2():
    prog_str = """
defs:
    x:
        data: "${x}"
        raw: true
match: ${x}
with:
- case: 0
  return: 42
- case: ${x}
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_null0():
    prog_str = """
match: null
with:
- case: 0
  return: 42
- case: null
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_null1():
    prog_str = """
match: null
with:
- if: false
  return: 42
- case: null
  return: 4012
"""
    result = exec_str(prog_str)
    assert result == 4012


def test_match_array0():
    prog_str = """
defs:
    x:
      data: [1, 2, 3]
match: ${x}
with:
- case:
    array: []
  return: 1
- case:
    array: [1,2]
  return: 2
- case:
    array: [1,3]
  return: 3
- case:
    array: [1,2,3,4]
  return: 4
- case:
    array: [1,3,2]
  return: 5
- case:
    array: [1,2,3]
  return: 6
- case:
    array: [3]
  return: 7
"""
    result = exec_str(prog_str)
    assert result == 6


def test_match_object0():
    prog_str = """
defs:
    x:
      data:
        a: 1
        b: hello
match: ${x}
with:
- case:
    object: {"a": 2, "b": "hello"}
  return: 3
- case:
    object: {"a": 1, "b": "hi"}
  return: 4
- case:
    object: {"a": 1, "b": "hello"}
  return: 5
"""
    result = exec_str(prog_str)
    assert result == 5


def test_match_object1():
    prog_str = """
defs:
    x:
      data:
        a: 1
        b: hello
match: ${x}
with:
- case:
    object: {"a": 2}
  return: 1
- case:
    object: {"b": "hello"}
  return: 2
- case:
    object: {"a": 1, "b": "hello"}
  return: 5
"""
    result = exec_str(prog_str)
    assert result == 2


def test_match_object2():
    prog_str = """
defs:
    x:
      data:
        a: 1
        b: hello
match: ${x}
with:
- case:
    object: {"a": 2}
  return: 1
- case:
    object: {"b": "hi"}
  return: 2
- case:
    object: {"a": 1, "b": "hello", "c": "bye"}
  return: 3
- case:
    object: {"a": 1, "b": "hello"}
  return: 4
"""
    result = exec_str(prog_str)
    assert result == 4


def test_any0():
    prog_str = """
match: Hello
with:
- case: Hi
  return: 1
- case:
    any:
  return: 2
- case: Hello
  return: 3
"""
    result = exec_str(prog_str)
    assert result == 2


def test_union0():
    prog_str = """
match: Hello
with:
- case:
    union:
      - bye
      - see you
  return: 1
- case:
    union:
      - Hi
      - Hello
  return: 2
- case: Hello
  return: 3
"""
    result = exec_str(prog_str)
    assert result == 2


def test_match_union1():
    prog_str = """
defs:
    x:
      data:
        a: 1
        b: hello
match: ${x}
with:
- case:
    union:
    - 1
    - object: {"a": 2, "b": "hello"}
  return: 1
- case:
    union:
    - object: {"a": 1, "b": "hi"}
    - object: {"a": 1, "b": "hello"}
    - 42
  return: 2
"""
    result = exec_str(prog_str)
    assert result == 2


def test_match_catch_all():
    prog_str = """
defs:
    x:
      data:
        a: 1
        b: hello
match: ${x}
with:
- case:
    union:
    - 1
    - object: {"a": 2, "b": "hello"}
  return: 1
- case:
    union:
    - object: {"a": 1, "b": "hi"}
    - object: {"a": 2, "b": "hello"}
    - 42
  return: 2
- return: 3
"""
    result = exec_str(prog_str)
    assert result == 3
