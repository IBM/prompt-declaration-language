import pathlib

from pdl.pdl_ast_utils import MappedFunctions, iter_block_children, map_block_children
from pdl.pdl_parser import PDLParseError, parse_file


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


def test_ast_iterators() -> None:
    for yaml_file_name in pathlib.Path(".").glob("**/*.pdl"):
        try:
            ast, _ = parse_file(yaml_file_name)
            iter_cpt = IterCounter()
            iter_cpt.count(ast.root)
            map_cpt = MapCounter()
            map_cpt.count(ast.root)
            assert iter_cpt.cpt == map_cpt.cpt, yaml_file_name
        except PDLParseError:
            pass
