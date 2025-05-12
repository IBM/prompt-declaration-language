# pylint: disable=too-many-instance-attributes
import time
from pathlib import Path
from threading import Thread
from typing import Any

from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.util import RETRY_COUNT, TrialOutput, console
from pdl.pdl import InterpreterConfig, exec_program
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import PDLRuntimeError
from pdl.pdl_lazy import PdlDict
from pdl.pdl_location_utils import get_loc_string
from pdl.pdl_parser import PDLParseError


class OptimizerEvaluator(Thread):
    """Evaluates a candidate (configuration, i.e. fewshots, style) against **one** test example."""

    # pylint: disable=too-many-arguments,too-many-positional-arguments
    def __init__(
        self,
        pdl_program: Program,
        example: dict,
        candidate: dict,
        index: int,
        timeout: int,
        yield_output: bool,
        config: OptimizationConfig,
        cwd: Path,
        answer_key: str = "answer",
    ) -> None:
        super().__init__()
        self.pdl_program = pdl_program
        self.example = example
        self.candidate = candidate
        self.index = index
        self.scope: PdlDict = PdlDict({})
        self.timeout = timeout
        self.yield_output = yield_output
        self.answer_key = answer_key
        self.config = config
        self.cwd = cwd

    def get_scope(self) -> ScopeType:
        raise NotImplementedError

    def extract_answer(self, document: str) -> Any:
        raise NotImplementedError

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        raise NotImplementedError

    def run(  # type: ignore # noqa: C901
        self,
    ) -> TrialOutput | Exception:
        document = ""
        answer = None
        exception: PDLParseError | PDLRuntimeError | Exception | bool | None = None
        result = None
        match = False
        truth = self.example[self.answer_key]
        scope: PdlDict = PdlDict({})

        retry = True
        tries = 0
        start_time = time.time()
        end_time = None
        total_tokens = -1
        errored = False
        while retry:
            if tries > 1:
                console.log("RETRYING! ", tries)
            try:
                tries += 1

                config = InterpreterConfig(
                    yield_result=self.yield_output,
                    yield_background=self.yield_output,
                    cwd=self.cwd,
                )
                scope = self.get_scope()

                result = exec_program(
                    prog=self.pdl_program,
                    config=config,
                    scope=scope,
                    output="all",
                )

                document = result["result"]
                self.scope = result["scope"]

                if isinstance(document, str):
                    document = document.strip()
                else:
                    raise TypeError(
                        f"Expected document to be a string, got {type(document)}",
                    )

                end_time = time.time()
                runtime = end_time - start_time
                console.log(f"Runtime took seconds: {runtime:.2f}")

                errored = False
                if errored:
                    console.log("PDL error occured.")
                else:
                    answer = self.extract_answer(document)

                    if answer is None:
                        last_line = document.splitlines()[-1]
                        console.log("Couldn't extract answer: ", last_line)

                if answer is None or errored:
                    retry = True

                if answer is not None and not errored:
                    retry = False

                if tries >= RETRY_COUNT:
                    retry = False
            except PDLParseError as exc:
                console.print_exception(show_locals=False)
                errored = True
                exception = exc
                console.print("\n".join(exc.message))
            except PDLRuntimeError as exc:
                console.log(exc)

                errored = True
                if exc.loc is None:
                    message = exc.message
                else:
                    message = get_loc_string(exc.loc) + exc.message
                console.log(message)
                retry = True
                if tries >= RETRY_COUNT:
                    retry = False
                console.log("Retrying: ", retry)
                exception = exc
            except TimeoutError as exc:
                retry = True
                if tries >= RETRY_COUNT:
                    retry = False
                exception = exc
                console.log("Timed out, retrying: ", retry)
            except Exception as e:
                console.print_exception(show_locals=False)
                exception = e
                errored = True
                return e
        if end_time is None:
            end_time = time.time()
            runtime = end_time - start_time
            console.log(f"Runtime FAILED and took seconds: {runtime:.2f}")
        else:
            runtime = end_time - start_time

        if errored and not exception:
            exception = errored

        match = self.answer_correct(document, answer, truth)

        return TrialOutput(
            pdl_program=self.pdl_program,
            correct=match,
            exception=exception,
            scope=scope,
            pdl_result=result,
            pdl_document=document,
            answer=answer,
            groundtruth=truth,
            runtime=runtime,
            example=self.example,
            total_tokens=total_tokens,
            index=self.index,
        )
