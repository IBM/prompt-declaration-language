import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from enum import StrEnum
from threading import Thread
from typing import Any

import yaml
from rich.console import Console
from datasets import Dataset

from pdl.optimize.bam_logprobs import ModelResponse, get_seq_logprobs
from pdl.optimize.config_parser import OptimizationConfig
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import InterpreterState, contains_error, process_prog

console = Console()


class PDLThread1(Thread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__()

    def run(self):
        msg = "Base class does not implement"
        raise NotImplementedError(msg)


RETRY_COUNT = 3


class PDLThread(Thread):
    """Evaluates a candidate (configuration, i.e. fewshots, style) against **one** test example."""

    def __init__(
        self,
        pdl_program: Program,
        example: dict,
        candidate: dict,
        index: int,
        return_logprobs: bool,
        timeout: int,
        yield_output: bool,
        config: OptimizationConfig,
        answer_key: str = "answer",
    ):
        super().__init__()
        self.pdl_program = pdl_program
        self.example = example
        self.candidate = candidate
        self.index = index
        self.return_logprobs = return_logprobs
        self.scope = None
        self.timeout = timeout
        self.yield_output = yield_output
        self.answer_key = answer_key
        self.config = config

    def get_scope(self) -> ScopeType:
        raise NotImplementedError

    def extract_answer(self, document: str) -> Any:
        raise NotImplementedError

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        raise NotImplementedError

    def run(
        self,
    ):
        document = ""
        answer = None
        exception = None
        model_input = None
        result = None
        match = False
        truth = self.example[self.answer_key]

        retry = True
        tries = 0
        start_time = time.time()
        end_time = None
        while retry:
            if tries > 1:
                console.log("RETRYING! ", tries)
            try:
                state = InterpreterState(yield_output=self.yield_output)
                scope = self.get_scope()

                # TODO: update on merge main, should probably use result
                result, document, scope, trace = process_prog(
                    state,
                    scope,
                    self.pdl_program,
                    timeout=self.timeout,
                )
                console.log("result", result)
                self.scope = scope
                end_time = time.time()
                runtime = end_time - start_time
                console.log(f"Runtime took seconds: {runtime:.2f}")

                tries += 1

                if DEBUG:
                    console.log("DEBUG:", document)

                errored = contains_error(trace)
                if errored:
                    console.log("PDL error occured.")
                    # console.log(document)
                else:
                    if self.index == 0 and self.return_logprobs:
                        model_input = get_seq_logprobs(
                            self.model,
                            scope[self.config.demonstrations_variable_name],
                        )
                    answer = self.extract_answer(document)

                    if answer is None:
                        # console.log(document)
                        last_line = document.splitlines()[-1]
                        console.log("Couldn't extract answer: ", last_line)

                if answer is None or errored:
                    retry = True

                if answer is not None and not errored:
                    retry = False

                if tries >= RETRY_COUNT:
                    retry = False
            except Exception as e:
                # console.log("In thread: ", e)
                # exception = e
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
            input_logprobs=model_input,
            scope=scope,
            pdl_result=result,
            pdl_document=document,
            answer=answer,
            groundtruth=truth,
            runtime=runtime,
        )


@dataclass
class TrialOutput:
    pdl_program: Program
    correct: bool = False
    exception: BaseException | None = None
    input_logprobs: ModelResponse | None = None
    scope: ScopeType = None
    pdl_result: Any = None
    pdl_document: str = ""
    answer: str | None = None
    groundtruth: str | None = None
    runtime: int | None = None

    def to_dict(self) -> dict:
        return {
            "correct": self.correct,
            "exception": str(self.exception),
            "pdl_document": self.pdl_document,
            "answer": self.answer,
            "groundtruth": self.groundtruth,
            "runtime": self.runtime,
        }


@dataclass
class CandidateResult:
    """Stores the result(s) of the evaluation of one candidate."""

    candidate: dict | None
    input_model_response: ModelResponse | None
    results: list | None
    metric: float | int | None
    runtime: float | None

    def to_dict(self) -> dict:
        return {
            "candidate": {
                k: v for k, v in self.candidate.items() if not isinstance(v, Dataset)
            },  # we don't want to serialize the Dataset object
            "results": [r.to_dict() for r in self.results],
            "metric": self.metric,
            "runtime": self.runtime,
        }


class Models(StrEnum):
    granite_34b_code_instruct = "ibm/granite-34b-code-instruct"
    granite_20b_code_instruct_v2 = "ibm/granite-20b-code-instruct-v2"


def print_candidate(candidate: dict):
    console.print(yaml.dump(candidate))


DEBUG = True


def execute_threads(max_threads: int, pdl_threads: list, timeout: int | None = None):
    if max_threads == 1 and DEBUG:
        console.log("Running without parallelism")
        for job in pdl_threads:
            yield job.run()

    service = ThreadPoolExecutor(max_workers=max_threads)
    future_to_trial = {service.submit(thread.run): thread for thread in pdl_threads}
    thread = None
    results = {}
    try:
        for future in as_completed(future_to_trial, timeout=timeout):
            thread = future_to_trial[future]
            try:
                result = future.result(timeout=1)
                results[future] = result
                yield result
            except TimeoutError as t:
                console.log("Timed out...", thread.index)
                yield t
            except KeyboardInterrupt:
                console.log("Ctrl+Ced. Exiting...")
                service.shutdown(wait=False, cancel_futures=True)
                sys.exit()
            except Exception as te:
                yield te
    except TimeoutError as futures_timeout:
        if thread is not None and DEBUG:
            print_candidate(thread.scope)
        console.log(futures_timeout)
        for future in future_to_trial:
            if future not in results:
                yield futures_timeout
    finally:
        service.shutdown(wait=False, cancel_futures=True)
