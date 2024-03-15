import pathlib

import pydantic
import yaml

from pdl.pdl.pdl_ast import Program  # pyright: ignore

EXPECTED_INVALID = [
    pathlib.Path(".pre-commit-config.yaml"),
    pathlib.Path("examples") / "tutorial" / "grouping_definitions.yaml",
    pathlib.Path("examples") / "tutorial" / "muting_block_output.yaml",
]


def test_valid_programs():
    actual_invalid: set[str] = set()
    for yaml_file_name in pathlib.Path(".").glob("**/*.yaml"):
        with open(yaml_file_name, "r", encoding="utf-8") as pdl_file:
            try:
                data = yaml.safe_load(pdl_file)
                _ = Program.model_validate(data)
            except pydantic.ValidationError:
                actual_invalid |= {str(yaml_file_name)}
    expected_invalid = set(str(p) for p in EXPECTED_INVALID)
    unexpected_invalid = sorted(list(actual_invalid - expected_invalid))
    assert len(unexpected_invalid) == 0, unexpected_invalid
    unexpected_valid = sorted(list(expected_invalid - actual_invalid))
    assert len(unexpected_valid) == 0, unexpected_valid
