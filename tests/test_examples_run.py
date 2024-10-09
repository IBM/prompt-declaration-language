import io
import pathlib
import random

from pdl import pdl
from pdl.pdl_interpreter import PDLRuntimeError
from pdl.pdl_parser import PDLParseError

UPDATE_RESULTS = True

TO_SKIP = {
    str(name)
    for name in [
        pathlib.Path("examples") / "demo" / "3-weather.pdl",
        pathlib.Path("examples") / "tutorial" / "calling_apis.pdl",
        pathlib.Path("examples") / "cldk" / "cldk-assistant.pdl",
        pathlib.Path("examples") / "weather" / "weather.pdl",
        pathlib.Path("examples") / "talk" / "10-multi-agent.pdl",
        pathlib.Path("examples") / "gsm8k" / "gsmhard-bugs.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-base.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-jinja.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-python.pdl",
        pathlib.Path("examples") / "gsm8k" / "math.pdl",
    ]
}


TESTS_WITH_INPUT = {
    str(name): input_text
    for name, input_text in {
        pathlib.Path("examples") / "demo" / "4-translator.pdl": "french\nstop\n",
        pathlib.Path("examples") / "tutorial" / "input_stdin.pdl": "Hello\n",
        pathlib.Path("examples")
        / "tutorial"
        / "input_stdin_multiline.pdl": "Hello\nBye\n",
        pathlib.Path("examples") / "input" / "input_test1.pdl": "Hello\n",
        pathlib.Path("examples") / "input" / "input_test2.pdl": "Hello\n",
        pathlib.Path("examples") / "chatbot" / "chatbot.pdl": "What is APR?\nyes\n",
        pathlib.Path("examples")
        / "talk"
        / "7-chatbot-roles.pdl": "What is APR?\nquit\n",
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
    pathlib.Path("examples") / "demo" / "1-gen-data.pdl",
    pathlib.Path("examples") / "demo" / "1-gen-data.pdl",
]


def test_valid_programs(capsys, monkeypatch) -> None:
    actual_parse_error: set[str] = set()
    actual_runtime_error: set[str] = set()
    wrong_results = {}
    for pdl_file_name in pathlib.Path(".").glob("**/*.pdl"):
        print(str(pdl_file_name))
        # if "cldk" in str(pdl_file_name):
        #     pass
        if str(pdl_file_name) in TO_SKIP:
            continue
        if str(pdl_file_name) in TESTS_WITH_INPUT:
            monkeypatch.setattr(
                "sys.stdin", io.StringIO(TESTS_WITH_INPUT[str(pdl_file_name)])
            )
        try:
            random.seed(11)
            result = pdl.exec_file(pdl_file_name)
            result_dir_name = (
                pathlib.Path(".") / "tests" / "results" / pdl_file_name.parent
            )
            result_file_name = pdl_file_name.stem + ".result"
            if UPDATE_RESULTS:
                result_dir_name.mkdir(parents=True, exist_ok=True)
                with open(result_dir_name / result_file_name, "w") as result_file:
                    print(str(result), file=result_file)
            with open(result_dir_name / result_file_name, "r") as result_file:
                expected_result = str(result_file.read())
            if str(result) != expected_result:
                wrong_results[str(pdl_file_name)] = {
                    "actual": str(result),
                    "expected": str(expected_result),
                }
        except PDLParseError:
            actual_parse_error |= {str(pdl_file_name)}
        except PDLRuntimeError:
            actual_runtime_error |= {str(pdl_file_name)}
    # Parse errors
    expected_parse_error = set(str(p) for p in EXPECTED_PARSE_ERROR)
    unexpected_parse_error = sorted(list(actual_parse_error - expected_parse_error))
    assert len(unexpected_parse_error) == 0, unexpected_parse_error
    # Runtime errors
    expected_runtime_error = set(str(p) for p in EXPECTED_RUNTIME_ERROR)
    unexpected_runtime_error = sorted(
        list(actual_runtime_error - expected_runtime_error)
    )
    assert len(unexpected_runtime_error) == 0, unexpected_runtime_error
    # Unexpected valid
    unexpected_valid = sorted(
        list(
            (expected_parse_error - actual_parse_error)
            + (expected_runtime_error - actual_runtime_error)
        )
    )
    assert len(unexpected_valid) == 0, unexpected_valid
    # Unexpected results
    assert len(wrong_results) == 0, wrong_results
