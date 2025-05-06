from typing import Callable, Sequence

from .pdl_ast import (
    ArrayBlock,
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ExpressionType,
    FunctionBlock,
    GetBlock,
    GraniteioModelBlock,
    IfBlock,
    ImportBlock,
    IncludeBlock,
    LastOfBlock,
    LitellmModelBlock,
    MatchBlock,
    MatchCase,
    MessageBlock,
    ModelBlock,
    ObjectBlock,
    PdlParser,
    ReadBlock,
    RegexParser,
    RepeatBlock,
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
            if block.pdl__trace is not None:
                f(block.pdl__trace)
        case ModelBlock():
            f(block.input)
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
            if block.else_ is not None:
                f(block.else_)
        case MatchBlock():
            for match_case in block.with_:
                f(match_case.then)
        case RepeatBlock():
            f(block.repeat)
            if block.pdl__trace is not None:
                for trace in block.pdl__trace:
                    f(trace)
        case ErrorBlock():
            f(block.program)
        case ReadBlock():
            pass
        case IncludeBlock():
            if block.pdl__trace is not None:
                f(block.pdl__trace)
        case ImportBlock():
            if block.pdl__trace is not None:
                f(block.pdl__trace)
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
            block.args = f.f_expr(block.args)
            if block.pdl__trace is not None:
                block.pdl__trace = f.f_block(block.pdl__trace)
        case LitellmModelBlock():
            block.model = f.f_expr(block.model)
            block.input = f.f_block(block.input)
        case GraniteioModelBlock():
            block.model = f.f_expr(block.model)
            block.input = f.f_block(block.input)
            if block.parameters is not None:
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
            if block.else_ is not None:
                block.else_ = f.f_block(block.else_)
        case MatchBlock():
            block.match_ = f.f_expr(block.match_)
            block.with_ = [map_match_case(f, c) for c in block.with_]
        case RepeatBlock():
            if block.for_ is not None:
                block.for_ = {x: f.f_expr(blocks) for x, blocks in block.for_.items()}
            block.while_ = f.f_expr(block.while_)
            block.repeat = f.f_block(block.repeat)
            block.until = f.f_expr(block.until)
            if block.pdl__trace is not None:
                block.pdl__trace = [f.f_block(trace) for trace in block.pdl__trace]
        case ErrorBlock():
            block.program = f.f_block(block.program)
        case ReadBlock():
            block.read = f.f_expr(block.read)
        case IncludeBlock():
            if block.pdl__trace is not None:
                block.pdl__trace = f.f_block(block.pdl__trace)
        case ImportBlock():
            if block.pdl__trace is not None:
                block.pdl__trace = f.f_block(block.pdl__trace)
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


def map_match_case(f: MappedFunctions, match_case: MatchCase) -> MatchCase:
    if_ = f.f_expr(match_case.if_)
    then = f.f_block(match_case.then)
    return match_case.model_copy(update={"if_": if_, "then": then})
