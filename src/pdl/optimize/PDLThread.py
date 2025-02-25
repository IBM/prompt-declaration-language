# pylint: disable=too-many-instance-attributes
from pdl.optimize.bam_logprobs import get_seq_logprobs
from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.util import RETRY_COUNT, TrialOutput, console
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import InterpreterState, PDLRuntimeError, process_prog
from pdl.pdl_location_utils import get_loc_string
from pdl.pdl_parser import PDLParseError


import time
from pathlib import Path
from threading import Thread
from typing import Any


class PDLThread(Thread):
    """Evaluates a candidate (configuration, i.e. fewshots, style) against **one** test example."""

    # pylint: disable=too-many-arguments,too-many-positional-arguments
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
        cwd: Path,
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
        self.cwd = cwd

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
        total_tokens = -1
        errored = False
        while retry:
            if tries > 1:
                console.log("RETRYING! ", tries)
            try:
                tries += 1
                state = InterpreterState(
                    yield_result=self.yield_output,
                    yield_background=self.yield_output,
                    cwd=self.cwd,
                )
                scope = self.get_scope()

                # TODO: update on merge main, should probably use result
                result, messages, scope, _ = process_prog(
                    state,
                    scope,
                    self.pdl_program,
                    timeout=self.timeout,
                )


                # if not state.yield_result:
                #     if state.yield_background:
                #         print("\n----------------")
                #     if result is None:
                #         # print()
                #         pass
                #     else:
                #         print(stringify(result))
                # else:
                    # print()

                # total_tokens = scope.get("pdl_total_tokens", -1)
                # print("Total tokens: ", total_tokens)
                document = result #messages_to_str("", messages)
                # console.log("result", result)
                self.scope = scope
                end_time = time.time()
                runtime = end_time - start_time
                console.log(f"Runtime took seconds: {runtime:.2f}")



                # if DEBUG:
                # console.log("DEBUG:", document)

                errored = False  # contains_error(trace)
                if errored:
                    console.log("PDL error occured.")
                    # console.log(document)
                else:
                    if self.index == 0 and self.return_logprobs:
                        model_input = get_seq_logprobs(
                            self.scope["model"],
                            scope[self.config.demonstrations_variable_name],
                        )
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
                print("\n".join(exc.message))#, file=sys.stderr)
            except PDLRuntimeError as exc:
                console.log("PDLRuntimeError!!")
                console.log(exc)
                # console.print_exception(show_locals=False)

                errored = True
                if exc.loc is None:
                    message = exc.message
                else:
                    message = get_loc_string(exc.loc) + exc.message
                console.log(message)#, file=sys.stderr)
                retry = True # tries < RETRY_COUNT
                if tries >= RETRY_COUNT:
                    retry = False
                console.log("Retrying: ", retry)
                exception = exc
            except TimeoutError as exc:
                retry = True # tries < RETRY_COUNT
                if tries >= RETRY_COUNT:
                    retry = False
                exception = exc
                console.log("Timed out, retrying: ", retry)
            except Exception as e:
                console.print_exception(show_locals=False)
                # console.log("In thread: ", e)
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
            input_logprobs=model_input,
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