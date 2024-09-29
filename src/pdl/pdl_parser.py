import json
from pathlib import Path

import yaml
from pydantic import ValidationError

from .pdl_ast import LocationType, PDLException, Program
from .pdl_location_utils import get_line_map
from .pdl_schema_error_analyzer import analyze_errors


class PDLParseError(PDLException):
    pass


def parse_file(pdl_file: str | Path) -> tuple[Program, LocationType]:
    with open(pdl_file, "r", encoding="utf-8") as pdl_fp:
        prog_str = pdl_fp.read()
    return parse_str(prog_str, file_name=str(pdl_file))


def parse_str(pdl_str: str, file_name: str = "") -> tuple[Program, LocationType]:
    prog_yaml = yaml.safe_load(pdl_str)
    line_table = get_line_map(pdl_str)
    loc = LocationType(path=[], file=file_name, table=line_table)
    try:
        prog = Program.model_validate(prog_yaml)
    except ValidationError as exc:
        with open("pdl-schema.json", "r", encoding="utf-8") as schema_file:
            schema = json.load(schema_file)
        defs = schema["$defs"]
        errors = analyze_errors(defs, defs["Program"], prog_yaml, loc)
        raise PDLParseError(errors) from exc
    return prog, loc
