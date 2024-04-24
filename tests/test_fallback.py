from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_prog  # pyright: ignore

direct_fallback_data = {"model": "raise an error", "fallback": "The error was caught"}


def test_direct_fallback():
    log = []
    data = Program.model_validate(direct_fallback_data)
    _, document, _, _ = process_prog(log, empty_scope, data)
    assert document == "The error was caught"


indirect_fallback_data = {
    "document": [{"model": "raise an error"}],
    "fallback": "The error was caught",
}


def test_indirect_fallback():
    log = []
    data = Program.model_validate(indirect_fallback_data)
    _, document, _, _ = process_prog(log, empty_scope, data)
    assert document == "The error was caught"


error_in_sequence_data = {
    "document": ["Hello ", {"model": "raise an error"}, "Bye!"],
    "fallback": "The error was caught",
}


def test_error_in_sequence():
    log = []
    data = Program.model_validate(error_in_sequence_data)
    _, document, _, _ = process_prog(log, empty_scope, data)
    assert document == "Hello Bye!The error was caught"
