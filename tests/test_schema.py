import json
from pathlib import Path

from pydantic.json_schema import models_json_schema

import pdl.pdl
from pdl.pdl_ast import PdlBlock, Program


def test_saved_schema():
    top, current_schema = models_json_schema(
        [
            (Program, "validation"),
            (PdlBlock, "validation"),
        ],
        title="PDL Schemas",
    )
    current_schema["anyOf"] = list(top.values())
    pdl_schema_file = Path(pdl.pdl.__file__).parent / "pdl-schema.json"
    with open(pdl_schema_file, "r", encoding="utf-8") as fd:
        saved_schema = json.load(fd)
    assert current_schema == saved_schema
