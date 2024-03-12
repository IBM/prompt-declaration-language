import json
from typing import Any, Sequence

import yaml

from . import pdl_ast
from .pdl_ast import (
    ApiBlock,
    Block,
    CallBlock,
    CodeBlock,
    ConditionExpr,
    DataBlock,
    DocumentType,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    InputBlock,
    ModelBlock,
    RepeatsBlock,
    RepeatsUntilBlock,
    ScopeType,
    SequenceBlock,
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


def program_to_dict(prog: pdl_ast.Program) -> dict[str, Any]:
    return block_to_dict(prog.root)


def block_to_dict(block: pdl_ast.BlockType) -> dict[str, Any]:
    d: dict[str, Any] = {}
    if block.description is not None:
        d["description"] = block.description
    if block.spec is not None:
        d["spec"] = block.spec
    match block:
        case ModelBlock():
            d["model"] = block.model
            if block.input is not None:
                d["input"] = document_to_dict(block.input)
            if block.prompt_id is not None:
                d["prompt_id"] = block.prompt_id
            if block.parameters is not None:
                d["parameters"] = block.parameters.model_dump_json()
            if block.moderations is not None:
                d["moderations"] = block.moderations
            if block.data is True:
                d["data"] = block.data
            if block.constraints is not None:
                d["constraints"] = block.constraints
        case CodeBlock():
            d["lan"] = block.lan
            d["code"] = document_to_dict(block.code)
        case GetBlock():
            d["get"] = block.get
        case DataBlock():
            d["data"] = block.data
        case ApiBlock():
            d["api"] = block.api
            d["url"] = block.url
            if block.input is not None:
                d["input"] = document_to_dict(block.input)
        case SequenceBlock():
            d["document"] = document_to_dict(block.document)
        case InputBlock():
            d["read"] = block.read
            d["message"] = block.message
            d["multiline"] = block.multiline
            d["parser"] = block.parser
        case IncludeBlock():
            d["include"] = block.include
        case IfBlock():
            d["condition"] = condition_to_dict(block.condition)
            d["then"] = document_to_dict(block.then)
            if block.elses is not None:
                d["else"] = document_to_dict(block.elses)
        case RepeatsBlock():
            d["repeat"] = document_to_dict(block.repeat)
            d["num_iterations"] = block.num_iterations
            d["trace"] = [document_to_dict(document) for document in block.trace]
        case RepeatsUntilBlock():
            d["repeat"] = document_to_dict(block.repeat)
            d["until"] = condition_to_dict(block.until)
            d["trace"] = [document_to_dict(document) for document in block.trace]
        case FunctionBlock():
            d["function"] = block.function
            d["document"] = document_to_dict(block.document)
            # if block.scope is not None:
            #     d["scope"] = scope_to_dict(block.scope)
        case CallBlock():
            d["call"] = block.call
            d["args"] = block.args
    if block.assign is not None:
        d["def"] = block.assign
    if block.show_result is False:
        d["show_result"] = block.show_result
    if block.result is not None:
        d["result"] = block.result
    return d


def document_to_dict(
    document: DocumentType,
) -> str | dict[str, Any] | list[str | dict[str, Any]]:
    result: str | dict[str, Any] | list[str | dict[str, Any]]
    if isinstance(document, str):
        result = document
    elif isinstance(document, Block):
        result = block_to_dict(document)
    elif isinstance(document, Sequence):
        result = [document_to_dict(doc) for doc in document]  # type: ignore
    else:
        assert False
    return result


def condition_to_dict(cond: pdl_ast.ConditionType) -> str | dict[str, Any]:
    result: str | dict[str, Any]
    if isinstance(cond, str):
        result = cond
    elif isinstance(cond, ConditionExpr):
        result = cond.model_dump()
    else:
        assert False
    return result


def scope_to_dict(scope: ScopeType) -> dict[str, Any]:
    d = {}
    for x, v in scope.items():
        if isinstance(v, Block):
            d[x] = block_to_dict(v)
        else:
            d[x] = v
    return d
