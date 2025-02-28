import pathlib

from pdl.pdl_ast import BlockType, IncludeBlock
from pdl.pdl_ast_utils import iter_block_children
from pdl.pdl_dumper import dump_yaml, program_to_dict
from pdl.pdl_parser import PDLParseError, parse_file, parse_str


def has_include(block: BlockType) -> bool:
    if isinstance(block, IncludeBlock):
        return True
    b = False

    def f(x):
        nonlocal b
        if has_include(x):
            b = True

    iter_block_children(f, block)
    return b


def test_dump() -> None:
    for yaml_file_name in pathlib.Path(".").glob("**/*.pdl"):
        try:
            ast1, _ = parse_file(yaml_file_name)
            if has_include(ast1.root):
                continue
            d = program_to_dict(ast1)
            s = dump_yaml(d)
            ast2, _ = parse_str(s)
            json1 = ast1.model_dump_json()
            json2 = ast2.model_dump_json()
            assert json1 == json2, f"{yaml_file_name}:\n{s}"
        except PDLParseError:
            pass
        except Exception as exc:
            assert False, f"{yaml_file_name}: {repr(exc)}"
