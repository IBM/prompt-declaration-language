

from pdl.pdl import exec_str


def do_test(capsys, test):
    result = exec_str(test["prog"])
    captured = capsys.readouterr()
    assert result == test["result"]
    assert captured.err == test["warnings"]

def test_no_warning(capsys):
    test = { "prog": """
text:
- Hello
- How are you?
- Bye
""",
    "result": "Bye",
    "warnings": """Warning: the result of block `Hello` is not used.
         You might want to use a `text` block or explicitly ignore the result with `contribute: [context]`.
Warning: the result of block `How are you?` is not used.
"""
    }
    do_test(capsys, test)


def test_strings(capsys):
    test = { "prog": """
- Hello
- How are you?
- Bye
""",
    "result": "Bye",
    "warnings": """Warning: the result of block `Hello` is not used.
         You might want to use a `text` block or explicitly ignore the result with `contribute: [context]`.
Warning: the result of block `How are you?` is not used.
"""
    }
    do_test(capsys, test)
