from typing import Callable, Sequence

from .pdl_ast import (
    ApiBlock,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsCondition,
    DataBlock,
    DocumentBlock,
    EndsWithCondition,
    ErrorBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    ModelBlock,
    ReadBlock,
    RepeatBlock,
    RepeatUntilBlock,
)


def iter_block_children(f: Callable[[BlockType], None], block: BlockType) -> None:
    match block:
        case s if isinstance(s, str):
            pass
        case FunctionBlock():
            if block.document is not None:
                iter_blocks(f, block.document)
        case CallBlock():
            pass
        case ModelBlock():
            if block.input is not None:
                iter_blocks(f, block.input)
        case CodeBlock():
            iter_blocks(f, block.code)
        case ApiBlock():
            iter_blocks(f, block.input)
        case GetBlock():
            pass
        case DataBlock():
            pass
        case DocumentBlock():
            iter_blocks(f, block.document)
        case IfBlock():
            iter_condition(f, block.condition)
            iter_blocks(f, block.then)
            if block.elses is not None:
                iter_blocks(f, block.elses)
        case RepeatBlock():
            iter_blocks(f, block.repeat)
        case RepeatUntilBlock():
            iter_blocks(f, block.repeat)
            iter_condition(f, block.until)
        case ErrorBlock():
            iter_blocks(f, block.program)
        case ReadBlock():
            pass
        case _:
            assert (
                False
            ), f"Internal error (missing case iter_block_children({type(block)}))"


def iter_blocks(f: Callable[[BlockType], None], blocks: BlocksType) -> None:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        for block in blocks:
            f(block)
    else:
        f(blocks)


def iter_condition(f: Callable[[BlockType], None], cond: ConditionType) -> None:
    match cond:
        case cond if isinstance(cond, str):
            pass
        case EndsWithCondition():
            iter_blocks(f, cond.ends_with.arg0)
        case ContainsCondition():
            iter_blocks(f, cond.contains.arg0)
        case _:
            assert False, f"Internal error (missing case iter_condition({type(cond)}))"
