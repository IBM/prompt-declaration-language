import argparse
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from enum import Enum, StrEnum
from math import ceil, log2
from pathlib import Path
from threading import Thread
from typing import Any

import yaml
from datasets import Dataset, load_dataset, load_from_disk
from numpy.random import default_rng
from tqdm import tqdm

from pdl.optimize.bam_logprobs import ModelResponse, get_seq_logprobs
from pdl.optimize.parse_number import extract_math_answer
from pdl.pdl_ast import (
    DataBlock,
    Program,
    ScopeType,
)
from pdl.pdl_dumper import dump_program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

rng = default_rng()


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
class Gsm8kOutput:
    pdl_program: Program
    matches: bool = False
    exception: BaseException | None = None
    input_logprobs: ModelResponse | None = None
    scope: ScopeType = None
    pdl_result: Any = None
    pdl_document: str = ""
    answer: str | None = None
    groundtruth: str | None = None


# class Gsm8kThread(PDLThread):
#     def __init__(
#         self,
#         pdl_program: Program,
#         qna: dict,
#         demonstrations: list[dict],
#         index: int,
#         trial: int,
#         model: str,
#         input_variable_name: str,
#         return_logprobs: bool,
#         prompt_pattern: str,
#     ):
#         super().__init__()
#         self.pdl_program = pdl_program
#         self.qna = qna
#         self.demonstrations = demonstrations
#         self.index = index
#         self.trial = trial
#         self.model = model
#         self.input_variable_name = input_variable_name
#         self.return_logprobs = return_logprobs
#         self.prompt_pattern = prompt_pattern

#     def get_scope(self) -> ScopeType:
#         scope = empty_scope
#         scope["prompt_pattern"] = self.prompt_pattern
#         match self.prompt_pattern:
#             case "cot":
#                 scope["demonstrations"] = [
#                     {
#                         "question": q["question"],
#                         "reasoning": q["reasoning"],
#                         "answer": q["answer"],
#                     }
#                     for q in self.demonstrations
#                 ]
#             case "react":
#                 scope["demonstrations"] = [
#                     [
#                         {key: value}
#                         for key, value in zip(
#                             q["traj_keys"],
#                             q["traj_values"],
#                             strict=True,
#                         )
#                     ]
#                     for q in self.demonstrations
#                 ]
#             case "rewoo":
#                 scope["demonstrations"] = [
#                     [
#                         {key: value}
#                         for key, value in zip(
#                             q["rewoo_traj_keys"],
#                             q["rewoo_traj_values"],
#                             strict=True,
#                         )
#                     ]
#                     for q in self.demonstrations
#                 ]
#         scope["question"] = self.qna["question"]
#         scope["reasoning"] = self.qna["reasoning"]
#         scope["model"] = self.model
#         return scope

#     def run(
#         self,
#     ):
#         document = ""
#         answer = None
#         exception = None
#         model_input = None
#         scope = None
#         result = None
#         match = False
#         truth = self.qna["answer"]

#         try:
#             state = InterpreterState(yield_output=False)
#             scope = self.get_scope()

#             result, document, scope, trace = process_prog(
#                 state,
#                 scope,
#                 self.pdl_program,
#             )
#             if self.index == 0 and self.return_logprobs:
#                 model_input = get_seq_logprobs(
#                     self.model,
#                     scope[self.input_variable_name],
#                 )
#             answer = extract_math_answer(document)
#         except Exception as e:
#             print(e)
#             exception = e

#         match = answer == truth or document.endswith(str(truth))

#         return Gsm8kOutput(
#             pdl_program=self.pdl_program,
#             matches=match,
#             exception=exception,
#             input_logprobs=model_input,
#             scope=scope,
#             pdl_result=result,
#             pdl_document=document,
#             answer=answer,
#             groundtruth=truth,
#         )


def execute_threads(max_threads: int, pdl_threads: list):
    with ThreadPoolExecutor(max_workers=max_threads) as service:
        futures = [
            service.submit(
                thread.run,
            )
            for thread in pdl_threads
        ]
        for future in futures:
            try:
                yield future.result(timeout=180)  # 259200)
            except TimeoutError as t:
                print(t)

        service.shutdown()


class SamplingMethods(Enum):
    IDENTITY = 1
    REVERSED = 2
    RANDOM_INDICES = 3
    UNCERTAINTY = 4


class Models(StrEnum):
    granite_34b_code_instruct = "ibm/granite-34b-code-instruct"
    granite_20b_code_instruct_v2 = "ibm/granite-20b-code-instruct-v2"


