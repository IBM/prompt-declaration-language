from typing import Callable, Sequence

from .pdl_ast import (
    ApiBlock,
    ArrayBlock,
    Block,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    DocumentBlock,
    EmptyBlock,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    ModelBlock,
    PdlParser,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    SequenceBlock,
)


def iter_block_children(f: Callable[[BlockType], None], block: BlockType) -> None:
    if not isinstance(block, Block):
        return
    for blocks in block.defs.values():
        iter_blocks(f, blocks)
    match block:
        case FunctionBlock():
            if block.returns is not None:
                iter_blocks(f, block.returns)
        case CallBlock():
            if block.trace is not None:
                iter_blocks(f, block.trace)
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
        case SequenceBlock():
            iter_blocks(f, block.sequence)
        case ArrayBlock():
            iter_blocks(f, block.array)
        case IfBlock():
            iter_blocks(f, block.then)
            if block.elses is not None:
                iter_blocks(f, block.elses)
        case RepeatBlock():
            iter_blocks(f, block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    iter_blocks(f, trace)
        case RepeatUntilBlock():
            iter_blocks(f, block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    iter_blocks(f, trace)
        case ForBlock():
            iter_blocks(f, block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    iter_blocks(f, trace)
        case ErrorBlock():
            iter_blocks(f, block.program)
        case ReadBlock():
            pass
        case IncludeBlock():
            if block.trace is not None:
                iter_blocks(f, block.trace)
        case EmptyBlock():
            pass
        case _:
            assert (
                False
            ), f"Internal error (missing case iter_block_children({type(block)}))"
    match (block.parser):
        case "json" | "yaml" | RegexParser():
            pass
        case PdlParser():
            iter_blocks(f, block.parser.pdl)
    if block.fallback is not None:
        iter_blocks(f, block.fallback)


def iter_blocks(f: Callable[[BlockType], None], blocks: BlocksType) -> None:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        for block in blocks:
            f(block)
    else:
        f(blocks)
