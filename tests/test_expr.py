from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

arith_data = {
    "description": "Test arith",
    "document": "{{ 1 + 1 }}",
}


def test_arith():
    log = []
    data = Program.model_validate(arith_data)
    result, document, _, _ = process_block(log, empty_scope, data.root)
    assert result == 2
    assert document == "2"


var_data = {
    "defs": {"X": {"data": 1}, "Y": {"data": 2}},
    "document": "{{ X + Y }}",
}


def test_var():
    log = []
    data = Program.model_validate(var_data)
    result, document, _, _ = process_block(log, empty_scope, data.root)
    assert result == 3
    assert document == "3"


true_data = {
    "document": "{{ 1 < 2 }}",
}


def test_true():
    log = []
    data = Program.model_validate(true_data)
    result, document, _, _ = process_block(log, empty_scope, data.root)
    assert result
    assert document == "true"


false_data = {
    "document": "{{ 1 >= 2 }}",
}


def test_false():
    log = []
    data = Program.model_validate(false_data)
    result, document, _, _ = process_block(log, empty_scope, data.root)
    assert not result
    assert document == "false"
