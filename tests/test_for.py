import pytest

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_interpreter import PDLRuntimeError


def for_data(loop_kind):
    return {
        "description": "For block example",
        "text": [
            {
                "for": {
                    "i": [1, 2, 3, 4],
                },
                loop_kind: "${ i }\n",
            }
        ],
    }


def test_for_data():
    for loop_kind in ["repeat", "map"]:
        text = exec_dict(for_data(loop_kind))
        assert text == "1\n2\n3\n4\n"


def for_data1(loop_kind):
    return {
        "description": "For block example",
        "text": [
            {
                "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"]},
                loop_kind: "${ i }: ${ name }\n",
            }
        ],
    }


def test_for_data1():
    for loop_kind in ["repeat", "map"]:
        text = exec_dict(for_data1(loop_kind))
        assert text == "1: A\n2: B\n3: C\n4: D\n"


def for_data2(loop_kind):
    return {
        "description": "For block example",
        "defs": {"ids": {"data": [5, 6, 7, 8]}},
        "text": [
            {
                "for": {
                    "i": [1, 2, 3, 4],
                    "name": ["A", "B", "C", "D"],
                    "id": "${ ids }",
                },
                loop_kind: "${ i }: ${ name }: ${ id }\n",
            }
        ],
    }


def test_for_data2():
    for loop_kind in ["repeat", "map"]:
        text = exec_dict(for_data2(loop_kind))
        assert text == "1: A: 5\n2: B: 6\n3: C: 7\n4: D: 8\n"


def for_data3(loop_kind):
    return {
        "description": "For block example",
        "defs": {"ids": {"data": [5, 6]}},
        "text": [
            {
                "for": {
                    "i": [1, 2, 3, 4],
                    "name": ["A", "B", "C", "D"],
                    "id": "${ ids }",
                },
                loop_kind: "${ i }: ${ name }: ${ id }\n",
                "join": {"as": "array"},
            }
        ],
    }


def test_for_data3():
    with pytest.raises(PDLRuntimeError):
        for loop_kind in ["repeat", "map"]:
            exec_dict(for_data3(loop_kind))


def for_data4(loop_kind):
    return {
        "description": "For block def",
        "text": [
            {
                "def": "x",
                "for": {"i": [1, 2, 3, 4]},
                loop_kind: "${ i + 1 }",
                "join": {"as": "array"},
            }
        ],
    }


def test_for_data4():
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_data4(loop_kind), output="all")
        assert result["result"] == "[2, 3, 4, 5]"
        assert result["scope"]["x"] == [2, 3, 4, 5]


def for_as_text_data4(loop_kind):
    return {
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
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_as_text_data4(loop_kind), output="all")
        assert result["result"] == "2345"
        assert result["scope"]["x"] == "2345"


def for_data5(loop_kind):
    return {
        "description": "For block def",
        "text": [
            {
                "def": "x",
                "text": {
                    "for": {"i": [1, 2, 3, 4]},
                    loop_kind: "${ i }",
                    "join": {"as": "array"},
                },
            }
        ],
    }


def test_for_data5():
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_data5(loop_kind), output="all")
        assert result["result"] == "[1, 2, 3, 4]"
        assert result["scope"]["x"] == "[1, 2, 3, 4]"


def test_for_nested_array():
    for loop_kind in ["repeat", "map"]:
        prog_str = f"""
for:
    i: [1,2,3]
repeat:
    for:
        j: [1,2]
    {loop_kind}: "${{i}}${{j}}"
    join:
        as: array
join:
    as: array
"""
        result = exec_str(prog_str)
        assert result == [["11", "12"], ["21", "22"], ["31", "32"]]


def test_for_object():
    for loop_kind in ["repeat", "map"]:
        prog_str = f"""
description: for loop creating an object
defs:
  numbers:
    data: [1, 2, 3, 4]
  names:
    data: ["Bob", "Carol", "David", "Ernest"]
for:
  number: ${{ numbers }}
  name: ${{ names }}
{loop_kind}:
  data:
    ${{ name }}: ${{ number }}
join:
  as: object
"""
        result = exec_str(prog_str)
        assert result == {"Bob": 1, "Carol": 2, "David": 3, "Ernest": 4}


