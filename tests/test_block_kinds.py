"""Checks that every kind of block is accounted for everywhere it has to be.

`BlockType` is a discriminated union, and several functions dispatch on the
class of a block with a catch-all case that fails at run time. Adding a block
to `pdl_ast` without updating them all is easy to do and hard to notice, so
these tests enumerate the blocks instead of listing them: a block that is not
in `MINIMAL_BLOCKS` fails `test_block_has_a_minimal_program`, and from there
every other test runs against it.
"""

from typing import Annotated, Any, Callable, NamedTuple, get_args, get_origin

import pytest
import yaml
from pydantic import Discriminator, Tag

from pdl.pdl_ast import (
    AdvancedBlockType,
    BlockKind,
    BlockType,
    ExpressionBlock,
)
from pdl.pdl_ast_utils import MappedFunctions, iter_block_children, map_block_children
from pdl.pdl_dumper import dump_yaml, program_to_dict
from pdl.pdl_parser import parse_str

BLOCK_CLASSES = get_args(AdvancedBlockType)

EXPRESSIONS = [None, True, 1, 1.5, "hello"]

# The smallest program made of a single block of each kind.
MINIMAL_BLOCKS: dict[str, str] = {
    "FunctionBlock": "function: {x: string}\nreturn: hi",
    "CallBlock": "call: ${ f }",
    "LitellmModelBlock": "model: ollama/granite3.3:2b",
    "GraniteioModelBlock": "platform: granite-io\nprocessor: {}",
    "OpenaiModelBlock": "platform: openai\nmodel: gpt-4",
    "PythonCodeBlock": "lang: python\ncode: result = 1",
    "IPythonCodeBlock": "lang: ipython\ncode: result = 1",
    "JinjaCodeBlock": "lang: jinja\ncode: '{{ 1 }}'",
    "PdlCodeBlock": "lang: pdl\ncode: hi",
    "CommandCodeBlock": "lang: command\ncode: echo hi",
    "ArgsBlock": "args: [echo, hi]",
    "GetBlock": "get: x",
    "DataBlock": "data: 1",
    "MessageBlock": "role: user\ncontent: hi",
    "ReadBlock": "read: ./f.txt",
    "FactorBlock": "factor: x",
    "AggregatorBlock": "aggregator: context",
    "ErrorBlock": "msg: boom\nprogram: hi",
    "EmptyBlock": "description: nothing",
    "SequenceBlock": "sequence: [hi]\njoin: {as: text}",
    "TextBlock": "text: [hi]",
    "LastOfBlock": "lastOf: [hi]",
    "ArrayBlock": "array: [hi]",
    "ObjectBlock": "object: {a: hi}",
    "IfBlock": "if: ${ true }\nthen: hi",
    "MatchBlock": "match: ${ x }\nwith: [{case: 1, then: hi}]",
    "RepeatBlock": "repeat: hi\nmaxIterations: 1",
    "MapBlock": 'map: hi\nfor: {x: "${ [1] }"}',
    "IncludeBlock": "include: ./f.pdl",
    "ImportBlock": "import: ./f.pdl",
}

by_name = pytest.mark.parametrize(
    "cls", BLOCK_CLASSES, ids=lambda cls: cls.__name__  # type: ignore[misc]
)


class Dispatcher(NamedTuple):
    """How a discriminated union chooses the class to validate a value against."""

    tag_of: Callable[[Any], Any]
    members: dict[Any, Any]  # tag -> class, or a nested Dispatcher


def dispatcher(annotated: Any) -> Dispatcher:
    """Read a discriminated union back out of its annotation.

    A member that is itself a discriminated union becomes a nested dispatcher,
    so a model or a code block is reached in two steps, first by its kind and
    then by its platform or its language.
    """
    union, *metadata = get_args(annotated)
    tag_of = next(m.discriminator for m in metadata if isinstance(m, Discriminator))
    assert not isinstance(tag_of, str), "blocks are discriminated by a function"
    members: dict[Any, Any] = {}
    for member in get_args(union):
        assert get_origin(member) is Annotated, f"{member} is a member without a tag"
        typ, *member_metadata = get_args(member)
        tag = next(m.tag for m in member_metadata if isinstance(m, Tag))
        nested = getattr(typ, "__value__", None)
        members[tag] = (
            dispatcher(nested)
            if nested is not None and get_origin(nested) is Annotated
            else typ
        )
    return Dispatcher(tag_of, members)


DISPATCH = dispatcher(BlockType.__value__)


def resolve(value: Any) -> Any:
    """The class Pydantic validates `value` against, following nested unions."""
    node: Any = DISPATCH
    while isinstance(node, Dispatcher):
        node = node.members[node.tag_of(value)]
    return node


