import json
from typing import Any

import yaml

from . import pdl_ast
from .pdl_ast import (
    ApiBlock,
    Block,
    CallBlock,
    CodeBlock,
    ConditionExpr,
    FunctionBlock,
    GetBlock,
    IfBlock,
    InputBlock,
    ModelBlock,
    RepeatsBlock,
    RepeatsUntilBlock,
    SequenceBlock,
    ValueBlock,
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
    match block:
        case ModelBlock():
            d["model"] = block.model
            if block.input is not None:
                d["input"] = prompt_to_dict(block.input)
            if block.decoding is not None:
                d["decoding"] = block.decoding
            if block.stop_sequences is not None:
                d["stop_sequences"] = block.stop_sequences
            if block.include_stop_sequences is True:
                d["include_stop_sequences"] = block.include_stop_sequences
            if block.params is not None:
                d["params"] = block.params
        case CodeBlock():
            d["lan"] = block.lan
            d["code"] = prompts_to_dict(block.code)
        case GetBlock():
            d["get"] = block.get
        case ValueBlock():
            d["value"] = block.value
        case ApiBlock():
            d["api"] = block.api
            d["url"] = block.url
            d["input"] = prompt_to_dict(block.input)
        case SequenceBlock():
            d["prompts"] = prompts_to_dict(block.prompts)
        case InputBlock():
            d["filename"] = block.filename
            d["stdin"] = block.stdin
            d["message"] = block.message
            d["multiline"] = block.multiline
            d["json_content"] = block.json_content
        case IfBlock():
            d["prompts"] = prompts_to_dict(block.prompts)
            d["condition"] = condition_to_dict(block.condition)
        case RepeatsBlock():
            d["prompts"] = prompts_to_dict(block.prompts)
            d["repeats"] = block.repeats
            d["trace"] = [prompts_to_dict(prompts) for prompts in block.trace]
        case RepeatsUntilBlock():
            d["prompts"] = prompts_to_dict(block.prompts)
            d["repeats_until"] = condition_to_dict(block.repeats_until)
            d["trace"] = [prompts_to_dict(prompts) for prompts in block.trace]
        case FunctionBlock():
            d["function"] = block.function
            d["params"] = block.params
            if block.body is not None:
                body = block_to_dict(block.body)
                for k, v in body.items():
                    d[k] = v
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


def prompts_to_dict(
    prompts: pdl_ast.PromptsType | None,
) -> list[str | dict[str, Any]] | None:
    if prompts is None:
        return None
    return [prompt_to_dict(p) for p in prompts]


def prompt_to_dict(prompt: pdl_ast.PromptType) -> str | dict[str, Any]:
    result: str | dict[str, Any]
    if isinstance(prompt, str):
        result = prompt
    elif isinstance(prompt, Block):
        result = block_to_dict(prompt)
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
