import json

from pydantic.json_schema import models_json_schema

from pdl.pdl.pdl_ast import PdlBlock, PdlBlocks, Program  # pyright: ignore


def test_saved_schema():
    _, current_schema = models_json_schema(
        [
            (Program, "validation"),
            (PdlBlock, "validation"),
            (PdlBlocks, "validation"),
        ],
        title="PDL Schemas",
    )

    with open("pdl-schema.json", "r", encoding="utf-8") as fd:
        saved_schema = json.load(fd)
    assert current_schema == saved_schema
