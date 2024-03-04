from typing import Callable

from .pdl_ast import (
    ApiBlock,
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsCondition,
    EndsWithCondition,
    ErrorBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    InputFileBlock,
    InputStdinBlock,
    ModelBlock,
    PromptsType,
    PromptType,
    RepeatsBlock,
    RepeatsUntilBlock,
    SequenceBlock,
    ValueBlock,
)


def iter_block_children(f: Callable[[BlockType], None], block: BlockType) -> None:
    match block:
        case FunctionBlock():
            if block.body is not None:
                f(block.body)
        case CallBlock():
            pass
        case ModelBlock():
            if block.input is not None:
                iter_prompt(f, block.input)
        case CodeBlock():
            iter_prompts(f, block.code)
        case ApiBlock():
            iter_prompt(f, block.input)
        case GetBlock():
            pass
        case ValueBlock():
            pass
        case SequenceBlock():
            iter_prompts(f, block.prompts)
        case IfBlock():
            iter_condition(f, block.condition)
            iter_prompts(f, block.prompts)
        case RepeatsBlock():
            iter_prompts(f, block.prompts)
        case RepeatsUntilBlock():
            iter_prompts(f, block.prompts)
            iter_condition(f, block.repeats_until)
        case ErrorBlock():
            f(block.block)
        case InputFileBlock():
            pass
        case InputStdinBlock():
            pass
        case _:
            assert (
                False
            ), f"Internal error (missing case iter_block_children({type(block)}))"


def iter_prompt(f: Callable[[BlockType], None], prompt: PromptType) -> None:
    if isinstance(prompt, str):
        pass
    elif isinstance(prompt, Block):
        f(prompt)
    else:
        assert False


def iter_prompts(f: Callable[[BlockType], None], prompts: PromptsType) -> None:
    for p in prompts:
        iter_prompt(f, p)


def iter_condition(f: Callable[[BlockType], None], cond: ConditionType) -> None:
    match cond:
        case cond if isinstance(cond, str):
            pass
        case EndsWithCondition():
            iter_prompt(f, cond.ends_with.arg0)
        case ContainsCondition():
            iter_prompt(f, cond.contains.arg0)
        case _:
            assert False, f"Internal error (missing case iter_condition({type(cond)}))"