def test_for_nested_text():
    for loop_kind1 in ["repeat", "map"]:
        for loop_kind2 in ["repeat", "map"]:
            prog_str = f"""
for:
    i: [1,2,3]
{loop_kind1}:
    for:
        j: [1,2]
    {loop_kind2}: "${{i}}${{j}}"
join:
    with: "\\n"
"""
            result = exec_str(prog_str)
            assert result == "\n".join(["1112", "2122", "3132"])


def for_scope(loop_kind):
    return {
        "defs": {"x": 0},
        "text": {
            "for": {"i": [1, 2, 3, 4]},
            loop_kind: {"defs": {"x": "${ x + i }"}, "data": "${ i + x }"},
            "join": {"as": "array"},
        },
    }


def test_for_scope():
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_scope(loop_kind), output="all")
        match loop_kind:
            case "repeat":
                assert result["result"] == "[2, 5, 9, 14]"
                assert result["scope"]["x"] == 10
            case "map":
                assert result["result"] == "[2, 4, 6, 8]"
                assert result["scope"]["x"] == 0


def for_index(loop_kind):
    return {
        "text": {
            "index": "idx",
            "for": {"i": [1, 2, 3, 4]},
            loop_kind: "${ i + idx }",
            "join": {"as": "array"},
        },
    }


def test_for_index():
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_index(loop_kind), output="all")
        assert result["result"] == "[1, 3, 5, 7]"


def for_context(loop_kind):
    return {
        "lastOf": [
            "Hello",
            {
                "for": {
                    "i": [
                        1,
                        2,
                        3,
                    ]
                },
                loop_kind: "${ pdl_context.serialize('litellm') }",
                "join": {"as": "array"},
            },
        ]
    }


def test_for_context():
    for loop_kind in ["repeat", "map"]:
        result = exec_dict(for_context(loop_kind), output="all")
        match loop_kind:
            case "repeat":
                assert result["result"] == [
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        }
                    ],
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "role": "user",
                                    "content": "Hello",
                                    "pdl__defsite": "lastOf.0.data",
                                }
                            ],
                            "pdl__defsite": "lastOf.1.repeat.0.data",
                        },
                    ],
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "role": "user",
                                    "content": "Hello",
                                    "pdl__defsite": "lastOf.0.data",
                                }
                            ],
                            "pdl__defsite": "lastOf.1.repeat.0.data",
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "role": "user",
                                    "content": "Hello",
                                    "pdl__defsite": "lastOf.0.data",
                                },
                                {
                                    "role": "user",
                                    "content": [
                                        {
                                            "role": "user",
                                            "content": "Hello",
                                            "pdl__defsite": "lastOf.0.data",
                                        }
                                    ],
                                    "pdl__defsite": "lastOf.1.repeat.0.data",
                                },
                            ],
                            "pdl__defsite": "lastOf.1.repeat.1.data",
                        },
                    ],
                ]
            case "map":
                assert result["result"] == [
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        }
                    ],
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        }
                    ],
                    [
                        {
                            "role": "user",
                            "content": "Hello",
                            "pdl__defsite": "lastOf.0.data",
                        }
                    ],
                ]


def test_for_reduce():
    for loop_kind1 in ["repeat", "map"]:
        prog_str = f"""
defs:
  plus:
    function:
        x: number
        y: number
    return: ${{ x + y }}
for:
  i: [1,2,3,4]
{loop_kind1}: ${{ i }}
join:
  reduce: ${{ plus }}
"""
        result = exec_str(prog_str)
        assert result == 10


def test_for_reduce_python():
    for loop_kind1 in ["repeat", "map"]:
        prog_str = f"""
defs:
  plus:
    lang: python
    code: |
      import operator
      result = operator.add
for:
  i: [1,2,3,4]
{loop_kind1}: ${{ i }}
join:
  reduce: ${{ plus }}
"""
        result = exec_str(prog_str)
        assert result == 10


def test_map_max_workers():
    for max_workers in [0, "null", 2, 4]:
        prog_str = f"""
for:
  i: [1,2,3,4]
map: ${{ i }}
maxWorkers: {max_workers}
"""
        result = exec_str(prog_str)
        assert result == "1234"
