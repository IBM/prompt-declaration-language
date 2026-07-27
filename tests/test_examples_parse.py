import pathlib
from concurrent.futures import ThreadPoolExecutor

from pytest import CaptureFixture

from pdl.pdl_parser import PDLParseError, parse_file

EXPECTED_INVALID = [
    pathlib.Path("tests") / "data" / "line" / "hello.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello1.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello4.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello7.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello8.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello10.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello11.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello31.pdl",
]


def _parse_program(yaml_file_name: pathlib.Path) -> str | None:
    """Parse a program, returning its name if it is invalid, None otherwise."""
    try:
        _ = parse_file(yaml_file_name)
        return None
    except PDLParseError:
        return str(yaml_file_name)


def test_valid_programs(capsys: CaptureFixture[str]) -> None:
    with ThreadPoolExecutor() as executor:
        results = executor.map(_parse_program, pathlib.Path(".").glob("**/*.pdl"))
        actual_invalid: set[str] = {name for name in results if name is not None}
    # stderr is captured process-wide, so warnings cannot be attributed to
    # individual files when parsing runs in parallel; check the aggregate.
    captured = capsys.readouterr()
    with_warnings = captured.err
    expected_invalid = set(str(p) for p in EXPECTED_INVALID)
    unexpected_invalid = sorted(list(actual_invalid - expected_invalid))
    assert len(unexpected_invalid) == 0, unexpected_invalid
    unexpected_valid = sorted(list(expected_invalid - actual_invalid))
    assert len(unexpected_valid) == 0, unexpected_valid
    assert len(with_warnings) == 0, with_warnings
