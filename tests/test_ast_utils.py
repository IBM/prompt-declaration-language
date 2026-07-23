import pathlib
import typing
from concurrent.futures import ThreadPoolExecutor

from pdl.pdl_ast import (
    ImportBlock,
    LeafBlock,
    LeafBlockType,
    StructuredBlock,
    StructuredBlockType,
)
from pdl.pdl_ast_utils import MappedFunctions, iter_block_children, map_block_children
from pdl.pdl_parser import PDLParseError, parse_file


def test_leaf_and_structured_block_types() -> None:
    # Every block listed in `LeafBlockType` is a leaf block and every block
    # listed in `StructuredBlockType` is a structured block. Leaf and structured
    # blocks are disjoint.
    for block in typing.get_args(LeafBlockType):
        assert issubclass(block, LeafBlock), block
        assert not issubclass(block, StructuredBlock), block
    for block in typing.get_args(StructuredBlockType):
        assert issubclass(block, StructuredBlock), block
        assert not issubclass(block, LeafBlock), block
    # `import` executes the sub-blocks of the imported file, so it is a
    # structured block.
    assert issubclass(ImportBlock, StructuredBlock)
    assert ImportBlock in typing.get_args(StructuredBlockType)


class Counter:
    def __init__(self):
        self.cpt = 0

    def incr(self, *args):
        self.cpt += 1


class IterCounter:
    def __init__(self):
        self.cpt = 0

    def count(self, ast):
        self.cpt += 1
        iter_block_children(self.count, ast)


class MapCounter:
    def __init__(self):
        self.cpt = 0

    def count(map_self, ast):  # pylint: disable=no-self-argument # type: ignore
        map_self.cpt += 1

        class C(MappedFunctions):
            def f_block(_, block):  # pylint: disable=no-self-argument # type: ignore
                return map_self.count(block)

        _ = map_block_children(C(), ast)
        return ast


def _check_ast_iterators(yaml_file_name: pathlib.Path) -> None:
    try:
        ast, _ = parse_file(yaml_file_name)
        iter_cpt = IterCounter()
        iter_cpt.count(ast.root)
        map_cpt = MapCounter()
        map_cpt.count(ast.root)
        assert iter_cpt.cpt == map_cpt.cpt, yaml_file_name
    except PDLParseError:
        pass


def test_ast_iterators() -> None:
    with ThreadPoolExecutor() as executor:
        # Consume the iterator so any exception raised in a worker propagates.
        for _ in executor.map(_check_ast_iterators, pathlib.Path(".").glob("**/*.pdl")):
            pass
