import json
from typing import Any, Sequence

import yaml

from . import pdl_ast
from .pdl_ast import (
    ApiBlock,
    BamModelBlock,
    BlocksType,
    CallBlock,
    CodeBlock,
    DataBlock,
    DocumentBlock,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    LocationType,
    OpenAIModelBlock,
    ParserType,
    PdlParser,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    WatsonxModelBlock,
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


def program_to_dict(prog: pdl_ast.Program) -> str | dict[str, Any]:
    return block_to_dict(prog.root)


def block_to_dict(block: pdl_ast.BlockType) -> str | dict[str, Any]:
    if isinstance(block, str):
        return block
    d: dict[str, Any] = {}
    d["kind"] = block.kind
    if block.description is not None:
        d["description"] = block.description
    if block.spec is not None:
        d["spec"] = block.spec
    if block.defs is not None:
        d["defs"] = {x: blocks_to_dict(b) for x, b in block.defs.items()}
    match block:
        case BamModelBlock():
            d["platform"] = block.platform
            d["model"] = block.model
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input)
            if block.prompt_id is not None:
                d["prompt_id"] = block.prompt_id
            if block.parameters is not None:
                d["parameters"] = block.parameters.model_dump()
            if block.moderations is not None:
                d["moderations"] = block.moderations
            if block.data is True:
                d["data"] = block.data
            if block.constraints is not None:
                d["constraints"] = block.constraints
        case WatsonxModelBlock():
            d["platform"] = block.platform
            d["model"] = block.model
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input)
            if block.params is not None:
                d["params"] = block.params
            if block.guardrails is not None:
                d["guardrails"] = block.guardrails
            if block.guardrails_hap_params is not None:
                d["guardrails_hap_params"] = block.guardrails_hap_params
        case OpenAIModelBlock():
            d["platform"] = block.platform
            d["model"] = block.model
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input)
            if block.params is not None:
                d["params"] = block.params
        case CodeBlock():
            d["lan"] = block.lan
            d["code"] = blocks_to_dict(block.code)
        case GetBlock():
            d["get"] = block.get
        case DataBlock():
            d["data"] = block.data
        case ApiBlock():
            d["api"] = block.api
            d["url"] = block.url
            if block.input is not None:
                d["input"] = blocks_to_dict(block.input)
        case DocumentBlock():
            d["document"] = blocks_to_dict(block.document)
        case ReadBlock():
            d["read"] = block.read
            d["message"] = block.message
            d["multiline"] = block.multiline
        case IncludeBlock():
            d["include"] = block.include
        case IfBlock():
            d["condition"] = block.condition
            d["then"] = blocks_to_dict(block.then)
            if block.elses is not None:
                d["else"] = blocks_to_dict(block.elses)
        case RepeatBlock():
            d["repeat"] = blocks_to_dict(block.repeat)
            d["num_iterations"] = block.num_iterations
            if block.trace is not None:
                d["trace"] = [blocks_to_dict(blocks) for blocks in block.trace]
        case RepeatUntilBlock():
            d["repeat"] = blocks_to_dict(block.repeat)
            d["until"] = block.until
            if block.trace is not None:
                d["trace"] = [blocks_to_dict(blocks) for blocks in block.trace]
        case ForBlock():
            d["for"] = block.fors
            d["repeat"] = blocks_to_dict(block.repeat)
            if block.trace is not None:
                d["trace"] = [blocks_to_dict(blocks) for blocks in block.trace]
        case FunctionBlock():
            d["function"] = block.function
            d["return"] = blocks_to_dict(block.returns)
            # if block.scope is not None:
            #     d["scope"] = scope_to_dict(block.scope)
        case CallBlock():
            d["call"] = block.call
            d["args"] = block.args
            if block.trace is not None:
                d["trace"] = blocks_to_dict(block.trace)
        case ErrorBlock():
            d["program"] = blocks_to_dict(block.program)
    if block.assign is not None:
        d["def"] = block.assign
    if block.show_result is False:
        d["show_result"] = block.show_result
    if block.result is not None:
        d["result"] = block.result
    if block.parser is not None:
        d["parser"] = parser_to_dict(block.parser)
    if block.location is not None:
        d["location"] = location_to_dict(block.location)
    if block.has_error:
        d["has_error"] = block.has_error
    if block.fallback is not None:
        d["fallback"] = blocks_to_dict(block.fallback)
    return d


def blocks_to_dict(
    blocks: BlocksType,
) -> str | dict[str, Any] | list[str | dict[str, Any]]:
    result: str | dict[str, Any] | list[str | dict[str, Any]]
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        result = [block_to_dict(block) for block in blocks]
    else:
        result = block_to_dict(blocks)
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
            p["pdl"] = blocks_to_dict(parser.pdl)
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
