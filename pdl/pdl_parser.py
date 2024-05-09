import json

import yaml
from pydantic import ValidationError

from .pdl_ast import LocationType, PDLException, Program
from .pdl_location_utils import get_line_map
from .pdl_schema_error_analyzer import analyze_errors


class PDLParseError(PDLException):
    pass


def parse_program(pdl_file: str) -> tuple[Program, dict[str, int]]:
    with open(pdl_file, "r", encoding="utf-8") as table_fp:
        line_table = get_line_map(table_fp)
        with open(pdl_file, "r", encoding="utf-8") as pdl_fp:
            prog_yaml = yaml.safe_load(pdl_fp)
            loc = LocationType(path=[], file=pdl_file, table=line_table)
            try:
                prog = Program.model_validate(prog_yaml)
            except ValidationError as exc:
                with open("pdl-schema.json", "r", encoding="utf-8") as schema_file:
                    schema = json.load(schema_file)
                defs = schema["$defs"]
                errors = analyze_errors(defs, defs["Program"], prog_yaml, loc)
                raise PDLParseError(errors) from exc
    return prog, line_table
