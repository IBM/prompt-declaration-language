import time
from pdl.optimize.util import PDLThread, TrialOutput, console
from pdl.pdl_ast import Program, ScopeType
from pdl.pdl_interpreter import (
    InterpreterState,
    contains_error,
    empty_scope,
    process_prog,
)

DEBUG = False


class FEVERTrialThread(PDLThread):
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

        scope["claim"] = self.example["claim"]
        return scope

    def get_truth_answer(self):
        # choices = list(self.example["target_scores"].items())
        # return next(x[0] for x in choices if x[1] == max(x[1] for x in choices))
        return self.example["bool_label"]

    def extract_answer(self, document: str) -> bool:
        #  "SUPPORTS", and otherwise with "REFUTES"
        response = document.splitlines()[-1].lower()
        if "```" in response:
            response = response.split("```")[1]
        supports = "true" in response
        refutes = "false" in response
        # console.log("DOCUMENT:", response)
        if (supports and refutes) or not (supports or refutes):
            return None  # ""

        if supports:
            return True  # "true"

        if refutes:
            return False  # "false"
        return None
        # return ""

    def run(
        self,
    ):
        document = ""
        answer = None
        exception = None
        model_input = None
        scope = None
        result = None
        match = False
        truth = self.get_truth_answer()

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
                    state, scope, self.pdl_program, timeout=self.timeout
                )

                end_time = time.time()
                runtime = end_time - start_time
                console.log(f"Runtime took seconds: {runtime:.2f}")

                tries += 1

                if DEBUG:
                    console.log("Document:", document)

                errored = contains_error(trace)
                if errored:
                    console.log("PDL error occured.", document)
                else:
                    answer = self.extract_answer(document)

                    if answer is None:
                        console.log("Couldn't extract answer:", document)

                if answer is None or errored:
                    retry = True

                if answer is not None and not errored:
                    retry = False

                if tries > 2:
                    retry = False
            except Exception as e:
                console.log(e)
                exception = e

        if end_time is None:
            end_time = time.time()
            runtime = end_time - start_time
            console.log(f"Runtime FAILED and took seconds: {runtime:.2f}")
        else:
            runtime = end_time - start_time

        if errored and not exception:
            exception = errored

        match = answer == truth or document.endswith(str(truth))

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
