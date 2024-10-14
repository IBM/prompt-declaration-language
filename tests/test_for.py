import pytest

from pdl.pdl import exec_str
from pdl.pdl_ast import Program
from pdl.pdl_interpreter import (
    InterpreterState,
    PDLRuntimeError,
    empty_scope,
    process_prog,
)

for_data = {
    "description": "For block example",
    "text": [
        {
            "for": {
                "i": [1, 2, 3, 4],
            },
            "repeat": ["${ i }\n"],
        }
    ],
}


def test_for_data():
    state = InterpreterState()
    data = Program.model_validate(for_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "1\n2\n3\n4\n"


for_data1 = {
    "description": "For block example",
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"]},
            "repeat": ["${ i }: ${ name }\n"],
        }
    ],
}


def test_for_data1():
    state = InterpreterState()
    data = Program.model_validate(for_data1)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "1: A\n2: B\n3: C\n4: D\n"


for_data2 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6, 7, 8]}},
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "${ ids }"},
            "repeat": ["${ i }: ${ name }: ${ id }\n"],
        }
    ],
}


def test_for_data2():
    state = InterpreterState()
    data = Program.model_validate(for_data2)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "1: A: 5\n2: B: 6\n3: C: 7\n4: D: 8\n"


for_data3 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6]}},
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "${ ids }"},
            "repeat": ["${ i }: ${ name }: ${ id }\n"],
            "join": {"as": "array"},
        }
    ],
}


def test_for_data3():
    state = InterpreterState()
    data = Program.model_validate(for_data3)
    with pytest.raises(PDLRuntimeError):
        process_prog(state, empty_scope, data)


for_data4 = {
    "description": "For block def",
    "text": [
        {
            "def": "x",
            "for": {"i": [1, 2, 3, 4]},
            "repeat": "${ i + 1 }",
            "join": {"as": "array"},
        }
    ],
}


def test_for_data4():
    state = InterpreterState()
    data = Program.model_validate(for_data4)
    result, _, scope, _ = process_prog(state, empty_scope, data)
    assert result == "[2, 3, 4, 5]"
    assert scope["x"] == [2, 3, 4, 5]


for_as_text_data4 = {
    "description": "For block def",
    "text": [
        {
            "def": "x",
            "for": {"i": [1, 2, 3, 4]},
            "repeat": "${ i + 1 }",
        }
    ],
}


def test_for_as_text_data4():
    state = InterpreterState()
    data = Program.model_validate(for_as_text_data4)
    result, _, scope, _ = process_prog(state, empty_scope, data)
    assert result == "2345"
    assert scope["x"] == "2345"


for_data5 = {
    "description": "For block def",
    "text": [
        {
            "def": "x",
            "text": {
                "for": {"i": [1, 2, 3, 4]},
                "repeat": "${ i }",
                "join": {"as": "array"},
            },
        }
    ],
}


def test_for_data5():
    state = InterpreterState()
    data = Program.model_validate(for_data5)
    result, _, scope, _ = process_prog(state, empty_scope, data)
    assert result == "[1, 2, 3, 4]"
    assert scope["x"] == "[1, 2, 3, 4]"


def test_for_nested_array():
    prog_str = """
for:
    i: [1,2,3]
repeat:
    for:
        j: [1,2]
    repeat: "${i}${j}"
    join:
        as: array
join:
    as: array
"""
    result = exec_str(prog_str)
    assert result == [["11", "12"], ["21", "22"], ["31", "32"]]


def test_for_nested_text():
    prog_str = r"""
for:
    i: [1,2,3]
repeat:
    for:
        j: [1,2]
    repeat: "${i}${j}"
join:
    with: "\n"
"""
    result = exec_str(prog_str)
    assert result == "\n".join(["1112", "2122", "3132"])
