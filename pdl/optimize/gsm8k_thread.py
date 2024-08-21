import time

from pdl.optimize.bam_logprobs import get_seq_logprobs
from pdl.optimize.parse_number import extract_math_answer
from pdl.optimize.util import PDLThread, TrialOutput, console
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import (
    InterpreterState,
    contains_error,
    empty_scope,
    process_prog,
)

DEBUG = False


class Gsm8kTrialThread(PDLThread):
    """Evaluates a candidate (configuration, i.e. fewshots, style) against **one** test example."""

    def __init__(
        self,
        pdl_program: Program,
        example: dict,
        candidate: dict,
        index: int,
        return_logprobs: bool,
        timeout: int,
    ):
        super().__init__()
        self.pdl_program = pdl_program
        self.example = example
        self.candidate = candidate
        self.index = index
        self.return_logprobs = return_logprobs
        self.scope = None
        self.timeout = timeout

    def get_scope(self) -> ScopeType:
        scope = empty_scope
        scope["model"] = self.candidate["model"]
        scope["prompt_pattern"] = self.candidate["prompt_pattern"]
        match self.candidate["prompt_pattern"]:
            case "cot":
                scope["demonstrations"] = [
                    {
                        "question": q["question"],
                        "reasoning": q["reasoning"],
                        "answer": str(q["answer"]),
                    }
                    for q in self.candidate["demonstrations"]
                ]
            case "react":
                scope["demonstrations"] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["traj_keys"],
                            q["traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate["demonstrations"]
                ]
            case "rewoo":
                scope["demonstrations"] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["rewoo_traj_keys"],
                            q["rewoo_traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate["demonstrations"]
                ]
        scope["question"] = self.example["question"]
        scope["reasoning"] = self.example["reasoning"]
        return scope

    def run(
        self,
    ):
        document = ""
        answer = None
        exception = None
        model_input = None
        result = None
        match = False
        truth = self.example["answer"]  # HARDCODED

        retry = True
        tries = 0
        start_time = time.time()
        end_time = None
        while retry:
            if tries > 1:
                console.log("RETRYING! ", tries)
            try:
                state = InterpreterState(yield_output=False)
                scope = self.get_scope()

                result, document, scope, trace = process_prog(
                    state,
                    scope,
                    self.pdl_program,
                    timeout=self.timeout
                )
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
                            scope["demonstrations"],  # HARDCODED
                        )
                    answer = extract_math_answer(document)

                    if answer is None:
                        # console.log(document)
                        console.log("Couldn't extract answer")

                if answer is None or errored:
                    retry = True

                if answer is not None and not errored:
                    retry = False

                if tries > 2:
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

        match = answer == truth or document.endswith(f" {truth}")

        return TrialOutput(
            pdl_program=self.pdl_program,
            matches=match,
            exception=exception,
            input_logprobs=model_input,
            scope=scope,
            pdl_result=result,
            pdl_document=document,
            answer=answer,
            groundtruth=truth,
            runtime=runtime,
        )
