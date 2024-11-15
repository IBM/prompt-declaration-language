import io
import pathlib
import random
from dataclasses import dataclass
from typing import Optional

from pytest import CaptureFixture, MonkeyPatch

from pdl import pdl
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import PDLRuntimeError
from pdl.pdl_parser import PDLParseError

UPDATE_RESULTS = False

TO_SKIP = {
    str(name)
    for name in [
        pathlib.Path("examples") / "demo" / "2-teacher.pdl",  # TODO: check why
        pathlib.Path("examples") / "talk" / "8-tools.pdl",  # TODO: check why
        pathlib.Path("examples") / "talk" / "10-sdg.pdl",  # TODO: check why
        pathlib.Path("examples") / "teacher" / "teacher.pdl",  # TODO: check why
        pathlib.Path("examples") / "tools" / "calc.pdl",  # TODO: check why
        pathlib.Path("examples") / "tutorial" / "calling_apis.pdl",
        pathlib.Path("examples") / "cldk" / "cldk-assistant.pdl",
        pathlib.Path("examples") / "talk" / "10-multi-agent.pdl",
        pathlib.Path("examples") / "gsm8k" / "gsmhard-bugs.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-base.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-jinja.pdl",
        pathlib.Path("examples") / "gsm8k" / "math-python.pdl",
        pathlib.Path("examples") / "gsm8k" / "math.pdl",
        pathlib.Path("examples") / "rag" / "rag.pdl",
        pathlib.Path("examples") / "react" / "react_call.pdl",
        pathlib.Path("examples") / "callback" / "repair_prompt.pdl",
    ]
}

NOT_DETERMINISTIC = {
    str(name)
    for name in [
        pathlib.Path("examples") / "granite" / "multi_round_chat.pdl",
        pathlib.Path("examples") / "granite" / "single_round_chat.pdl",
        pathlib.Path("examples") / "joke" / "Joke.pdl",
        pathlib.Path("examples") / "react" / "multi-agent.pdl",
        pathlib.Path("examples") / "react" / "wikipedia.pdl",
        pathlib.Path("examples") / "talk" / "10-sdg.pdl",
        pathlib.Path("examples") / "talk" / "7-chatbot-roles.pdl",
        pathlib.Path("examples") / "chatbot" / "chatbot.pdl",
        pathlib.Path("examples") / "talk" / "8-tools.pdl",
        pathlib.Path("examples") / "talk" / "9-react.pdl",
        pathlib.Path("examples") / "teacher" / "teacher.pdl",
        pathlib.Path("examples") / "tools" / "calc.pdl",
        pathlib.Path("examples") / "tutorial" / "include.pdl",
        pathlib.Path("examples") / "hello" / "hello-roles-array.pdl",
        pathlib.Path("examples") / "weather" / "weather.pdl",
        pathlib.Path("examples") / "demo" / "3-weather.pdl",
        pathlib.Path("examples") / "tutorial" / "conditionals_loops.pdl",
        pathlib.Path("examples") / "chatbot" / "chatbot.pdl",
        pathlib.Path("examples") / "fibonacci" / "fib.pdl",
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
        / "demo"
        / "4-translator.pdl": InputsType(stdin="french\nstop\n"),
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
        / "talk"
        / "7-chatbot-roles.pdl": InputsType(stdin="What is APR?\nquit\n"),
        pathlib.Path("examples")
        / "granite"
        / "single_round_chat.pdl": InputsType(scope={"PROMPT": "What is APR?\nyes\n"}),
        pathlib.Path("examples")
        / "hello"
        / "hello-data.pdl": InputsType(scope={"something": "ABC"}),
        pathlib.Path("examples")
        / "weather"
        / "weather.pdl": InputsType(stdin="What is the weather in Yorktown Heights?\n"),
        pathlib.Path("examples")
        / "demo"
        / "3-weather.pdl": InputsType(
            stdin="What is the weather in Yorktown Heights?\n"
        ),
        pathlib.Path("examples")
        / "tutorial"
        / "conditionals_loops.pdl": InputsType(
            stdin="What is APR?\nno\nSay it as a poem\nyes\n"
        ),
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
    pathlib.Path("examples") / "tutorial" / "gen-data.pdl",
    pathlib.Path("examples") / "hello" / "hello-type-code.pdl",
    pathlib.Path("examples") / "hello" / "hello-type-list.pdl",
    pathlib.Path("examples") / "hello" / "hello-type.pdl",
    pathlib.Path("examples") / "hello" / "hello-parser-json.pdl",
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


def test_valid_programs(capsys: CaptureFixture[str], monkeypatch: MonkeyPatch) -> None:
    actual_parse_error: set[str] = set()
    actual_runtime_error: set[str] = set()
    wrong_results = {}
    for pdl_file_name in pathlib.Path(".").glob("**/*.pdl"):
        scope: ScopeType = {}
        if str(pdl_file_name) in TO_SKIP:
            continue
        if str(pdl_file_name) in TESTS_WITH_INPUT:
            inputs = TESTS_WITH_INPUT[str(pdl_file_name)]
            if inputs.stdin is not None:
                monkeypatch.setattr(
                    "sys.stdin",
                    io.StringIO(inputs.stdin),
                )
            if inputs.scope is not None:
                scope = inputs.scope
        try:
            random.seed(11)
            result = pdl.exec_file(pdl_file_name, scope=scope)
            result_dir_name = (
                pathlib.Path(".") / "tests" / "results" / pdl_file_name.parent
            )
            result_file_name = pdl_file_name.stem + ".result"
            if UPDATE_RESULTS:
                result_dir_name.mkdir(parents=True, exist_ok=True)
                with open(
                    result_dir_name / result_file_name, "w", encoding="utf-8"
                ) as result_file:
                    print(str(result), file=result_file)
            if str(pdl_file_name) in NOT_DETERMINISTIC:
                continue
            with open(
                result_dir_name / result_file_name, "r", encoding="utf-8"
            ) as result_file:
                expected_result = str(result_file.read())
            if str(result).strip() != expected_result.strip():
                wrong_results[str(pdl_file_name)] = {
                    "actual": str(result),
                    "expected": str(expected_result),
                }
        except PDLParseError:
            actual_parse_error |= {str(pdl_file_name)}
        except PDLRuntimeError as exc:
            if str(pdl_file_name) not in set(str(p) for p in EXPECTED_RUNTIME_ERROR):
                print(exc)  # unexpected error: breakpoint
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
            (expected_parse_error - actual_parse_error).union(
                expected_runtime_error - actual_runtime_error
            )
        )
    )
    assert len(unexpected_valid) == 0, unexpected_valid
    # Unexpected results
    assert len(wrong_results) == 0, wrong_results
