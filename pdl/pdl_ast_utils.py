from typing import Callable, Sequence

from .pdl_ast import (
    ApiBlock,
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsCondition,
    DocumentType,
    EndsWithCondition,
    ErrorBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    InputFileBlock,
    InputStdinBlock,
    ModelBlock,
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
                iter_document(f, block.input)
        case CodeBlock():
            iter_document(f, block.code)
        case ApiBlock():
            iter_document(f, block.input)
        case GetBlock():
            pass
        case ValueBlock():
            pass
        case SequenceBlock():
            iter_document(f, block.document)
        case IfBlock():
            iter_condition(f, block.condition)
            iter_document(f, block.document)
        case RepeatsBlock():
            iter_document(f, block.document)
        case RepeatsUntilBlock():
            iter_document(f, block.document)
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


def iter_document(f: Callable[[BlockType], None], document: DocumentType) -> None:
    if isinstance(document, str):
        pass
    elif isinstance(document, Block):
        f(document)
    elif isinstance(document, Sequence):
        for d in document:
            iter_document(f, d)
    else:
        assert (
            False
        ), f"Internal error (iter_document): unexpected document type {type(document)}"


def iter_condition(f: Callable[[BlockType], None], cond: ConditionType) -> None:
    match cond:
        case cond if isinstance(cond, str):
            pass
        case EndsWithCondition():
            iter_document(f, cond.ends_with.arg0)
        case ContainsCondition():
            iter_document(f, cond.contains.arg0)
        case _:
            assert False, f"Internal error (missing case iter_condition({type(cond)}))"
