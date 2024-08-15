from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import (  # pyright: ignore
    InterpreterState,
    contains_error,
    process_prog,
)

for_data = {
    "description": "For block example",
    "document": [
        {
            "for": {
                "i": [1, 2, 3, 4],
            },
            "repeat": ["{{ i }}\n"],
            "as": "document",
        }
    ],
}


def test_for_data():
    state = InterpreterState()
    data = Program.model_validate(for_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "1\n2\n3\n4\n"


for_data1 = {
    "description": "For block example",
    "document": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"]},
            "repeat": ["{{ i }}: {{ name }}\n"],
            "as": "document",
        }
    ],
}


def test_for_data1():
    state = InterpreterState()
    data = Program.model_validate(for_data1)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "1: A\n2: B\n3: C\n4: D\n"


for_data2 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6, 7, 8]}},
    "document": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "{{ ids }}"},
            "repeat": ["{{ i }}: {{ name }}: {{ id }}\n"],
            "as": "document",
        }
    ],
}


def test_for_data2():
    state = InterpreterState()
    data = Program.model_validate(for_data2)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "1: A: 5\n2: B: 6\n3: C: 7\n4: D: 8\n"


for_data3 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6]}},
    "document": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "{{ ids }}"},
            "repeat": ["{{ i }}: {{ name }}: {{ id }}\n"],
        }
    ],
}


def test_for_data3():
    state = InterpreterState()
    data = Program.model_validate(for_data3)
    _, _, _, trace = process_prog(state, empty_scope, data)
    assert contains_error(trace)


for_data4 = {
    "description": "For block def",
    "document": [
        {
            "def": "x",
            "for": {"i": [1, 2, 3, 4]},
            "repeat": "{{ i + 1 }}",
        }
    ],
}


def test_for_data4():
    state = InterpreterState()
    data = Program.model_validate(for_data4)
    result, _, scope, _ = process_prog(state, empty_scope, data)
    assert result == "[2, 3, 4, 5]"
    assert scope["x"] == [2, 3, 4, 5]


for_as_document_data4 = {
    "description": "For block def",
    "document": [
        {
            "def": "x",
            "for": {"i": [1, 2, 3, 4]},
            "repeat": "{{ i + 1 }}",
            "as": "document",
        }
    ],
}


def test_for_as_document_data4():
    state = InterpreterState()
    data = Program.model_validate(for_as_document_data4)
    result, _, scope, _ = process_prog(state, empty_scope, data)
    assert result == "2345"
    assert scope["x"] == "2345"


for_data5 = {
    "description": "For block def",
    "document": [
        {
            "def": "x",
            "document": {
                "for": {"i": [1, 2, 3, 4]},
                "repeat": "{{ i }}",
            },
        }
    ],
}


for_data5 = {
    "description": "For block def",
    "document": [
        {
            "def": "x",
            "document": {
                "for": {"i": [1, 2, 3, 4]},
                "repeat": "{{ i }}",
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
