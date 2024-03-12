from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

include_data = {
    "description": "Include test",
    "document": [
        "Start\n",
        {"include": "tests/data/hello.yaml"},
        "End",
    ],
}


def test_include():
    log = []
    data = Program.model_validate(include_data)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert (
        document
        == """Start
Hello, world!
This is your first PDL program
This is your first PDL program
End"""
    )


biz = {
    "description": "Include test",
    "document": [
        {"include": "tests/data/function.yaml"},
        {
            "call": "template",
            "args": {
                "preamble": "preamble data",
                "question": "question data",
                "notes": "notes data",
            },
        },
    ],
}


def test_biz():
    log = []
    data = Program.model_validate(biz)
    _, document, _, _ = process_block(log, empty_scope, data.root)
    assert (
        document
        == "preamble data\n### Question: question data\n\n### Notes:\nnotes data\n\n### Answer:\n"
    )
