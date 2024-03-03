import json

from pdl.pdl.pdl_ast import Program  # pyright: ignore


def test_saved_schema():
    current_schema = Program.model_json_schema()
    with open("pdl-schema.json", "r", encoding="utf-8") as fd:
        saved_schema = json.load(fd)
    assert current_schema == saved_schema
