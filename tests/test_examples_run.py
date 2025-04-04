import io
import os
import pathlib
import random
from dataclasses import dataclass
from typing import Optional, Tuple

from pytest import CaptureFixture, MonkeyPatch

from pdl import pdl
from pdl.pdl_ast import ScopeType
from pdl.pdl_dumper import block_to_dict
from pdl.pdl_lazy import PdlDict
from pdl.pdl_parser import PDLParseError

# test_examples_run.py runs the examples and compares the results
# to the expected results in tests/results/examples

UPDATE_RESULTS = False
RESULTS_VERSION = 1
OLLAMA_GHACTIONS_RESULTS_ENV_VAR = os.getenv("OLLAMA_GHACTIONS_RESULTS", "")
OLLAMA_GHACTIONS_RESULTS = False
if OLLAMA_GHACTIONS_RESULTS_ENV_VAR.lower().strip() == "true":
    OLLAMA_GHACTIONS_RESULTS = True

TO_SKIP = {
    str(name)
    for name in [
        # Requires dataset dependency
        pathlib.Path("examples") / "cldk" / "cldk-assistant.pdl",
        pathlib.Path("examples") / "gsm8k" / "gsm8.pdl",
        pathlib.Path("examples") / "gsm8k" / "gsm8k-plan.pdl",
        # Requires installation dependencies
        pathlib.Path("examples") / "intrinsics" / "demo-hallucination.pdl",
        pathlib.Path("examples") / "tutorial" / "programs" / "demo-hallucination.pdl",
        # Skip RAG examples
        pathlib.Path("examples") / "rag" / "pdf_index.pdl",
        pathlib.Path("examples") / "rag" / "pdf_query.pdl",
        pathlib.Path("examples")
        / "rag"
        / "rag_library1.pdl",  # (This is glue to Python, it doesn't "run" alone)
        # Skip structure decoding example (Jing doesn't have WATSONX API KEY)
        pathlib.Path("examples") / "tutorial" / "structured_decoding.pdl",
        # OUtput result include trace (and thus timing) for some reason. Investigate why
        pathlib.Path("examples") / "react" / "react_call.pdl",
        pathlib.Path("pdl-live-react") / "demos" / "error.pdl",
        pathlib.Path("pdl-live-react") / "demos" / "demo1.pdl",
        pathlib.Path("pdl-live-react") / "demos" / "demo2.pdl",
        # For now, skip the granite-io examples
        pathlib.Path("examples") / "granite-io" / "granite_io_hallucinations.pdl",
        pathlib.Path("examples") / "granite-io" / "granite_io_openai.pdl",
        pathlib.Path("examples") / "granite-io" / "granite_io_thinking.pdl",
        pathlib.Path("examples") / "granite-io" / "granite_io_transformers.pdl",
    ]
}


@dataclass
class InputsType:
    stdin: Optional[str] = None
    scope: Optional[ScopeType] = None


TESTS_WITH_INPUT: dict[str, InputsType] = {
    str(name): inputs
    for name, inputs in {
        pathlib.Path("examples")
        / "tutorial"
        / "programs"
        / "chatbot.pdl": InputsType(stdin="What is APR?\nyes\n"),
        pathlib.Path("examples")
        / "tutorial"
        / "input_stdin.pdl": InputsType(stdin="Hello\n"),
        pathlib.Path("examples")
        / "tutorial"
        / "input_stdin_multiline.pdl": InputsType(stdin="Hello\nBye\n"),
        pathlib.Path("examples")
        / "input"
        / "input_test1.pdl": InputsType(stdin="Hello\n"),
        pathlib.Path("examples")
        / "input"
        / "input_test2.pdl": InputsType(stdin="Hello\n"),
        pathlib.Path("examples")
        / "chatbot"
        / "chatbot.pdl": InputsType(stdin="What is APR?\nyes\n"),
        pathlib.Path("examples")
        / "demo"
        / "7-chatbot-roles.pdl": InputsType(stdin="What is APR?\nquit\n"),
        pathlib.Path("examples")
        / "tutorial"
        / "free_variables.pdl": InputsType(scope=PdlDict({"something": "ABC"})),
    }.items()
}


EXPECTED_PARSE_ERROR = [
    pathlib.Path("tests") / "data" / "line" / "hello.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello1.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello4.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello7.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello8.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello10.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello11.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello31.pdl",
]

EXPECTED_RUNTIME_ERROR = [
    pathlib.Path("examples") / "callback" / "repair_prompt.pdl",
    pathlib.Path("examples") / "tutorial" / "type_list.pdl",
    pathlib.Path("examples") / "tutorial" / "type_checking.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello12.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello13.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello14.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello15.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello16.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello17.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello18.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello19.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello20.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello21.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello22.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello23.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello24.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello25.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello26.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello27.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello28.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello29.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello3.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello30.pdl",
    pathlib.Path("tests") / "data" / "line" / "hello9.pdl",
]

# ACTUAL_NO_ERROR indicates there was no error when running pdl.exec_file
ACTUAL_NO_ERROR = 0
# ACTUAL_NO_ERROR indicates there was PdlParserError when running pdl.exec_file
ACTUAL_PARSE_ERROR_CODE = 1
# ACTUAL_RUNTIME_ERROR_CODE indicates there was runtime error when running pdl.exec_file
ACTUAL_RUNTIME_ERROR_CODE = 2

