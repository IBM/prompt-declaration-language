from pdl.pdl import exec_str


def test_role1():
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
    assert scope["pdl_context"] == [
        {"role": "A", "content": "A", "defsite": "text.0.text"},
        {"role": "Top", "content": "Hi", "defsite": "text.1"},
        {"role": "B", "content": "B", "defsite": "text.2.text"},
    ]
    assert scope["ctx1"] == []
    assert scope["ctx2"] == [
        {"role": "A", "content": "A", "defsite": "text.0.text"},
        {"role": "Top", "content": "Hi", "defsite": "text.1"},
    ]
