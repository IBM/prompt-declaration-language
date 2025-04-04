from pdl.pdl import exec_str


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
    assert result["result"] == [
        {
            "role": "system",
            "content": "You are a helpful software engineer. You write clear, concise, well-commented code.",
            "defsite": "array.0.message",
        },
        {
            "role": "user",
            "content": "Write a Python function that implement merge sort.",
            "defsite": "array.1.message",
        },
    ]
    assert context == [
        {
            "role": "system",
            "content": "You are a helpful software engineer. You write clear, concise, well-commented code.",
            "defsite": "array.0.message",
        },
        {
            "role": "user",
            "content": "Write a Python function that implement merge sort.",
            "defsite": "array.1.message",
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
    assert result["result"] == {
        "role": "user",
        "content": ["Hello", "Bye"],
        "defsite": "message",
    }
    assert context == [
        {
            "role": "user",
            "content": ["Hello", "Bye"],
            "defsite": "message",
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
    assert result["result"] == {
        "role": "user",
        "content": {"a": 1},
        "defsite": "message",
    }
    assert context == [
        {
            "role": "user",
            "content": {"a": 1},
            "defsite": "message",
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
    assert result["result"] == {
        "role": "user",
        "content": '{"a": 1}',
        "defsite": "message",
    }
    assert context == [
        {
            "role": "user",
            "content": '{"a": 1}',
            "defsite": "message",
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
    assert result["result"] == [
        {
            "role": "tool",
            "content": 42,
            "name": "f",
            "tool_call_id": "id",
            "defsite": "array.0.message",
        },
    ]
    assert context == [
        {
            "role": "tool",
            "content": 42,
            "name": "f",
            "tool_call_id": "id",
            "defsite": "array.0.message",
        }
    ]