def run_single_file(pdl_file_name: str, monkeypatch: MonkeyPatch) -> Tuple[bool, str, int]:
    """
    Tests a single file
    Returns:
    - bool: True if runs successfully and False otherwise
    - str: "" if runs succesfully and the actual results otherwise
    - int: a code to indicate what kind of error occured. 0 for no error, 1 for parse error, and 2 for runtime error
    """
    if pdl_file_name in TO_SKIP:
        print(f"File {pdl_file_name} is part of TO_SKIP, skipping test...")
        return True, "", ACTUAL_NO_ERROR

    path_obj = pathlib.Path(pdl_file_name)
    scope: ScopeType = PdlDict({})

    if pdl_file_name in TESTS_WITH_INPUT:
        inputs = TESTS_WITH_INPUT[pdl_file_name]
        if inputs.stdin is not None:
            monkeypatch.setattr(
                "sys.stdin",
                io.StringIO(inputs.stdin),
            )
        if inputs.scope is not None:
            scope = inputs.scope

    try:
        random.seed(11)
        output = pdl.exec_file(
            path_obj,
            scope=scope,
            output="all",
            config=pdl.InterpreterConfig(batch=0),
        )

        actual_result = output["result"]
        block_to_dict(output["trace"], json_compatible=True)
        result_dir_name = (
            pathlib.Path(".") / "tests" / "results" / path_obj.parent
        )

        print(actual_result)

        # Find and compare results
        if not __find_and_compare_results(path_obj, str(actual_result)):
            if OLLAMA_GHACTIONS_RESULTS:
                print(
                    f"Program {pdl_file_name} requries updating its result on GitHub Actions"
                )
                print(f"Actual results: {str(actual_result)}")
                result_file_name = f"{path_obj.stem}.ollama_ghactions.result"
                __write_to_results_file(result_dir_name, result_file_name, str(actual_result))

                # Evaluate the results again. If fails again, then consider this program as failing
                if not __find_and_compare_results(
                    path_obj, str(actual_result)
                ):
                    print(
                        f"Program {str(pdl_file_name)} failed second time even after generating results from Github Actions. Consider this failing!"
                    )

                    return False, str(actual_result), ACTUAL_NO_ERROR
                else:
                    return True, "", ACTUAL_NO_ERROR

            if UPDATE_RESULTS:
                result_file_name = (
                        f"{path_obj.stem}.{str(RESULTS_VERSION)}.result"
                    )
                __write_to_results_file(
                    result_dir_name, result_file_name, str(actual_result)
                )

            return False, str(actual_result), ACTUAL_NO_ERROR

    except PDLParseError:
        expected_parse_errors = set(str(p) for p in EXPECTED_PARSE_ERROR)
        if pdl_file_name in expected_parse_errors:
            return True, "", ACTUAL_PARSE_ERROR_CODE
        return False, "", ACTUAL_PARSE_ERROR_CODE

    except Exception:
        expected_runtime_error = set(str(p) for p in EXPECTED_RUNTIME_ERROR)
        if pdl_file_name in expected_runtime_error:
            return True, "", ACTUAL_RUNTIME_ERROR_CODE
        return False, "", ACTUAL_RUNTIME_ERROR_CODE

    return True, "", ACTUAL_NO_ERROR

def __write_to_results_file(
    dir_name: pathlib.Path, filename: str, content: str
) -> None:
    """
    Write to results file
    """

    dir_name.mkdir(parents=True, exist_ok=True)
    with open(dir_name / filename, "w", encoding="utf-8") as result_file:
        result_file.write(content)


def __find_and_compare_results(
    test_file_name: pathlib.Path, actual_result: str
) -> bool:
    """
    Look through test_file_name's parent directory and see if any of *.result
    matches the actual output
    """

    result_dir_name = pathlib.Path(".") / "tests" / "results" / test_file_name.parent
    expected_files = result_dir_name.glob(test_file_name.stem + ".*.result")

    for expected_file in expected_files:
        with open(expected_file, "r", encoding="utf-8") as truth_file:
            expected_result = str(truth_file.read())
            if str(actual_result).strip() == expected_result.strip():
                return True
    return False

def test_all_pdl_programs(capsys: CaptureFixture[str], monkeypatch: MonkeyPatch) -> None:

    unexpected_parse_error: set[str] = set()
    unexpected_runtime_error: set[str] = set()
    wrong_results = {}

    files = pathlib.Path(".").glob("**/*.pdl")
    files = [str(f) for f in files]

    # Check if we only want to test a subset of PDL programs
    # MODIFIED_PDL_FILES_ENV_VAR is a string of PDL files, comma separated
    MODIFIED_PDL_FILES_ENV_VAR = os.getenv("MODIFIED_PDL_FILES", "")
    MODIFIED_PDL_FILES = [item.strip() for item in MODIFIED_PDL_FILES_ENV_VAR.split(",")]

    if len(MODIFIED_PDL_FILES) > 0:
        print("Only testing a subset of PDL programs, particularly newly added examples or PDL files that were modified.")
        files = MODIFIED_PDL_FILES

    for pdl_file_name in files:

        pdl_file_name_str = str(pdl_file_name)
        successful, actual_results, error_code = run_single_file(pdl_file_name_str, monkeypatch)

        if not successful:
            if error_code == ACTUAL_PARSE_ERROR_CODE:
                unexpected_parse_error |= {pdl_file_name_str}
            elif error_code == ACTUAL_RUNTIME_ERROR_CODE:
                unexpected_runtime_error |= {pdl_file_name_str}
            else:
                wrong_results[pdl_file_name_str] = actual_results

    assert len(unexpected_parse_error) == 0, f"Unexpected parse error: {unexpected_parse_error}"
    assert len(unexpected_runtime_error) == 0, f"Unexpected runtime error: {unexpected_runtime_error}"
    assert len(wrong_results) == 0, f"Wrong results: {wrong_results}"
