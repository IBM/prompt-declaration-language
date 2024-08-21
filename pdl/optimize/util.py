import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from enum import StrEnum
from threading import Thread
from typing import Any

import yaml
from rich.console import Console

from pdl.optimize.bam_logprobs import ModelResponse
from pdl.pdl_ast import Program, ScopeType

console = Console()


class PDLThread(Thread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__()

    def run(self):
        msg = "Base class does not implement"
        raise NotImplementedError(msg)


@dataclass
class TrialOutput:
    pdl_program: Program
    matches: bool = False
    exception: BaseException | None = None
    input_logprobs: ModelResponse | None = None
    scope: ScopeType = None
    pdl_result: Any = None
    pdl_document: str = ""
    answer: str | None = None
    groundtruth: str | None = None
    runtime: int | None = None


@dataclass
class CandidateResult:
    """Stores the result(s) of the evaluation of one candidate."""

    candidate: dict | None
    input_model_response: ModelResponse | None
    results: list | None
    metric: float | int | None


class Models(StrEnum):
    granite_34b_code_instruct = "ibm/granite-34b-code-instruct"
    granite_20b_code_instruct_v2 = "ibm/granite-20b-code-instruct-v2"


def print_candidate(candidate: dict):
    console.print(yaml.dump(candidate))


DEBUG = False


def execute_threads(max_threads: int, pdl_threads: list, timeout: int = 120):
    if max_threads == 1 and DEBUG:
        console.log("Running without parallelism")
        for job in pdl_threads:
            yield job.run()

    service = ThreadPoolExecutor(max_workers=max_threads)
    future_to_trial = {service.submit(thread.run): thread for thread in pdl_threads}
    thread = None
    results = {}
    try:
        for future in as_completed(future_to_trial):#, timeout=timeout):
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
