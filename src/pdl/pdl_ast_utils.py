from typing import Callable, Sequence

from .pdl_ast import (
    ArrayBlock,
    BamModelBlock,
    BamTextGenerationParameters,
    Block,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ExpressionType,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    LastOfBlock,
    LitellmModelBlock,
    MessageBlock,
    ModelBlock,
    ObjectBlock,
    PdlParser,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    TextBlock,
)


def iter_block_children(f: Callable[[BlocksType], None], block: BlockType) -> None:
    if not isinstance(block, Block):
        return
    for blocks in block.defs.values():
        f(blocks)
    match block:
        case FunctionBlock():
            if block.returns is not None:
                f(block.returns)
        case CallBlock():
            if block.trace is not None:
                f(block.trace)
        case ModelBlock():
            if block.input is not None:
                f(block.input)
            if block.trace is not None:
                f(block.trace)
        case CodeBlock():
            f(block.code)
        case GetBlock():
            pass
        case DataBlock():
            pass
        case TextBlock():
            f(block.text)
        case LastOfBlock():
            f(block.lastOf)
        case ArrayBlock():
            f(block.array)
        case ObjectBlock():
            if isinstance(block.object, dict):
                for blocks in block.object.values():
                    f(blocks)
            else:
                f(block.object)
        case MessageBlock():
            f(block.content)
        case IfBlock():
            f(block.then)
            if block.elses is not None:
                f(block.elses)
        case RepeatBlock():
            f(block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    f(trace)
        case RepeatUntilBlock():
            f(block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    f(trace)
        case ForBlock():
            f(block.repeat)
            if block.trace is not None:
                for trace in block.trace:
                    f(trace)
        case ErrorBlock():
            f(block.program)
        case ReadBlock():
            pass
        case IncludeBlock():
            if block.trace is not None:
                f(block.trace)
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
            f(block.parser.pdl)
    if block.fallback is not None:
        f(block.fallback)


class MappedFunctions:
    def f_block(self, block: BlockType) -> BlockType:
        return block

    def f_expr(self, expr: ExpressionType) -> ExpressionType:
        return expr


def map_block_children(f: MappedFunctions, block: BlockType) -> BlockType:
    if not isinstance(block, Block):
        return block
    defs = {x: map_blocks(f, blocks) for x, blocks in block.defs.items()}
    if block.fallback is not None:
        fallback = map_blocks(f, block.fallback)
    else:
        fallback = None
    block = block.model_copy(update={"defs": defs, "fallback": fallback})
    match block:
        case FunctionBlock():
            block.returns = map_blocks(f, block.returns)
        case CallBlock():
            block.call = f.f_expr(block.call)
            block.args = {x: f.f_expr(e) for x, e in block.args.items()}
            if block.trace is not None:
                block.trace = map_blocks(f, block.trace)
        case BamModelBlock() | LitellmModelBlock():
            block.model = f.f_expr(block.model)
            if block.input is not None:
                block.input = map_blocks(f, block.input)
            if block.trace is not None:
                block.trace = f.f_block(block.trace)
            if isinstance(block.parameters, BamTextGenerationParameters):
                block.parameters = f.f_expr(block.parameters.model_dump())
            elif isinstance(block.parameters, dict):
                block.parameters = f.f_expr(block.parameters)
        case CodeBlock():
            block.code = map_blocks(f, block.code)
        case GetBlock():
            pass
        case DataBlock():
            block.data = f.f_expr(block.data)
        case TextBlock():
            block.text = map_blocks(f, block.text)
        case LastOfBlock():
            block.lastOf = map_blocks(f, block.lastOf)
        case ArrayBlock():
            block.array = map_blocks(f, block.array)
        case ObjectBlock():
            if isinstance(block.object, dict):
                block.object = {
                    x: map_blocks(f, blocks) for x, blocks in block.object.items()
                }
            else:
                block.object = [f.f_block(b) for b in block.object]
        case MessageBlock():
            block.content = map_blocks(f, block.content)
        case IfBlock():
            block.condition = f.f_expr(block.condition)
            block.then = map_blocks(f, block.then)
            if block.elses is not None:
                block.elses = map_blocks(f, block.elses)
        case RepeatBlock():
            block.repeat = map_blocks(f, block.repeat)
            if block.trace is not None:
                block.trace = [map_blocks(f, trace) for trace in block.trace]
        case RepeatUntilBlock():
            block.until = f.f_expr(block.until)
            block.repeat = map_blocks(f, block.repeat)
            if block.trace is not None:
                block.trace = [map_blocks(f, trace) for trace in block.trace]
        case ForBlock():
            block.fors = {x: f.f_expr(blocks) for x, blocks in block.fors.items()}
            block.repeat = map_blocks(f, block.repeat)
            if block.trace is not None:
                block.trace = [map_blocks(f, trace) for trace in block.trace]
        case ErrorBlock():
            block.program = map_blocks(f, block.program)
        case ReadBlock():
            block.read = f.f_expr(block.read)
        case IncludeBlock():
            if block.trace is not None:
                block.trace = map_blocks(f, block.trace)
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
            block.parser.pdl = map_blocks(f, block.parser.pdl)
    return block


def map_blocks(f: MappedFunctions, blocks: BlocksType) -> BlocksType:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        # is a list of blocks
        blocks = [f.f_block(block) for block in blocks]
    else:
        blocks = f.f_block(blocks)
    return blocks
