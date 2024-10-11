from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

direct_fallback_data = {"model": "raise an error", "fallback": "The error was caught"}


def test_direct_fallback():
    state = InterpreterState()
    data = Program.model_validate(direct_fallback_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "The error was caught"


indirect_fallback_data = {
    "text": [{"model": "raise an error"}],
    "fallback": "The error was caught",
}


def test_indirect_fallback():
    state = InterpreterState()
    data = Program.model_validate(indirect_fallback_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "The error was caught"


error_in_sequence_data = {
    "text": ["Hello ", {"model": "raise an error"}, "Bye!"],
    "fallback": "The error was caught",
}


def test_error_in_sequence():
    state = InterpreterState()
    data = Program.model_validate(error_in_sequence_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "The error was caught"
