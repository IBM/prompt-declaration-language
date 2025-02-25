import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from enum import StrEnum
from typing import Any

import yaml
from datasets import Dataset
from rich.console import Console

from pdl.optimize.bam_logprobs import ModelResponse
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import messages_to_str
from pdl.pdl_utils import stringify

console = Console()

RETRY_COUNT = 0


# pylint: disable=too-many-instance-attributes
@dataclass
class TrialOutput:
    pdl_program: Program
    correct: bool = False
    exception: BaseException | None = None
    input_logprobs: ModelResponse | None = None
    scope: ScopeType | None = None
    pdl_result: Any = None
    pdl_document: str = ""
    answer: str | None = None
    groundtruth: str | None = None
    runtime: int | None = None
    example: Any = None
    total_tokens: int | None = None
    index: int | None = None

    def to_dict(self) -> dict:
        return {
            "correct": self.correct,
            "exception": str(self.exception),
            "pdl_document": self.pdl_document,
            "answer": self.answer,
            "groundtruth": self.groundtruth,
            "runtime": self.runtime,
            "index": self.index
        }


@dataclass
class CandidateResult:
    """Stores the result(s) of the evaluation of one candidate."""

    candidate: dict | None
    input_model_response: ModelResponse | None
    results: list[TrialOutput] | None
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
    GRANITE_34B_CODE_INSTRUCT = "ibm/granite-34b-code-instruct"
    GRANITE_20B_CODE_INSTRUCT_V2 = "ibm/granite-20b-code-instruct-v2"


def print_candidate(candidate: dict):
    console.print(yaml.dump(candidate))


DEBUG = True


def execute_threads(max_threads: int, pdl_threads: list, timeout: int | None = None):
    if max_threads == 1 and DEBUG:
        console.log("Running without parallelism")
        for job in pdl_threads:
            yield job.run()
        return

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
