import pathlib
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from pdl.pdl_ast import BlockType, IncludeBlock
from pdl.pdl_ast_utils import iter_block_children
from pdl.pdl_dumper import dump_program_exclude_internals, dump_yaml, program_to_dict
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


def _check_dump(yaml_file_name: pathlib.Path) -> None:
    try:
        ast1, _ = parse_file(yaml_file_name)
        if has_include(ast1.root):
            return
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


def test_dump() -> None:
    with ThreadPoolExecutor() as executor:
        # Consume the iterator so any exception raised in a worker propagates.
        for _ in executor.map(_check_dump, pathlib.Path(".").glob("**/*.pdl")):
            pass


def _check_dump_exclude_internals(
    yaml_file_name: pathlib.Path, known_internals: set[str]
) -> None:
    try:
        ast1, _ = parse_file(yaml_file_name)
        if has_include(ast1.root):
            return
        d = program_to_dict(ast1)
        s = dump_yaml(d)
        assert all(
            field in s for field in known_internals
        ), f"Internal fields not found in dump: {s}"

        ast2, _ = parse_file(yaml_file_name)
        s = dump_program_exclude_internals(ast2)
        assert all(
            field not in s for field in known_internals
        ), "Internal fields found in dump"
    except PDLParseError:
        pass
    except Exception as exc:
        assert False, f"{yaml_file_name}: {repr(exc)}"


def test_dump_exclude_internals() -> None:
    """
    In some cases e.g. optimizer, we want to exclude internal fields such as `pdl__id` from the dump.
    This test ensures that the dump does not contain internal fields.
    """

    known_internals = {
        "pdl__id",
        "pdl__is_leaf",
    }

    check = partial(_check_dump_exclude_internals, known_internals=known_internals)
    with ThreadPoolExecutor() as executor:
        # Consume the iterator so any exception raised in a worker propagates.
        for _ in executor.map(check, pathlib.Path(".").glob("**/*.pdl")):
            pass