class Optimizer:
    def __init__(
        self,
        dataset: Dataset,
        pdl_file: Path,
        trials: int,
        k: int,
        test_set_size: int,
        input_variable: str,
    ) -> None:
        self.dataset = dataset
        self.pdl_file = pdl_file
        self.num_trials = trials
        self.num_demonstrations = k
        self.model = str(Models.granite_34b_code_instruct)
        self.best_demos = []
        # self.budget = "1"
        self.test_set_size = test_set_size
        self.test_set = self.dataset["test"].select(range(self.test_set_size))
        self.trial_metrics = []
        self.trial_logprobs = []
        self.input_variable = input_variable

    def extract_answer(self, document):
        return extract_math_answer(document)

    def load_pdl(self) -> Program:
        with (
            self.pdl_file.open(encoding="utf-8") as pdl,
        ):
            return Program.model_validate(yaml.safe_load(pdl))

    def sample(self, dataset, method: SamplingMethods):
        match method:
            case SamplingMethods.IDENTITY:
                return dataset
            case SamplingMethods.REVERSED:
                return list(reversed(dataset))
            case SamplingMethods.RANDOM_INDICES:
                return self.sample_random_indices(dataset)
            case SamplingMethods.UNCERTAINTY:
                # filtered = dataset.sort("entropy", reverse=True)[:self.k*3]#.filter(lambda x: x["entropy"] < 4.5, num_proc=32)
                filtered = dataset.sort("entropy", reverse=True).select(
                    range(self.num_demonstrations * 3),
                )  # [:self.k*3]#.filter(lambda x: x["entropy"] < 4.5, num_proc=32)
                return self.sample_random_indices(filtered)

        msg = "Invalid sampling method!"
        raise ValueError(msg)

    def sample_random_indices(self, dataset) -> Dataset:
        demo_indices = rng.choice(
            len(dataset),
            size=self.num_demonstrations,
            replace=False,
        )
        return dataset.select(demo_indices)

    def sample_random_index(self, items: list):
        demo_indices = rng.choice(
            len(items),
            size=1,
            replace=False,
        )[0]
        return items[demo_indices]

    def save_pdl_program(self, pdl_program: Program) -> int:
        output_file = Path(self.pdl_file.parent, "optimized_" + self.pdl_file.name)
        return output_file.write_text(dump_program(pdl_program))

    def process(self, parallelism: int = 5):
        """
        1. Should figure out all mutable parts: the input variables, the text instructions, any "optimize" blocks.
        2. Set values for each part, in each trial.
        """
        input_variable_name = self.input_variable  # "trajectories"  # "demos"

        train_ds = self.dataset["train"]
        pdl_program = self.load_pdl()
        max_percent_passing = -1
        total = self.num_trials * self.test_set_size
        with tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
        ) as t:
            t.write(
                f"Starting optimization: {self.num_trials:,} trials, "
                f"{self.test_set_size:,} test set, "
                f"{self.num_demonstrations:,} demonstrations, {len(train_ds):,} training examples",
            )
            for trial in range(self.num_trials):  # TODO: work with a time budget?
                demonstrations = self.sample(train_ds, SamplingMethods.RANDOM_INDICES)
                p_pattern = self.sample_random_index(["cot", "react", "rewoo"])
                threads = []

                for index, qna in enumerate(self.test_set):
                    t.write(f"Pattern: {p_pattern}")
                    threads.append(
                        Gsm8kThread(
                            pdl_program.model_copy(),
                            qna,
                            demonstrations,
                            index,
                            trial,
                            self.model,
                            input_variable_name,
                            return_logprobs=False,
                            prompt_pattern=p_pattern,
                        ),
                    )
                matches = 0
                exceptions = []
                results = []
                for index, result in enumerate(execute_threads(parallelism, threads)):
                    gsm8k_output: Gsm8kOutput = result
                    # TODO: it would be nice if different trials can run in parallel
                    results.append(gsm8k_output)

                    if gsm8k_output.exception:
                        exceptions.append(gsm8k_output.exception)

                    matches += int(gsm8k_output.matches)

                    if gsm8k_output.input_logprobs is not None:
                        self.trial_logprobs.append(
                            gsm8k_output.input_logprobs.input_logprobs,
                        )
                    p_passing = matches / (index + 1)
                    t.update(1)
                t.write(f"----\nTrial ({trial} / {self.num_trials})")
                t.write(
                    f"Percentage passing: {p_passing:.0%} ({len(exceptions)} exceptions)",
                )
                self.trial_metrics.append(p_passing)
                # self.trial_demo_logprobs.append()

                if p_passing > max_percent_passing:
                    self.best_demos = gsm8k_output.scope[input_variable_name]

        pdl_program.root.defs[input_variable_name] = DataBlock(
            data=self.best_demos,
        )  # yaml.dump(self.best_demos)
        self.save_pdl_program(pdl_program)
        tqdm.write("Best few shots")
        tqdm.write(yaml.dump(self.best_demos))
        tqdm.write(
            f"Starting optimization: {self.num_trials:,} trials, "
            f"{self.test_set_size:,} test set, "
            f"{self.num_demonstrations:,} demonstrations, {len(train_ds):,} training examples",
        )
        tqdm.write(f"accuracies = {self.trial_metrics}")
        input_probs = self.trial_logprobs
        print("Shape =", [s.shape[0] for s in input_probs])
        # print("Min =", [np.min(s) for s in input_probs])
        # print("Max =", [ np.max(s) for s in input_probs])
        # print("Mean =", [np.mean(s) for s in input_probs])
        # print("Gmean =", [gmean(s) for s in input_probs])
        # print("Entropy =", [entropy(s) for s in input_probs])

        # input_probs = [s / s.sum(0) for s in input_probs]
        # print("norm_Min =", [np.min(s) for s in input_probs])
        # print("norm_Max =", [np.max(s) for s in input_probs])
        # print("norm_Mean =", [np.mean(s) for s in input_probs])
        # print("norm_Gmean =", [gmean(s) for s in input_probs])
        # print("norm_Entropy =", [entropy(s) for s in input_probs])

    def process_single(self):
        return self.process_parallel(1)


