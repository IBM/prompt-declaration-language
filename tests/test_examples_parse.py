import pathlib

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


def test_valid_programs(capsys: CaptureFixture[str]) -> None:
    actual_invalid: set[str] = set()
    with_warnings: set[str] = set()
    for yaml_file_name in pathlib.Path(".").glob("**/*.pdl"):
        try:
            _ = parse_file(yaml_file_name)
            captured = capsys.readouterr()
            if len(captured.err) > 0:
                with_warnings |= {str(yaml_file_name)}
        except PDLParseError:
            actual_invalid |= {str(yaml_file_name)}
    expected_invalid = set(str(p) for p in EXPECTED_INVALID)
    unexpected_invalid = sorted(list(actual_invalid - expected_invalid))
    assert len(unexpected_invalid) == 0, unexpected_invalid
    unexpected_valid = sorted(list(expected_invalid - actual_invalid))
    assert len(unexpected_valid) == 0, unexpected_valid
    assert len(with_warnings) == 0
