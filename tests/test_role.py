import yaml

from pdl.pdl import exec_str


def parse_prog_str(prog_str):
    prog_yaml = yaml.safe_load(prog_str)
    prog = Program.model_validate(prog_yaml)
    return prog


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
        {"role": "A", "content": "A"},
        {"role": "Top", "content": "Hi"},
        {"role": "B", "content": "B"},
    ]
    assert scope["ctx1"] == []
    assert scope["ctx2"] == [
        {"role": "A", "content": "A"},
        {"role": "Top", "content": "Hi"},
    ]
