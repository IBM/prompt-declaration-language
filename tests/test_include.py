from pathlib import Path

from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

include_data = {
    "description": "Include test",
    "text": [
        "Start\n",
        {"include": "./data/hello.pdl"},
        "End",
    ],
}


def test_include():
    state = InterpreterState(cwd=Path(__file__).parent)
    data = Program.model_validate(include_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        text
        == """Start
Hello, world!
This is your first PDL program
This is your first PDL program
End"""
    )


biz = {
    "description": "Include test",
    "text": [
        {"include": "data/function.pdl"},
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
    state = InterpreterState(cwd=Path(__file__).parent)
    data = Program.model_validate(biz)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        text
        == "preamble data\n### Question: question data\n\n### Notes:\nnotes data\n\n### Answer:\n"
    )
