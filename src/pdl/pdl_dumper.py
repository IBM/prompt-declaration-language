import datetime
import json
from typing import Any, Sequence, TypeAlias

import yaml

from . import pdl_ast
from .pdl_ast import (
    AnyPattern,
    ArrayBlock,
    ArrayPattern,
    Block,
    CallBlock,
    CodeBlock,
    ContributeTarget,
    ContributeValue,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    JoinArray,
    JoinLastOf,
    JoinText,
    JoinType,
    LastOfBlock,
    LitellmModelBlock,
    LitellmParameters,
    LocationType,
    MatchBlock,
    MessageBlock,
    ObjectBlock,
    ObjectPattern,
    OrPattern,
    ParserType,
    PatternType,
    PdlParser,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    TextBlock,
)

yaml.SafeDumper.org_represent_str = yaml.SafeDumper.represent_str  # type: ignore


def repr_str(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.org_represent_str(data)


yaml.add_representer(str, repr_str, Dumper=yaml.SafeDumper)


def dump_yaml(data, **kwargs):
    return yaml.safe_dump(
        data,
        default_flow_style=False,
        allow_unicode=True,
        width=1000000000,
        sort_keys=False,
        **kwargs,
    )


def dumps_json(data, **kwargs):
    return json.dumps(data, **kwargs)


DumpedBlockType: TypeAlias = None | bool | int | float | str | dict[str, Any]


def program_to_dict(
    prog: pdl_ast.Program, json_compatible: bool = False
) -> DumpedBlockType | list[DumpedBlockType]:
    return block_to_dict(prog.root, json_compatible)


def block_to_dict(block: pdl_ast.BlockType, json_compatible: bool) -> DumpedBlockType:
    if not isinstance(block, Block):
        return block
    d: dict[str, Any] = {}
    d["kind"] = str(block.kind)
    if block.start_nanos != 0:
        if block.context is not None and len(block.context) > 0:
            d["context"] = block.context
        d["start_nanos"] = block.start_nanos
        d["end_nanos"] = block.end_nanos

        now = datetime.datetime.now()
        local_now = now.astimezone()
        local_tz = local_now.tzinfo
        if local_tz is not None:
            local_tzname = local_tz.tzname(local_now)
        else:
            local_tzname = "UTC"
        d["timezone"] = local_tzname
    if block.description is not None:
        d["description"] = block.description
    if block.role is not None:
        d["role"] = block.role
    if block.spec is not None:
        d["spec"] = block.spec
    if block.defs is not None:
        d["defs"] = {
            x: block_to_dict(b, json_compatible) for x, b in block.defs.items()
        }
    match block:
        case LitellmModelBlock():
            d["platform"] = str(block.platform)
            d["model"] = block.model
            if block.input is not None:
                d["input"] = block_to_dict(block.input, json_compatible)
            if block.parameters is not None:
                if isinstance(block.parameters, LitellmParameters):
                    d["parameters"] = block.parameters.model_dump(
                        exclude_unset=True, exclude_defaults=True
                    )
                else:
                    d["parameters"] = block.parameters
            if block.modelResponse is not None:
                d["modelResponse"] = block.modelResponse
        case CodeBlock():
            d["lang"] = block.lang
            d["code"] = block_to_dict(block.code, json_compatible)
        case GetBlock():
            d["get"] = block.get
        case DataBlock():
            d["data"] = block.data
            if block.raw:
                d["raw"] = block.raw
        case TextBlock():
            if not isinstance(block.text, str) and isinstance(block.text, Sequence):
                # is a list of blocks
                d["text"] = [block_to_dict(b, json_compatible) for b in block.text]
            else:
                d["text"] = block_to_dict(block.text, json_compatible)
        case LastOfBlock():
            d["lastOf"] = [block_to_dict(b, json_compatible) for b in block.lastOf]
        case ArrayBlock():
            d["array"] = [block_to_dict(b, json_compatible) for b in block.array]
        case ObjectBlock():
            if isinstance(block.object, dict):
                d["object"] = {
                    k: block_to_dict(b, json_compatible)
                    for k, b in block.object.items()
                }
            else:
                d["object"] = [block_to_dict(b, json_compatible) for b in block.object]
        case MessageBlock():
            d["content"] = block_to_dict(block.content, json_compatible)
        case ReadBlock():
            d["read"] = block.read
            d["message"] = block.message
            d["multiline"] = block.multiline
        case IncludeBlock():
            d["include"] = block.include
            if block.trace:
                d["trace"] = block_to_dict(block.trace, json_compatible)
        case IfBlock():
            d["if"] = block.condition
            d["then"] = block_to_dict(block.then, json_compatible)
            if block.elses is not None:
                d["else"] = block_to_dict(block.elses, json_compatible)
            if block.if_result is not None:
                d["if_result"] = block.if_result
        case MatchBlock():
            d["match"] = block.match_
            d["with"] = [
                {
                    "case": pattern_to_dict(match_case.case),
                    "if": match_case.if_,
                    "then": block_to_dict(match_case.then, json_compatible),
                }
                for match_case in block.with_
            ]
        case RepeatBlock():
            d["repeat"] = block_to_dict(block.repeat, json_compatible)
            d["num_iterations"] = block.num_iterations
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [block_to_dict(b, json_compatible) for b in block.trace]
        case RepeatUntilBlock():
            d["repeat"] = block_to_dict(block.repeat, json_compatible)
            d["until"] = block.until
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [block_to_dict(b, json_compatible) for b in block.trace]
        case ForBlock():
            d["for"] = block.fors
            d["repeat"] = block_to_dict(block.repeat, json_compatible)
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [block_to_dict(b, json_compatible) for b in block.trace]
        case FunctionBlock():
            d["function"] = block.function
            d["return"] = block_to_dict(block.returns, json_compatible)
            # if block.scope is not None:
            #     d["scope"] = scope_to_dict(block.scope, json_compatible)
        case CallBlock():
            d["call"] = block.call
            d["args"] = block.args
            if block.trace is not None:
                d["trace"] = block_to_dict(
                    block.trace, json_compatible
                )  # pyright: ignore
        case EmptyBlock():
            pass
        case ErrorBlock():
            d["program"] = block_to_dict(block.program, json_compatible)
            d["msg"] = block.msg
    if block.assign is not None:
        d["def"] = block.assign
    if set(block.contribute) != {ContributeTarget.RESULT, ContributeTarget.CONTEXT}:
        d["contribute"] = contribute_to_list(block.contribute)
    if block.result is not None:
        if isinstance(block.result, FunctionBlock):
            d["result"] = ""
        elif json_compatible:
            d["result"] = as_json(block.result)
        else:
            d["result"] = block.result
    if block.parser is not None:
        d["parser"] = parser_to_dict(block.parser)
    # if block.location is not None:
    #     d["location"] = location_to_dict(block.location)
    if block.fallback is not None:
        d["fallback"] = block_to_dict(block.fallback, json_compatible)
    return d


def pattern_to_dict(pattern: PatternType):
    if not isinstance(pattern, pdl_ast.Pattern):
        return pattern
    result: dict[str, Any]
    match pattern:
        case OrPattern():
            result = {"anyOf": [pattern_to_dict(p) for p in pattern.anyOf]}
        case ArrayPattern():
            result = {"array": [pattern_to_dict(p) for p in pattern.array]}
        case ObjectPattern():
            result = {
                "object": {k: pattern_to_dict(p) for k, p in pattern.object.items()}
            }
        case AnyPattern():
            result = {"any": None}
        case _:
            assert False
    if pattern.assign is not None:
        result["def"] = pattern.assign
    return result


def join_to_dict(join: JoinType) -> dict[str, Any]:
    d = {}
    match join:
        case JoinText():
            d["with"] = join.join_string
        case JoinArray() | JoinLastOf():
            d["as"] = str(join.iteration_type)
    return d


JsonType: TypeAlias = None | bool | int | float | str | dict[str, "JsonType"]


def as_json(value: Any) -> JsonType:
    if value is None:
        return None
    if isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, dict):
        return {str(k): as_json(v) for k, v in value.items()}
    return str(value)


def parser_to_dict(parser: ParserType) -> str | dict[str, Any]:
    p: str | dict[str, Any]
    match parser:
        case "json" | "yaml":
            p = parser
        case RegexParser():
            p = parser.model_dump()
        case PdlParser():
            p = {}
            p["description"] = parser.description
            p["spec"] = parser.spec
            p["pdl"] = block_to_dict(parser.pdl, False)
        case _:
            assert False
    return p


def location_to_dict(location: LocationType) -> dict[str, Any]:
    return {"path": location.path, "file": location.file, "table": location.table}


def contribute_to_list(
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]]
) -> list[str | dict[str, Any]]:
    acc: list[str | dict[str, Any]] = []
    for contrib in contribute:
        if isinstance(contrib, str):
            acc.append(str(contrib))
        elif isinstance(contrib, dict):
            acc.append({str(k): v.model_dump() for k, v in contrib.items()})
    return acc


# def scope_to_dict(scope: ScopeType) -> dict[str, Any]:
#     d = {}
#     for x, v in scope.items():
#         if isinstance(v, Block):
#             d[x] = block_to_dict(v)  # type: ignore
#         else:
#             d[x] = v
#     return d