def all_members(node: Dispatcher) -> list[Any]:
    return [
        typ
        for member in node.members.values()
        for typ in (all_members(member) if isinstance(member, Dispatcher) else [member])
    ]


TAGGED_BLOCKS = [typ for typ in all_members(DISPATCH) if typ is not ExpressionBlock]


@by_name
def test_block_has_a_minimal_program(cls):
    """Every block is exercised by the tests below."""
    assert cls.__name__ in MINIMAL_BLOCKS


def test_union_is_the_expression_and_the_advanced_blocks():
    """`BlockType` is `ExpressionBlock | AdvancedBlockType`.

    It used to be spelled that way. Tagging it means writing its members out
    one by one, so what the two spellings have in common is now a test: a
    block missing from `BlockType` cannot be parsed at all, and one that is
    only in `BlockType` is parsed but reaches nothing else.
    """
    members = all_members(DISPATCH)
    assert set(members) == {ExpressionBlock, *BLOCK_CLASSES}
    assert len(members) == len(BLOCK_CLASSES) + 1, "a block is in the union twice"


def test_expressions_have_their_own_tag():
    """`BlockKind` names the kinds of block that are objects, not the scalars."""
    expression_tags = [
        tag for tag, typ in DISPATCH.members.items() if typ is ExpressionBlock
    ]
    assert len(expression_tags) == 1
    assert expression_tags[0] not in set(BlockKind)


def test_blocks_are_tagged_by_their_kind():
    """The tags of `BlockType` are the values of `BlockKind`."""
    block_tags = set(DISPATCH.members) - {
        t for t, c in DISPATCH.members.items() if c is ExpressionBlock
    }
    assert block_tags == set(BlockKind)


def test_every_block_kind_is_used():
    """`BlockKind` and the blocks it names do not drift apart."""
    assert {cls.model_fields["kind"].default for cls in BLOCK_CLASSES} == set(BlockKind)


def test_kinds_of_several_blocks_are_discriminated_further():
    """A kind shared by several blocks is a union of its own, and vice versa."""
    shared = {
        kind
        for kind in BlockKind
        if len([c for c in BLOCK_CLASSES if c.model_fields["kind"].default == kind]) > 1
    }
    nested = {
        tag for tag, typ in DISPATCH.members.items() if isinstance(typ, Dispatcher)
    }
    assert nested == shared == {BlockKind.MODEL, BlockKind.CODE}


@pytest.mark.parametrize("value", EXPRESSIONS)
def test_expression_is_not_dispatched_as_a_block(value):
    assert resolve(value) is ExpressionBlock


@by_name
def test_block_parses_to_its_own_class(cls):
    """A block written by hand is dispatched on the fields that identify it.

    This is what fails when a block is added to `pdl_ast` without registering
    the field that identifies it in `_BLOCK_KIND_OF_FIELD`.
    """
    program, _ = parse_str(MINIMAL_BLOCKS[cls.__name__])
    # the exact class, not a subclass: `ArgsBlock` is not a `CodeBlock`
    assert type(program.root) is cls  # pylint: disable=unidiomatic-typecheck


@by_name
def test_block_is_dispatched_on_its_kind(cls):
    """A block dumped by `pdl_dumper` carries its kind and is dispatched on it."""
    block = yaml.safe_load(MINIMAL_BLOCKS[cls.__name__])
    block["kind"] = str(cls.model_fields["kind"].default)
    assert resolve(block) is cls


@by_name
def test_parsed_block_is_dispatched_to_its_own_class(cls):
    """An already parsed block is revalidated against the class it came from."""
    program, _ = parse_str(MINIMAL_BLOCKS[cls.__name__])
    assert resolve(program.root) is cls


@by_name
def test_block_is_handled_by_the_ast_visitors(cls):
    """`iter_block_children` and `map_block_children` fail on an unknown block."""
    program, _ = parse_str(MINIMAL_BLOCKS[cls.__name__])
    iter_block_children(lambda _: None, program.root)
    map_block_children(MappedFunctions(), program.root)


@by_name
def test_block_round_trips_through_the_dumper(cls):
    """`block_to_dict` fails on a block whose kind it does not know."""
    program, _ = parse_str(MINIMAL_BLOCKS[cls.__name__])
    dumped = dump_yaml(program_to_dict(program))
    reparsed, _ = parse_str(dumped)
    assert type(reparsed.root) is cls  # pylint: disable=unidiomatic-typecheck
    assert reparsed.model_dump_json() == program.model_dump_json()
