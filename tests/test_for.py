import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError

for_data = {
    "description": "For block example",
    "text": [
        {
            "for": {
                "i": [1, 2, 3, 4],
            },
            "repeat": "${ i }\n",
        }
    ],
}


def test_for_data():
    text = exec_dict(for_data)
    assert text == "1\n2\n3\n4\n"


for_data1 = {
    "description": "For block example",
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"]},
            "repeat": "${ i }: ${ name }\n",
        }
    ],
}


def test_for_data1():
    text = exec_dict(for_data1)
    assert text == "1: A\n2: B\n3: C\n4: D\n"


for_data2 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6, 7, 8]}},
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "${ ids }"},
            "repeat": "${ i }: ${ name }: ${ id }\n",
        }
    ],
}


def test_for_data2():
    text = exec_dict(for_data2)
    assert text == "1: A: 5\n2: B: 6\n3: C: 7\n4: D: 8\n"


for_data3 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6]}},
    "text": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "${ ids }"},
            "repeat": "${ i }: ${ name }: ${ id }\n",
            "join": {"as": "array"},
        }
    ],
}


def test_for_data3():
    with pytest.raises(PDLRuntimeError):
        exec_dict(for_data3)


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
    result = exec_dict(for_data4, output="all")
    assert result["result"] == "[2, 3, 4, 5]"
    assert result["scope"]["x"] == [2, 3, 4, 5]


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
    result = exec_dict(for_as_text_data4, output="all")
    assert result["result"] == "2345"
    assert result["scope"]["x"] == "2345"


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
    result = exec_dict(for_data5, output="all")
    assert result["result"] == "[1, 2, 3, 4]"
    assert result["scope"]["x"] == "[1, 2, 3, 4]"


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
