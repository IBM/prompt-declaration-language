from pdl.pdl import exec_str


def do_test(capsys, test):
    result = exec_str(test["prog"])
    captured = capsys.readouterr()
    warnings = [line.strip() for line in captured.err.split("\n")]
    assert result == test["result"]
    assert " ".join(warnings) == " ".join(test["warnings"])


def test_strings(capsys):
    test = {
        "prog": """
- Hello
- How are you?
- Bye
""",
        "result": "Bye",
        "warnings": [
            "Warning: the result of block `Hello` is not used.",
            "You might want to use a `text` block or explicitly ignore the result with `contribute: [context]`.",
            "Warning: the result of block `How are you?` is not used.",
            "",
        ],
    }
    do_test(capsys, test)


def test_no_warning1(capsys):
    test = {
        "prog": """
text:
- Hello
- How are you?
- Bye
""",
        "result": "HelloHow are you?Bye",
        "warnings": [""],
    }
    do_test(capsys, test)


def test_no_warning2(capsys):
    test = {
        "prog": """
- def: x
  text: Hello
- text: How are you?
  contribute: []
- Bye
""",
        "result": "Bye",
        "warnings": [""],
    }
    do_test(capsys, test)
