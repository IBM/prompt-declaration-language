from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

regex_data = {
    "description": "Parsing using regex",
    "text": "Malcolm Reynolds",
    "parser": {
        "spec": {"first_name": "str", "last_name": "str"},
        "regex": "(?P<first_name>\\w+) (?P<last_name>\\w+)",
    },
}


def test_model():
    state = InterpreterState()
    data = Program.model_validate(regex_data)
    result, _, _, _ = process_prog(state, empty_scope, data)
    assert result == {"first_name": "Malcolm", "last_name": "Reynolds"}
