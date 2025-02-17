from pathlib import Path

from pdl.pdl import InterpreterConfig, exec_dict

include_data = {
    "description": "Include test",
    "text": [
        "Start\n",
        {"include": "./data/hello.pdl"},
        "End",
    ],
}


def test_include():
    config = InterpreterConfig(cwd=Path(__file__).parent)
    text = exec_dict(include_data, config=config)
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
            "call": "${ template }",
            "args": {
                "preamble": "preamble data",
                "question": "question data",
                "notes": "notes data",
            },
        },
    ],
}


def test_biz():
    config = InterpreterConfig(cwd=Path(__file__).parent)
    text = exec_dict(biz, config=config)
    assert (
        text
        == "preamble data\n### Question: question data\n\n### Notes:\nnotes data\n\n### Answer:\n"
    )
