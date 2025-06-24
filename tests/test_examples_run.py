import io
import os
import pathlib
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional

import yaml
from pytest import CaptureFixture, MonkeyPatch

from pdl import pdl
from pdl.pdl_ast import ScopeType
from pdl.pdl_lazy import PdlDict
from pdl.pdl_parser import PDLParseError

EXAMPLES_RUN_CONFIG_FILE = os.getenv(
    "EXAMPLES_RUN_FILE", "tests/test_examples_run.yaml"
)


@dataclass
class InputsType:
    """
    Inputs to the PDL program for testing
    """

    stdin: Optional[str] = None
    scope: Optional[ScopeType] = None


class ExecutionErrorCode(Enum):
    """
    PDLExecutionErrorCode describes the execution result of the PDL file
    """

    NO_ERROR = 1
    PARSE_ERROR = 2
    RUNTIME_ERROR = 3


@dataclass
class ExecutionResult:
    """
    ExecutionResult captures the execution result of a PDL file
    """

    result: str | None = None
    error_code: ExecutionErrorCode | None = None


@dataclass
class ExpectedResult:
    """
    ExpectedResult captures the expected result of a PDL file.
    Non-deterministic programs contain more than one valid result
    """

    results: List[str] | None = None
    error_code: ExecutionErrorCode | None = None

    def compare_to_execution(self, execution_result: ExecutionResult) -> bool:
        """
        Returns true if execution matches to expected results and false otherwise
        """

        # ExecutionErrorCode codes must match
        if execution_result.error_code != self.error_code:
            return False

        # Check if parse or runtime error
        if self.error_code == ExecutionErrorCode.PARSE_ERROR:
            return execution_result.error_code == ExecutionErrorCode.PARSE_ERROR
        if self.error_code == ExecutionErrorCode.RUNTIME_ERROR:
            return execution_result.error_code == ExecutionErrorCode.RUNTIME_ERROR

        # At this point, it's NO_ERROR, so check for results
        # Note string comparison ignores whitespaces
        actual_result = execution_result.result
        if actual_result is not None and self.results is not None:
            actual_result_stripped = actual_result.replace(" ", "").strip()
            for expected_result in self.results:
                expected_result_stripped = expected_result.replace(" ", "").strip()
                if actual_result_stripped == expected_result_stripped:
                    return True
        return False

    def get_next_results_version(self) -> int:
        """
        Returns the next results version for this file
        """

        if self.results is None:
            return 0
        return len(self.results)


@dataclass
class FailedResults:
    """
    FailedResults are all the files that failed
    """

    wrong_results: Dict[str, str] = field(default_factory=lambda: {})
    unexpected_parse_error: List[str] = field(default_factory=lambda: [])
    unexpected_runtime_error: List[str] = field(default_factory=lambda: [])


