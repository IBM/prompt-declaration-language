import json

from pydantic.json_schema import models_json_schema

from pdl.pdl_ast import PdlBlock, PdlBlocks, Program


def test_saved_schema():
    top, current_schema = models_json_schema(
        [
            (Program, "validation"),
            (PdlBlock, "validation"),
            (PdlBlocks, "validation"),
        ],
        title="PDL Schemas",
    )
    current_schema["anyOf"] = list(top.values())
    with open("pdl-schema.json", "r", encoding="utf-8") as fd:
        saved_schema = json.load(fd)
    assert current_schema == saved_schema
