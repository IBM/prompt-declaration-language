from typing import Callable, Sequence

from .pdl_ast import (
    ApiBlock,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsCondition,
    DataBlock,
    DocumentBlock,
    DocumentType,
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
                iter_document(f, block.document)
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
        case DataBlock():
            pass
        case DocumentBlock():
            iter_document(f, block.document)
        case IfBlock():
            iter_condition(f, block.condition)
            iter_document(f, block.then)
            if block.elses is not None:
                iter_document(f, block.elses)
        case RepeatBlock():
            iter_document(f, block.repeat)
        case RepeatUntilBlock():
            iter_document(f, block.repeat)
            iter_condition(f, block.until)
        case ErrorBlock():
            iter_document(f, block.document)
        case ReadBlock():
            pass
        case _:
            assert (
                False
            ), f"Internal error (missing case iter_block_children({type(block)}))"


def iter_document(f: Callable[[BlockType], None], document: DocumentType) -> None:
    if not isinstance(document, str) and isinstance(document, Sequence):
        for block in document:
            f(block)
    else:
        f(document)


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
