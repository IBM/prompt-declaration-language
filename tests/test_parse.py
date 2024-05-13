from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

regex_data = {
    "description": "Parsing using regex",
    "document": "Malcolm Reynolds",
    "parser": {
        "spec": {"first_name": "str", "last_name": "str"},
        "regex": "(?P<first_name>\\w+) (?P<last_name>\\w+)",
    },
}


def test_model():
    state = InterpreterState()
    data = Program.model_validate(regex_data)
    result, document, _, _ = process_prog(state, empty_scope, data)
    assert result == {"first_name": "Malcolm", "last_name": "Reynolds"}
    assert document == "Malcolm Reynolds"
