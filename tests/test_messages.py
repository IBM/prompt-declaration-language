from pdl.pdl import exec_str
from pdl.pdl_context import SerializeMode


def test_message1():
    prog_str = """
description: Messages block
array:
  - role: system
    content: You are a helpful software engineer. You write clear, concise, well-commented code.
  - role: user
    content: Write a Python function that implement merge sort.
"""
    result = exec_str(prog_str, output="all")
    context = result["scope"]["pdl_context"]
    assert result["result"][0].serialize(SerializeMode.LITELLM) == [
        {
            "role": "system",
            "content": "You are a helpful software engineer. You write clear, concise, well-commented code.",
            "pdl__defsite": "array.0.message",
        }
    ]
    assert result["result"][1].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": "Write a Python function that implement merge sort.",
            "pdl__defsite": "array.1.message",
        }
    ]

    assert context.serialize(SerializeMode.LITELLM) == [
        {
            "role": "system",
            "content": "You are a helpful software engineer. You write clear, concise, well-commented code.",
            "pdl__defsite": "array.0.message",
        },
        {
            "role": "user",
            "content": "Write a Python function that implement merge sort.",
            "pdl__defsite": "array.1.message",
        },
    ]


def test_message2():
    prog_str = """
description: Messages block
role: user
content:
    array:
    - Hello
    - Bye
"""
    result = exec_str(prog_str, output="all")
    context = result["scope"]["pdl_context"]
    assert result["result"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": ["Hello", "Bye"],
            "pdl__defsite": "message",
        }
    ]
    assert context.serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": ["Hello", "Bye"],
            "pdl__defsite": "message",
        },
    ]


def test_message3():
    prog_str = """
description: Messages block
content:
    data: {"a": 1}
"""
    result = exec_str(prog_str, output="all")
    context = result["scope"]["pdl_context"]
    assert result["result"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": {"a": 1},
            "pdl__defsite": "message",
        }
    ]
    assert context.serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": {"a": 1},
            "pdl__defsite": "message",
        },
    ]


def test_message4():
    prog_str = """
description: Messages block
content:
    text:
      data: {"a": 1}
"""
    result = exec_str(prog_str, output="all")
    context = result["scope"]["pdl_context"]
    assert result["result"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": '{"a": 1}',
            "pdl__defsite": "message",
        }
    ]
    assert context.serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": '{"a": 1}',
            "pdl__defsite": "message",
        },
    ]


def test_messages5():
    prog_str = """
description: Messages block
array:
  - role: tool
    content: 42
    name: f
    tool_call_id: id
"""
    result = exec_str(prog_str, output="all")
    context = result["scope"]["pdl_context"]
    assert result["result"][0].serialize(SerializeMode.LITELLM) == [
        {
            "role": "tool",
            "content": 42,
            "name": "f",
            "tool_call_id": "id",
            "pdl__defsite": "array.0.message",
        },
    ]
    assert context.serialize(SerializeMode.LITELLM) == [
        {
            "role": "tool",
            "content": 42,
            "name": "f",
            "tool_call_id": "id",
            "pdl__defsite": "array.0.message",
        }
    ]