class TrialResults(list):
    pass


@dataclass
class CandidateResult:
    """Stores the result(s) of the evaluation of one candidate."""

    candidate: dict | None
    input_model_response: ModelResponse | None
    results: TrialResults | list | None
    metric: float | int | None


class Gsm8kOptimizer(Optimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


class FEVEROptimizer(Optimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


class EvalPlusOptimizer(Optimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


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
    ):
        super().__init__()
        self.pdl_program = pdl_program
        self.example = example
        self.candidate = candidate
        self.index = index
        self.return_logprobs = return_logprobs

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
        scope = None
        result = None
        match = False
        truth = self.example["answer"]  # HARDCODED

        try:
            state = InterpreterState(yield_output=False)
            scope = self.get_scope()

            result, document, scope, trace = process_prog(
                state,
                scope,
                self.pdl_program,
            )

            if DEBUG:
                print(document)

            if self.index == 0 and self.return_logprobs:
                model_input = get_seq_logprobs(
                    self.model,
                    scope["demonstrations"],  # HARDCODED
                )
            answer = extract_math_answer(document)

            if answer is None:
                print(document)
        except Exception as e:
            print(e)
            exception = e

        match = answer == truth or document.endswith(str(truth))

        return Gsm8kOutput(
            pdl_program=self.pdl_program,
            matches=match,
            exception=exception,
            input_logprobs=model_input,
            scope=scope,
            pdl_result=result,
            pdl_document=document,
            answer=answer,
            groundtruth=truth,
        )


class PDLOptimizer:
    def __init__(
        self,
        pdl_path: Path,
        # dataset_name: str,
        dataset,
        split: str,
        signature: str,
        metric: Callable[[str], float],  # metric takes model output
        prompt_patterns: list[str],
        tools: list[str],
        parallelism: int,
        num_demonstrations: int,
        starting_test_set_size: int,
        ending_test_set_size: int,
        max_candidates: int,
    ):
        self.pdl_path = pdl_path
        # self.dataset_name = dataset_name
        self.split = split
        self.signature = signature
        self.metric = metric
        self.prompt_patterns = prompt_patterns
        self.tools = tools
        self.parallelism = parallelism
        self.num_demonstrations = num_demonstrations
        self.starting_test_set_size = starting_test_set_size
        self.ending_test_set_size = ending_test_set_size
        self.max_candidates = max_candidates

        # Load
        self.dataset = dataset  # load_dataset(self.dataset_name, split=self.split)
        assert {"train", "test"} <= set(self.dataset.keys())
        self.parse_signature()
        self.pdl_program = self.load_pdl(self.pdl_path)

    def load_pdl(self, path: Path) -> Program:
        with (
            path.open(encoding="utf-8") as pdl,
        ):
            return Program.model_validate(yaml.safe_load(pdl))

    def parse_signature(self):
        inputs, _, outputs = self.signature.partition("->")
        self._inputs = [i.strip() for i in inputs.split(",")]
        self._outputs = [i.strip() for i in inputs.split(",")]

    def verify_signature(self):
        cols = [*self._inputs, *self._outputs]
        assert all(c in self.dataset["train"].column_names for c in cols)
        assert all(c in self.dataset["test"].column_names for c in cols)

    def sample_random_indices(self, dataset) -> Dataset:
        demo_indices = rng.choice(
            len(dataset),
            size=self.num_demonstrations,
            replace=False,
        )
        return dataset.select(demo_indices)

    def sample_random_index(self, items: list):
        demo_indices = rng.choice(
            len(items),
            size=1,
            replace=False,
        )[0]
        return items[demo_indices]

    def sample_candidates(self, num_candidates: int):
        return [
            {
                "demonstrations": self.sample_random_indices(self.dataset["train"]),
                "prompt_pattern": self.sample_random_index(self.prompt_patterns),
                "model": str(Models.granite_34b_code_instruct),
            }
            for _ in range(num_candidates)
        ]

    def evaluate(
        self,
        candidate: dict,
        test_set: list[dict],
    ) -> CandidateResult:  # fitness
        self.pbar.write(
            f"Test set size: {len(test_set)} Pattern: {candidate['prompt_pattern']}"
        )
        p_passing = 0
        threads = []

        for index, example in enumerate(test_set):
            threads.append(
                Gsm8kTrialThread(
                    pdl_program=self.pdl_program.model_copy(),
                    example=example,
                    candidate=candidate,
                    index=index,
                    return_logprobs=False,
                ),
            )

        matches = 0
        exceptions = []
        results = []
        input_logprobs = None
        for index, result in enumerate(execute_threads(self.parallelism, threads)):
            # for index, trial in enumerate(threads):
            # gsm8k_output: Gsm8kOutput = trial.run()
            gsm8k_output: Gsm8kOutput = result
            # TODO: it would be nice if different trials can run in parallel
            self.pbar.write(
                f"Answer: {gsm8k_output.answer} Ground truth: {gsm8k_output.groundtruth} Match: {gsm8k_output.matches}"
            )

            results.append(gsm8k_output)

            if gsm8k_output.exception:
                exceptions.append(gsm8k_output.exception)

            matches += int(gsm8k_output.matches)

            if gsm8k_output.input_logprobs is not None:
                input_logprobs = gsm8k_output.input_logprobs
            p_passing = matches / (index + 1)
            self.pbar.update(1)

        self.pbar.write(
            f"Matches: {matches} Accuracy: {p_passing} Exceptions: {len(exceptions)}"
        )
        return CandidateResult(
            candidate=candidate,
            input_model_response=input_logprobs,
            results=results,
            metric=p_passing,
        )

    def run(self):
        """
        1. Determine all optimizable parts of input
        2. Sample a random combination
        3. Run the PDL program i.e. evaluate it (threaded) against subset of test
        4. Run the output through the metric function
        5. Discard half the combinations, double the test set size
        6. Repeat.

        First sample up to t candidates, and up to 10% of test set size
        Eval
        Keep the top 50% candidates, double test set size
        Repeat
        """
        max_candidates = self.max_candidates  # "trials"
        candidates = self.sample_candidates(max_candidates)  # sample
        scores = []
        num_candidates = min(len(candidates), max_candidates)
        max_iterations = 10000
        starting_test_set_size = self.starting_test_set_size
        ending_test_set_size = self.ending_test_set_size
        num_iterations = ceil(log2(num_candidates))
        print(
            f"With {num_candidates} candidates, est. {num_iterations} iterations to find best candidate."
        )

        total = (num_iterations - 1) * num_candidates * starting_test_set_size
        self.pbar = tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
        )

        test_set_multiplier = 2#ceil((ending_test_set_size / starting_test_set_size) ** (
        #    1 / (num_iterations - 1)
        #))  # or 2
        
        for _i in range(max_iterations):
            if _i > num_iterations:
                self.pbar.write("Exceeded predicted iterations!!!")
            # Step 1: Evaluate all candidates on the current test set
            # scores = [
            #     (candidate, self.evaluate(candidate, starting_test_set_size))
            #     for candidate in candidates[:num_candidates]
            # ]
            if starting_test_set_size < 1:
                self.pbar.write("Starting test set less than 1!!!")
                break

            self.pbar.write(
                f"Evaluating {num_candidates} candidates, with {self.num_demonstrations} examples, on {starting_test_set_size} examples..."
            )
            scores: list[CandidateResult] = [
                self.evaluate(
                    candidate,
                    self.dataset["test"].select(range(starting_test_set_size)),
                )
                for candidate in candidates[:num_candidates]
            ]

            self.pbar.write(f"Sorting {num_candidates} candidates...")
            # Step 2: Sort candidates by their scores in descending order
            scores.sort(key=lambda x: x.metric, reverse=True)
            self.pbar.write(f"{_i} Candidate scores: {[x.metric for x in scores ]}")

            # Step 3: Keep the top 50% of candidates
            num_candidates = max(1, num_candidates // 2)
            scores = scores[:num_candidates]
            candidates = [r.candidate for r in scores]

            # Step 4: Double the test set size for the next iteration
            starting_test_set_size = min(
                starting_test_set_size * test_set_multiplier,
                # int(0.1 * len(candidates)),
                ending_test_set_size,
            )

            # If only one candidate is left, stop
            if len(candidates) == 1:
                self.pbar.write("Only 1 candidate left. Ending...")
                break
        self.pbar.close()
        print(
            "Winner:",
            {
                k: v
                for k, v in scores[0].results[0].scope.items()
                if k in ["demonstrations", "prompt_pattern"]
            },
        )
        print("Score:", scores[0].metric)
        return candidates[0]


class Gsm8kPDLOptimizer(PDLOptimizer):
    def __init__(self, *args, **kwargs) -> None:
        # pdl_program: Path,
        # dataset_name: str,
        # split: str,
        # signature: str,
        # metric: callable[[str], float],  # metric takes model output
        # prompt_patterns: list[str],
        # tools: list[str],

        super().__init__(
            pdl_path="examples/gsm8k/math-fewshot-cot.pdl",
            dataset_name="./var/gsm8k",
            split="train[:50]+test[:10]",
            signature="question->reasoning,answer",
            metric=self.accuracy,
            prompt_patterns=["react"],
            tools=["Search"],
        )

    def accuracy(self, answer) -> float:
        pass


class FEVERPDLOptimizer(PDLOptimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


class EvalPlusPDLOptimizer(PDLOptimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--bench",
        "-b",
        help="benchmark",
    )
    parser.add_argument(
        "--trials",
        "-t",
        type=int,
        help="Number of trials (samples) of demonstrations to evaluate.",
        default=3,
    )
    parser.add_argument(
        "--num_demos",
        "-k",
        type=int,
        help="Number of demonstrations (examples) in fewshot.",
        default=1,
    )
    parser.add_argument(
        "--test_set_size",
        "-s",
        type=int,
        help="Size of test set to evaluate against",
        default=1,
    )
    parser.add_argument(
        "--starting_test_set_size",
        "-st",
        type=int,
        help="Size of test set to evaluate against",
        default=1,
    )
    parser.add_argument(
        "--end_test_set_size",
        "-et",
        type=int,
        help="Size of test set to evaluate against",
        default=100,
    )
    parser.add_argument(
        "--input_variable",
        "-v",
        type=str,
        help="Variable name",
        default="demonstrations",
    )
    parser.add_argument(
        "--parallelism",
        "-p",
        type=int,
        help="Number of threads",
        default=5,
    )
    parser.add_argument(
        "pdl_file",
        type=Path,
        help="Path to a PDL file to optimize",
    )

    args = parser.parse_args()

    if args.bench == "gsm-fewshot":
        # Optimizer(
        #     dataset=load_from_disk("var/gsm8k_proc"),
        #     pdl_file=args.pdl_file,
        #     trials=args.trials,
        #     k=args.num_demos,
        #     test_set_size=args.test_set_size,
        #     input_variable=args.input_variable,
        # ).process(parallelism=args.parallelism)

        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/gsm8k_proc"),
            split="train+test",
            signature="question->answer",
            metric=lambda: 0.0,
            prompt_patterns=[
                "react",
                # "cot", 
                # "rewoo"
                ],
            tools=[],
            parallelism=args.parallelism,
            num_demonstrations=args.num_demos,
            starting_test_set_size=args.starting_test_set_size,
            ending_test_set_size=args.end_test_set_size,
            max_candidates=args.trials,
        ).run()
    if args.bench == "gsm-pal":
        gsm8k = load_from_disk("gsm8k")
        gsm8k["train"] = Dataset.from_json("examples/gsm8k/demos.json")

        Gsm8kOptimizer(
            dataset=gsm8k,
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process()
    if args.bench == "gsm-evolve":
        Gsm8kOptimizer(
            dataset=load_from_disk("gsm8k"),
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).evolve()