# pylint: disable=too-many-instance-attributes
class ExamplesRun:
    """
    ExamplesRun outlines PDL files
    - to skip
    - requires inputs
    - expects parse error
    - expects runtime error
    by loading the configuration from EXAMPLES_RUN_FILE
    and runs the test
    """

    def __init__(self, monkeypatch: MonkeyPatch) -> None:
        # Pytest
        self.monkeypatch = monkeypatch

        # Configuration
        self.update_results: bool = False

        # File manipulation
        self.check = [str(f) for f in pathlib.Path(".").glob("**/*.pdl")]
        self.skip: List[str] = []
        self.with_inputs: Dict[str, InputsType] = {}
        self.expected_parse_error: List[str] = []
        self.expected_runtime_error: List[str] = []

        # Load content from EXAMPLES_RUN_FILE
        with open(EXAMPLES_RUN_CONFIG_FILE, "r", encoding="utf-8") as file:
            content = yaml.safe_load(file)
            self.update_results = content["update_results"]

            # Update files to check iff check is specified
            if content["check"] is not None:
                if len(content["check"]) > 0:
                    self.check = content["check"]

            self.skip = content["skip"]
            self.expected_parse_error = content["expected_parse_error"]
            self.expected_runtime_error = content["expected_runtime_error"]

            for filename, inputs_type in content["with_inputs"].items():
                stdin, scope = None, None
                if "stdin" in inputs_type:
                    stdin = inputs_type["stdin"]
                if "scope" in inputs_type:
                    scope = inputs_type["scope"]
                self.with_inputs[filename] = InputsType(
                    stdin=stdin, scope=PdlDict(scope) if scope is not None else None
                )

        # Inits expected results
        self.expected_results: Dict[str, ExpectedResult] = {}
        self.__collect_expected_results()

        # Inits execution results for each PDL file
        self.execution_results: Dict[str, ExecutionResult] = {}

        # Init failed results
        self.failed_results = FailedResults()

    def __get_results_dir(self) -> pathlib.Path:
        return pathlib.Path(".") / "tests" / "results"

    def __collect_expected_results(self) -> None:
        """
        Collects possible results for programs in self.check
        """

        for file in self.check:
            expected_result = ExpectedResult()

            if file in self.expected_parse_error:
                expected_result.error_code = ExecutionErrorCode.PARSE_ERROR
            elif file in self.expected_runtime_error:
                expected_result.error_code = ExecutionErrorCode.RUNTIME_ERROR
            else:

                # Collect possible results
                res_list = []
                file_path: pathlib.Path = pathlib.Path(file)
                result_dir_name = self.__get_results_dir() / file_path.parent
                expected_files = result_dir_name.glob(file_path.stem + ".*.result")

                for expected_file in expected_files:
                    with open(expected_file, "r", encoding="utf-8") as truth_file:
                        content = truth_file.read()
                        res_list.append(content)

                expected_result.error_code = ExecutionErrorCode.NO_ERROR
                expected_result.results = res_list

            self.expected_results[file] = expected_result

    def __execute_file(self, pdl_file_name: str) -> None:
        """
        Tests the result of a single file and returns the result output and the error code
        """

        exec_result = ExecutionResult()

        pdl_file_path = pathlib.Path(pdl_file_name)
        scope: ScopeType = PdlDict({})

        # Patch with inputs
        if pdl_file_name in self.with_inputs:
            inputs = self.with_inputs[pdl_file_name]
            if inputs.stdin is not None:
                self.monkeypatch.setattr("sys.stdin", io.StringIO(inputs.stdin))
            if inputs.scope is not None:
                scope = inputs.scope

        try:
            # Execute file
            output = pdl.exec_file(
                pdl_file_path,
                scope=scope,
                output="all",
                config=pdl.InterpreterConfig(batch=0),
            )

            exec_result.result = str(output["result"])
            exec_result.error_code = ExecutionErrorCode.NO_ERROR
            pdl.write_trace("/dev/null", output["trace"])
        except PDLParseError:
            exec_result.error_code = ExecutionErrorCode.PARSE_ERROR
        except Exception:
            exec_result.error_code = ExecutionErrorCode.RUNTIME_ERROR

        self.execution_results[pdl_file_name] = exec_result

    def populate_exec_result_for_checks(self) -> None:
        """
        Populates the execution result for all files in self.checks
        """

        for file in self.check:
            if file not in self.skip:
                self.__execute_file(file)

    def validate_expected_and_actual(self) -> None:
        """
        Validates the expected result to actual result
        Must be run after populate_exec_result_for_checks
        """

        wrong_result: Dict[str, str] = {}
        unexpected_parse_error: List[str] = []
        unexpected_runtime_error: List[str] = []

        for file in self.check:
            if file not in self.skip:
                expected_result = self.expected_results[file]
                actual_result = self.execution_results[file]
                match = expected_result.compare_to_execution(actual_result)

                if not match:
                    # Check if actual results caused any error
                    if actual_result.error_code == ExecutionErrorCode.PARSE_ERROR:
                        unexpected_parse_error.append(file)
                    elif actual_result.error_code == ExecutionErrorCode.RUNTIME_ERROR:
                        unexpected_runtime_error.append(file)
                    # If no error, then the results are wrong
                    else:
                        if actual_result.result is not None:
                            wrong_result[file] = actual_result.result

        self.failed_results.wrong_results = wrong_result
        self.failed_results.unexpected_parse_error = unexpected_parse_error
        self.failed_results.unexpected_runtime_error = unexpected_runtime_error

    def write_results(self) -> None:
        """
        Writes new results for failed files
        """

        results_dir = self.__get_results_dir()
        for file in self.failed_results.wrong_results:
            next_results_version = str(
                self.expected_results[file].get_next_results_version()
            )
            # Mkdir if not exist
            file_path = pathlib.Path(file)
            write_file_dir = results_dir / file_path.parent
            write_file_dir.mkdir(parents=True, exist_ok=True)

            # Write to new file
            write_file_name = (
                write_file_dir / f"{file_path.stem}.{next_results_version}.result"
            )
            actual_result = self.failed_results.wrong_results[file]

            with open(write_file_name, "w", encoding="utf-8") as f:
                f.write(actual_result)


def test_example_runs(capsys: CaptureFixture[str], monkeypatch: MonkeyPatch) -> None:
    """
    Runs the test
    """

    random.seed(11)
    background = ExamplesRun(monkeypatch)

    background.populate_exec_result_for_checks()
    background.validate_expected_and_actual()

    if background.update_results:
        background.write_results()

    # Print the actual results for wrong results
    for file, actual in background.failed_results.wrong_results.items():
        print(
            "\n============================================================================"
        )
        print(f"File that produced wrong result: {file}")
        print(
            f"Actual result (copy everything below this line):\n✂️ ------------------------------------------------------------\n{actual}\n-------------------------------------------------------------"
        )

    assert (
        len(background.failed_results.unexpected_parse_error) == 0
    ), f"Unexpected parse error: {background.failed_results.unexpected_parse_error}"
    assert (
        len(background.failed_results.unexpected_runtime_error) == 0
    ), f"Unexpected runtime error: {background.failed_results.unexpected_runtime_error}"
    assert (
        len(background.failed_results.wrong_results) == 0
    ), f"Wrong results: {background.failed_results.wrong_results}"
