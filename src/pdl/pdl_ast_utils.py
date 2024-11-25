from typing import Callable, Sequence

from .pdl_ast import (
    ArrayBlock,
    BamModelBlock,
    BamTextGenerationParameters,
    Block,
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


def iter_block_children(f: Callable[[BlockType], None], block: BlockType) -> None:
    if not isinstance(block, Block):
        return
    for blocks in block.defs.values():
        f(blocks)
    match block:
        case FunctionBlock():
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
            if not isinstance(block.text, str) and isinstance(block.text, Sequence):
                # is a list of blocks
                for b in block.text:
                    f(b)
            else:
                f(block.text)
        case LastOfBlock():
            for b in block.lastOf:
                f(b)
        case ArrayBlock():
            for b in block.array:
                f(b)
        case ObjectBlock():
            if isinstance(block.object, dict):
                for b in block.object.values():
                    f(b)
            else:
                for b in block.object:
                    f(b)
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
    defs = {x: f.f_block(b) for x, b in block.defs.items()}
    block = block.model_copy(update={"defs": defs})
    match block:
        case FunctionBlock():
            block.returns = f.f_block(block.returns)
        case CallBlock():
            block.call = f.f_expr(block.call)
            block.args = {x: f.f_expr(e) for x, e in block.args.items()}
            if block.trace is not None:
                block.trace = f.f_block(block.trace)
        case BamModelBlock() | LitellmModelBlock():
            block.model = f.f_expr(block.model)
            if block.input is not None:
                block.input = f.f_block(block.input)
            if block.trace is not None:
                block.trace = f.f_block(block.trace)
            if isinstance(block.parameters, BamTextGenerationParameters):
                block.parameters = f.f_expr(block.parameters.model_dump())
            elif isinstance(block.parameters, dict):
                block.parameters = f.f_expr(block.parameters)
        case CodeBlock():
            block.code = f.f_block(block.code)
        case GetBlock():
            pass
        case DataBlock():
            block.data = f.f_expr(block.data)
        case TextBlock():
            if not isinstance(block.text, str) and isinstance(block.text, Sequence):
                # is a list of blocks
                block.text = [f.f_block(b) for b in block.text]
            else:
                block.text = f.f_block(block.text)
        case LastOfBlock():
            block.lastOf = [f.f_block(b) for b in block.lastOf]
        case ArrayBlock():
            block.array = [f.f_block(b) for b in block.array]
        case ObjectBlock():
            if isinstance(block.object, dict):
                block.object = {x: f.f_block(b) for x, b in block.object.items()}
            else:
                block.object = [f.f_block(b) for b in block.object]
        case MessageBlock():
            block.content = f.f_block(block.content)
        case IfBlock():
            block.condition = f.f_expr(block.condition)
            block.then = f.f_block(block.then)
            if block.elses is not None:
                block.elses = f.f_block(block.elses)
        case RepeatBlock():
            block.repeat = f.f_block(block.repeat)
            if block.trace is not None:
                block.trace = [f.f_block(trace) for trace in block.trace]
        case RepeatUntilBlock():
            block.until = f.f_expr(block.until)
            block.repeat = f.f_block(block.repeat)
            if block.trace is not None:
                block.trace = [f.f_block(trace) for trace in block.trace]
        case ForBlock():
            block.fors = {x: f.f_expr(blocks) for x, blocks in block.fors.items()}
            block.repeat = f.f_block(block.repeat)
            if block.trace is not None:
                block.trace = [f.f_block(trace) for trace in block.trace]
        case ErrorBlock():
            block.program = f.f_block(block.program)
        case ReadBlock():
            block.read = f.f_expr(block.read)
        case IncludeBlock():
            if block.trace is not None:
                block.trace = f.f_block(block.trace)
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
            block.parser.pdl = f.f_block(block.parser.pdl)
    if block.fallback is not None:
        block.fallback = f.f_block(block.fallback)
    return block
