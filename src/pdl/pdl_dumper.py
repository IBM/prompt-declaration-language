import json
from typing import Any, Sequence, TypeAlias

import yaml

from . import pdl_ast
from .pdl_ast import (
    ArrayBlock,
    BamModelBlock,
    BamTextGenerationParameters,
    Block,
    BlocksType,
    CallBlock,
    CodeBlock,
    ContributeTarget,
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
    MessageBlock,
    ObjectBlock,
    ParserType,
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
    return blocks_to_dict(prog.root, json_compatible)


def block_to_dict(block: pdl_ast.BlockType, json_compatible: bool) -> DumpedBlockType:
    if not isinstance(block, Block):
        return block
    d: dict[str, Any] = {}
    d["kind"] = str(block.kind)
    if block.description is not None:
        d["description"] = block.description
    if block.spec is not None:
        d["spec"] = block.spec
    if block.defs is not None:
        d["defs"] = {
            x: blocks_to_dict(b, json_compatible) for x, b in block.defs.items()
        }
    match block:
        case BamModelBlock():
            d["platform"] = str(block.platform)
            d["model"] = block.model
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input, json_compatible)
            if block.prompt_id is not None:
                d["prompt_id"] = block.prompt_id
            if block.parameters is not None:
                if isinstance(block.parameters, BamTextGenerationParameters):
                    d["parameters"] = block.parameters.model_dump()
                else:
                    d["parameters"] = block.parameters
            if block.moderations is not None:
                d["moderations"] = block.moderations
            if block.data is True:
                d["data"] = block.data
            if block.constraints is not None:
                d["constraints"] = block.constraints
            if block.modelResponse is not None:
                d["modelResponse"] = block.modelResponse
        case LitellmModelBlock():
            d["platform"] = str(block.platform)
            d["model"] = block.model
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input, json_compatible)
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
            d["code"] = blocks_to_dict(block.code, json_compatible)
        case GetBlock():
            d["get"] = block.get
        case DataBlock():
            d["data"] = block.data
            if block.raw:
                d["raw"] = block.raw
        case TextBlock():
            d["text"] = blocks_to_dict(block.text, json_compatible)
        case LastOfBlock():
            d["lastOf"] = blocks_to_dict(block.lastOf, json_compatible)
        case ArrayBlock():
            d["array"] = blocks_to_dict(block.array, json_compatible)
        case ObjectBlock():
            if isinstance(block.object, dict):
                d["object"] = {
                    k: blocks_to_dict(b, json_compatible)
                    for k, b in block.object.items()
                }
            else:
                d["object"] = blocks_to_dict(block.object, json_compatible)
        case MessageBlock():
            d["content"] = blocks_to_dict(block.content, json_compatible)
        case ReadBlock():
            d["read"] = block.read
            d["message"] = block.message
            d["multiline"] = block.multiline
        case IncludeBlock():
            d["include"] = block.include
            if block.trace:
                d["trace"] = blocks_to_dict(block.trace, json_compatible)
        case IfBlock():
            d["if"] = block.condition
            d["then"] = blocks_to_dict(block.then, json_compatible)
            if block.elses is not None:
                d["else"] = blocks_to_dict(block.elses, json_compatible)
            if block.if_result is not None:
                d["if_result"] = block.if_result
        case RepeatBlock():
            d["repeat"] = blocks_to_dict(block.repeat, json_compatible)
            d["num_iterations"] = block.num_iterations
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [
                    blocks_to_dict(blocks, json_compatible) for blocks in block.trace
                ]
        case RepeatUntilBlock():
            d["repeat"] = blocks_to_dict(block.repeat, json_compatible)
            d["until"] = block.until
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [
                    blocks_to_dict(blocks, json_compatible) for blocks in block.trace
                ]
        case ForBlock():
            d["for"] = block.fors
            d["repeat"] = blocks_to_dict(block.repeat, json_compatible)
            d["join"] = join_to_dict(block.join)
            if block.trace is not None:
                d["trace"] = [
                    blocks_to_dict(blocks, json_compatible) for blocks in block.trace
                ]
        case FunctionBlock():
            d["function"] = block.function
            d["return"] = blocks_to_dict(block.returns, json_compatible)
            # if block.scope is not None:
            #     d["scope"] = scope_to_dict(block.scope, json_compatible)
        case CallBlock():
            d["call"] = block.call
            d["args"] = block.args
            if block.trace is not None:
                d["trace"] = blocks_to_dict(
                    block.trace, json_compatible
                )  # pyright: ignore
        case EmptyBlock():
            pass
        case ErrorBlock():
            d["program"] = blocks_to_dict(block.program, json_compatible)
            d["msg"] = block.msg
    if block.assign is not None:
        d["def"] = block.assign
    if set(block.contribute) != {ContributeTarget.RESULT, ContributeTarget.CONTEXT}:
        d["contribute"] = block.contribute
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
        d["fallback"] = blocks_to_dict(block.fallback, json_compatible)
    return d


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


def blocks_to_dict(
    blocks: BlocksType, json_compatible: bool
) -> DumpedBlockType | list[DumpedBlockType]:
    result: DumpedBlockType | list[DumpedBlockType]
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        result = [block_to_dict(block, json_compatible) for block in blocks]
    else:
        result = block_to_dict(blocks, json_compatible)
    return result


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
            p["pdl"] = blocks_to_dict(parser.pdl, False)
        case _:
            assert False
    return p


def location_to_dict(location: LocationType) -> dict[str, Any]:
    return {"path": location.path, "file": location.file, "table": location.table}


# def scope_to_dict(scope: ScopeType) -> dict[str, Any]:
#     d = {}
#     for x, v in scope.items():
#         if isinstance(v, Block):
#             d[x] = block_to_dict(v)  # type: ignore
#         else:
#             d[x] = v
#     return d
