import json
from pathlib import Path
from typing import Any, Optional

import yaml
from pydantic import ValidationError

from .pdl_ast import PDLException, PdlLocationType, Program, empty_block_location
from .pdl_location_utils import get_line_map
from .pdl_schema_error_analyzer import analyze_errors


class PDLParseError(PDLException):
    pass


def parse_file(pdl_file: str | Path) -> tuple[Program, PdlLocationType]:
    with open(pdl_file, "r", encoding="utf-8") as pdl_fp:
        prog_str = pdl_fp.read()
    return parse_str(prog_str, file_name=str(pdl_file))


def parse_str(
    pdl_str: str, file_name: Optional[str] = None
) -> tuple[Program, PdlLocationType]:
    if file_name is None:
        file_name = ""
    prog_dict = yaml.safe_load(pdl_str)
    line_table = get_line_map(pdl_str)
    loc = PdlLocationType(path=[], file=file_name, table=line_table)
    prog = parse_dict(prog_dict, loc)
    return prog, loc


def parse_dict(
    pdl_dict: dict[str, Any], loc: Optional[PdlLocationType] = None
) -> Program:
    try:
        prog = Program.model_validate(pdl_dict)
        # set_program_location(prog, pdl_str)
    except ValidationError as exc:
        pdl_schema_file = Path(__file__).parent / "pdl-schema.json"
        with open(pdl_schema_file, "r", encoding="utf-8") as schema_fp:
            schema = json.load(schema_fp)
        defs = schema["$defs"]
        if loc is None:
            loc = empty_block_location
        errors = analyze_errors(defs, defs["Program"], pdl_dict, loc)
        if errors == []:
            if loc.file == "":
                errors = ["The PDL program does not respect the schema."]
            else:
                errors = [f"The file PDL {loc.file} does not respect the schema."]
        raise PDLParseError(errors) from exc
    return prog


# def set_program_location(prog: Program, pdl_str: str, file_name: str = ""):
#     loc = strictyaml.dirty_load(pdl_str, allow_flow_style=True)
#     set_location(prog.root, loc)


# def set_location(
#     pdl: Any,
#     loc: YamlSource,
# ):
#     if hasattr(pdl, "pdl_yaml_src"):
#         pdl.pdl_yaml_src = loc
#     if isinstance(loc.data, dict):
#         for x, v in loc.items():
#             if hasattr(pdl, x.data):
#                 set_location(getattr(pdl, x.data), v)
#     elif isinstance(pdl, list) and isinstance(loc.data, list):
#         for data_i, loc_i in zip(pdl, loc):
#             set_location(data_i, loc_i)


# def set_program_location(prog: Program, pdl_str: str, file_name: str = ""):
#     line_table = get_line_map(pdl_str)
#     loc = LocationType(path=[], file=file_name, table=line_table)
#     return Program(set_blocks_location(prog.root, loc))

# def set_blocks_location(
#     blocks: BlocksType,
#     loc: YAML,
# ):
#     if is_block_list(blocks):
#         return [set_block_location(block, append(loc, f"[{i}]")) for i, block in enumerate(blocks)]
#     return set_block_location(blocks, loc)


# def set_block_location(
#     block: BlocksType,
#     loc: LocationType,
# ):
#     if not isinstance(block, Block):
#         return DataBlock(data=block, location=loc)
#     block = block.model_copy(update={"location": loc})
#     defs_loc = append(loc, "defs")
#     block.defs = {x: set_block_location(b, append(defs_loc, x)) for x, b in block.defs }
#     if block.parser is not None:
#         block.parser = set_parser_location(block.parser)
#     if block.fallback is not None:
#         block.fallback = set_block_location(block.fallback, append(loc, "fallback"))
#     match block:
#         case FunctionBlock():
#             block.returns = set_blocks_location(block.returns, append(loc, "return"))
#         case CallBlock():
#             block.args = {x: set_expr_location(expr) for x, expr in block.args.items()}
#         case ModelBlock():
#             if block.input is not None:
#                 iter_blocks(f, block.input)
#         case CodeBlock():
#             iter_blocks(f, block.code)
#         case GetBlock():
#             pass
#         case DataBlock():
#             pass
#         case TextBlock():
#             iter_blocks(f, block.text)
#         case LastOfBlock():
#             iter_blocks(f, block.lastOf)
#         case ArrayBlock():
#             iter_blocks(f, block.array)
#         case ObjectBlock():
#             if isinstance(block.object, dict):
#                 body = list(block.object.values())
#             else:
#                 body = block.object
#             iter_blocks(f, body)
#         case MessageBlock():
#             iter_blocks(f, block.content)
#         case IfBlock():
#             iter_blocks(f, block.then)
#             if block.else_ is not None:
#                 iter_blocks(f, block.else_)
#         case RepeatBlock():
#             iter_blocks(f, block.repeat)
#             if block.pdl__trace is not None:
#                 for trace in block.pdl__trace:
#                     iter_blocks(f, trace)
#         case ErrorBlock():
#             iter_blocks(f, block.program)
#         case ReadBlock():
#             pass
#         case IncludeBlock():
#             if block.pdl__trace is not None:
#                 iter_blocks(f, block.pdl__trace)
#         case EmptyBlock():
#             pass
#         case _:
#             assert (
#                 False
#             ), f"Internal error (missing case iter_block_children({type(block)}))"
#     match (block.parser):
#         case "json" | "yaml" | RegexParser():
#             pass
#         case PdlParser():
#             iter_blocks(f, block.parser.pdl)
#     if block.fallback is not None:
#         iter_blocks(f, block.fallback)
