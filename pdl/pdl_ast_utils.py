from typing import Callable, Sequence

from .pdl_ast import (
    ApiBlock,
    Block,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    DocumentBlock,
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
    if isinstance(block, Block):
        for blocks in block.defs.values():
            iter_blocks(f, blocks)
    match block:
        case s if isinstance(s, str):
            pass
        case FunctionBlock():
            if block.returns is not None:
                iter_blocks(f, block.returns)
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
            iter_blocks(f, block.then)
            if block.elses is not None:
                iter_blocks(f, block.elses)
        case RepeatBlock():
            iter_blocks(f, block.repeat)
        case RepeatUntilBlock():
            iter_blocks(f, block.repeat)
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
