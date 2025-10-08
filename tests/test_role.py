from pdl.pdl import exec_str
from pdl.pdl_context import SerializeMode


def test_role0():
    prog_str = """
Hello
"""
    result = exec_str(prog_str, output="all")
    assert result["result"] == "Hello"
    scope = result["scope"]
    assert scope["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "Hello", "pdl__defsite": "data"},
    ]


def test_role1():
    prog_str = """
text:
- Hello
"""
    result = exec_str(prog_str, output="all")
    assert result["result"] == "Hello"
    scope = result["scope"]
    assert scope["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {"role": "user", "content": "Hello", "pdl__defsite": "text.0.data"},
    ]


def test_role2():
    prog_str = """
text:
- Hello
role: A
"""
    result = exec_str(prog_str, output="all")
    assert result["result"] == "Hello"
    scope = result["scope"]
    assert scope["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {"role": "A", "content": "Hello", "pdl__defsite": "text.0.data"},
    ]


def test_role3():
    prog_str = """
description: Test role
text:
- defs:
    ctx1: ${pdl_context}
  text: A
  role: A
- Hi
- defs:
    ctx2: ${pdl_context}
  text: B
  role: B
role: Top
"""
    result = exec_str(prog_str, output="all")
    scope = result["scope"]
    assert result["result"] == "AHiB"
    assert scope["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {"role": "A", "content": "A", "pdl__defsite": "text.0.text.data"},
        {"role": "Top", "content": "Hi", "pdl__defsite": "text.1.data"},
        {"role": "B", "content": "B", "pdl__defsite": "text.2.text.data"},
    ]
    assert scope["ctx1"].serialize(SerializeMode.LITELLM) == []
    assert scope["ctx2"].serialize(SerializeMode.LITELLM) == [
        {"role": "A", "content": "A", "pdl__defsite": "text.0.text.data"},
        {"role": "Top", "content": "Hi", "pdl__defsite": "text.1.data"},
    ]
