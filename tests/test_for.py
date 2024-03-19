from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import contains_error, process_block  # pyright: ignore

for_data = {
    "description": "For block example",
    "document": [
        {
            "for": {
                "i": [1, 2, 3, 4],
            },
            "repeat": ["{{ i }}\n"],
        }
    ],
}


def test_for_data():
    log = []
    data = Program.model_validate(for_data)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "1\n2\n3\n4\n"


for_data1 = {
    "description": "For block example",
    "document": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"]},
            "repeat": ["{{ i }}: {{ name }}\n"],
        }
    ],
}


def test_for_data1():
    log = []
    data = Program.model_validate(for_data1)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert document == "1: A\n2: B\n3: C\n4: D\n"


for_data2 = {
    "description": "For block example",
    "defs": {"ids": {"data": [5, 6, 7, 8]}},
    "document": [
        {
            "for": {"i": [1, 2, 3, 4], "name": ["A", "B", "C", "D"], "id": "{{ ids }}"},
            "repeat": ["{{ i }}: {{ name }}: {{ id }}\n"],
        }
    ],
}


def test_for_data2():
    log = []
    data = Program.model_validate(for_data2)
    _, document, _, _ = process_block(log, empty_scope, data.root)
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
    log = []
    data = Program.model_validate(for_data3)
    _, _, _, trace = process_block(log, empty_scope, data.root)
    assert contains_error(trace)
