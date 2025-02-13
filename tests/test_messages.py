from pdl.pdl import exec_str


def test_messages1():
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
