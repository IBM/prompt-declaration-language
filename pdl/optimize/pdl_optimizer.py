import json
import string
import sys
import time
from enum import Enum
from math import ceil, log2
from pathlib import Path

import yaml
from datasets import DatasetDict
from duration_parser import parse as parse_duration
from numpy.random import default_rng
from rich.table import Table
from tqdm.rich import tqdm

from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.util import (
    CandidateResult,
    PDLThread,
    TrialOutput,
    console,
    execute_threads,
)
from pdl.pdl_ast import DataBlock, Program
from pdl.pdl_dumper import dump_program

rng = default_rng()


class BudgetPolicy(Enum):
    NONE = 0
    DURATION = 1
    ITERATIONS = 2


class PDLOptimizer:
    def __init__(
        self,
        pdl_path: Path,
        dataset: DatasetDict,
        config: OptimizationConfig,
        # split: str,
        # signature: str,
        # metric: Callable[[str], float],  # metric takes model output
        # prompt_patterns: list[str],
        # tools: list[str],
        # parallelism: int,
        # num_demonstrations: int,
        # starting_test_set_size: int,
        # ending_test_set_size: int,
        # max_candidates: int,
        # timeout: int,
        trial_thread: type[PDLThread],
        # budget_growth: str,
        # test_set: str,
        # train_set: str,
        yield_output: bool,
        # budget: str | None,
        experiment_path: Path,
        # shuffle_test: bool,
    ):
        self.pdl_path = pdl_path
        # self.split = split
        # self.signature = signature
        # self.metric = metric
        # self.prompt_patterns = prompt_patterns
        # self.tools = tools
        self.trial_thread = trial_thread
        self.yield_output = yield_output

        self.config = config
        self.parallelism = config.parallelism
        self.num_demonstrations = config.num_demonstrations
        self.starting_test_set_size = config.initial_test_set_size
        self.ending_test_set_size = config.max_test_set_size
        self.max_candidates = config.num_candidates
        self.timeout = config.timeout
        self.budget_growth = config.budget_growth
        self.train_set_name = config.train_set_name
        self.test_set_name = config.test_set_name
        self.budget = config.budget
        self.shuffle_test = config.shuffle_test

        self.experiment_path = experiment_path
        self.experiment_uuid = self.random_uuid()
        self.experiment_log = {"iterations": []}

        # Load
        self.dataset = dataset  # load_dataset(self.dataset_name, split=self.split)
        assert {self.train_set_name, self.test_set_name} <= set(self.dataset.keys())
        # self.parse_signature()
        self.parse_budget()
        self.pdl_program = self.load_pdl(self.pdl_path)

    def parse_budget(self):
        if self.budget is None:
            self.budget_policy = BudgetPolicy.NONE
            return

        try:
            iterations = int(self.budget)
        except ValueError:
            iterations = None
        else:
            self.budget_policy = BudgetPolicy.ITERATIONS
            self.max_iterations = iterations
            return

        if iterations is None:
            try:
                duration = parse_duration(self.budget)
            except ValueError:
                duration = None
            else:
                self.budget_policy = BudgetPolicy.DURATION
                self.time_budget = duration

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
        assert all(c in self.dataset[self.train_set_name].column_names for c in cols)
        assert all(c in self.dataset[self.test_set_name].column_names for c in cols)

    def sample_random_indices(self, dataset: list, size: int) -> list:
        return rng.choice(
            len(dataset),
            size=size,
            replace=False,
        ).tolist()

    def sample_random_index(self, items: list):
        return items[rng.choice(len(items))]

    def random_uuid(self, k: int = 8) -> str:
        alphabet = string.ascii_lowercase + string.digits
        return "".join(rng.choice(list(alphabet), size=k))

    def sample_candidates(self, num_candidates: int, demo_indices: list | None = None):
        demo_name = self.config.demonstrations_variable_name
        candidates = []
        for _ in range(num_candidates):
            if demo_indices is None:
                demo_indices = self.sample_random_indices(
                    self.dataset[self.train_set_name],
                    size=self.num_demonstrations,
                )
            variable_instance = {
                k: self.sample_random_index(v) for k, v in self.config.variables.items()
            }
            candidate = {
                "uuid": self.random_uuid(),
                f"{demo_name}_indices": demo_indices,
                f"{demo_name}": self.dataset[self.train_set_name].select(demo_indices),
            }

            candidate |= variable_instance
            candidates.append(candidate)

        return candidates

    def save_pdl_program(self, pdl_program: Program) -> int:
        output_file = Path(self.pdl_path.parent, "optimized_" + self.pdl_path.name)
        return output_file.write_text(dump_program(pdl_program))

    def save_experiment(self):
        if not self.experiment_path.exists():
            self.experiment_path.mkdir(parents=True, exist_ok=True)
        exp_file = self.experiment_path / f"{self.experiment_uuid}.json"

        with exp_file.open("w") as f:
            json.dump(self.experiment_log, f)

        return exp_file

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
        exp_file = None
        max_candidates = self.max_candidates
        candidates = self.sample_candidates(max_candidates)  # sample
        scores = []
        num_candidates = min(len(candidates), max_candidates)
        test_set_size = len(self.dataset[self.test_set_name])

        max_iterations = (
            self.max_iterations
            if self.budget_policy == BudgetPolicy.ITERATIONS
            else sys.maxsize  # no limit on iterations
        )

        starting_test_set_size = min(self.starting_test_set_size, test_set_size)
        ending_test_set_size = self.ending_test_set_size
        num_iterations = ceil(log2(num_candidates))

        if self.budget_growth == "double":
            test_set_multiplier = 2
        elif self.budget_growth == "to_max":
            test_set_multiplier = ceil(
                (ending_test_set_size / starting_test_set_size)
                ** (1 / (num_iterations - 1)),
            )

        total = max(num_iterations - 1, 1) * num_candidates * starting_test_set_size

        table = Table(title="PDL Optimizer", show_header=False, border_style="green")
        table.add_row("Max candidates", f"{max_candidates:,}")
        table.add_row("Num. candidates", f"{num_candidates:,}")
        table.add_row("Starting test set size", f"{starting_test_set_size:,}")
        table.add_row("Max test set size", f"{ending_test_set_size:,}")
        table.add_row("Num. iterations", f"{num_iterations:,}")
        table.add_row("Total evaluations", f"{total:,}")
        table.add_row("Num. threads", f"{self.parallelism:,}")
        table.add_row("Test set multiplier", f"{test_set_multiplier:,}")
        table.add_row("Shuffle test set", f"{self.shuffle_test}")
        match self.budget_policy:
            case BudgetPolicy.NONE:
                table.add_row("Budget policy", "None")
            case BudgetPolicy.ITERATIONS:
                table.add_row("Budget policy", f"{self.max_iterations:,} iterations")
            case BudgetPolicy.DURATION:
                table.add_row("Budget policy", f"{self.time_budget:,.0f} seconds")
        table.add_section()
        for variable, values in self.config.variables.items():
            table.add_row(variable, f"{values}")
        console.log(table)

        self.experiment_log["config"] = {
            "thread_class": str(self.trial_thread),
            "max_candidates": max_candidates,
            "num_candidates": num_candidates,
            "starting_test_set_size": starting_test_set_size,
            "ending_test_set_size": ending_test_set_size,
            "num_iterations": num_iterations,
            "total_evaluations": total,
            "num_threads": self.parallelism,
            "test_set_multiplier": test_set_multiplier,
            "variables": self.config.variables,
            "budget": self.budget,
            "shuffle_test": self.shuffle_test,
            "start_time": time.time(),
            "candidates": [
                {
                    k: v
                    for k, v in c.items()
                    if k != self.config.demonstrations_variable_name
                }
                for c in candidates
            ],  # we don't want to serialize the Dataset object
        }

        self.pbar = tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
            options={"console": console},
        )

        if self.shuffle_test:
            # We generate a set of random indices to avoid always using the same
            test_set_indices = rng.choice(
                len(self.dataset[self.test_set_name]),
                size=min(len(self.dataset[self.test_set_name]), ending_test_set_size),
                replace=False,
            ).tolist()
        else:
            test_set_indices = list(
                range(
                    min(len(self.dataset[self.test_set_name]), ending_test_set_size),
                ),
            )

        start_time = time.time()

        current_test_set_size = starting_test_set_size

        for iteration in range(max_iterations):
            if iteration > num_iterations:
                console.log("Exceeded predicted iterations!!!")

            if current_test_set_size < 1:
                console.log("Starting test set less than 1!!!")
                break

            if self.budget_policy == BudgetPolicy.DURATION:
                end_time = time.time()
                runtime = end_time - start_time
                if runtime > self.time_budget:
                    console.log(f"Exhausted time budget {runtime:,.0f} seconds")
                    break

            selected_candidates = candidates[:num_candidates]

            table = Table(title="Iteration", show_header=False)
            table.add_row("Index", f"{iteration:,}")
            table.add_row("Test set size", f"{current_test_set_size:,}")
            table.add_row("Num. candidates", f"{num_candidates:,}")
            console.log(table)

            # Step 1: Evaluate all candidates on the current test set
            scores: list[CandidateResult] = [
                self.evaluate(
                    candidate,
                    self.dataset[self.test_set_name].select(
                        test_set_indices[:current_test_set_size],
                    ),
                )
                for candidate in selected_candidates
            ]

            self.experiment_log["iterations"].append(
                {
                    "iteration": iteration,
                    "current_test_set_size": current_test_set_size,
                    "num_candidates": num_candidates,
                    "test_set_indices": test_set_indices[:current_test_set_size],
                    "selected_candidates_uuids": [
                        x["uuid"] for x in selected_candidates
                    ],
                    "candidates": [c.to_dict() for c in scores],
                    "timestamp": time.time(),
                },
            )

            exp_file = self.save_experiment()

            console.log(f"Sorting {num_candidates} candidates...")

            # Step 2: Sort candidates by their scores in descending order
            scores.sort(key=lambda x: x.metric, reverse=True)

            scores_str = {x.candidate["uuid"]: f"{x.metric:.2%}" for x in scores}
            console.log(f"{iteration} Candidate id and scores: {scores_str}")

            # Step 3: Keep the top 50% of candidates
            num_candidates = max(1, num_candidates // 2)
            scores = scores[:num_candidates]
            candidates = [r.candidate for r in scores]

            # Step 4: Multiply the test set size for the next iteration
            current_test_set_size = min(
                current_test_set_size * test_set_multiplier,
                ending_test_set_size,
            )

            # If only one candidate is left, stop
            if len(candidates) == 1:
                console.log("Only 1 candidate left. Ending...")
                break

        self.pbar.close()

        if len(scores) > 0 and len(scores[0].results) > 0:
            winner: CandidateResult = scores[0]
            winner_result: TrialOutput = winner.results[0]
            winner_scope = winner_result.scope

            winner_summary = {
                k: v
                for k, v in winner_scope.items()
                if k in self.config.get_variable_names()
            }

            self.experiment_log["winner_summary"] = winner_summary

            console.log("Winner:\n", yaml.dump(winner_summary))
            console.log(f"Score: {winner.metric:.2f}")
            console.log(f"Saved exp. log to {exp_file}")

            for variable, value in winner_summary.items():
                if isinstance(value, str):
                    winner_result.pdl_program.root.defs[variable] = winner_scope[
                        variable
                    ]
                else:
                    winner_result.pdl_program.root.defs[variable] = DataBlock(
                        data=winner_scope[variable],
                    )

            self.save_pdl_program(winner_result.pdl_program)
        else:
            console.log("Error, no results")

    def evaluate(
        self,
        candidate: dict,
        test_set: list[dict],
    ) -> CandidateResult:
        table = Table(title="Evaluation", show_header=False)
        table.add_row("Test set size", f"{len(test_set):,}")
        table.add_section()
        printable_dict = {}
        for k, v in candidate.items():
            if isinstance(v, str):
                printable_dict[k] = v
            elif hasattr(v, "__len__"):
                printable_dict[k] = f"{len(v):,}"
            else:
                printable_dict[k] = f"{v}"
            table.add_row(f"{k}", printable_dict[k])

        console.log(table)

        p_passing = 0

        threads = [
            self.trial_thread(
                pdl_program=self.pdl_program.model_copy(),
                example=example,
                candidate=candidate,
                index=index,
                return_logprobs=False,
                timeout=self.timeout,
                yield_output=self.yield_output,
                config=self.config,
            )
            for index, example in enumerate(test_set)
        ]

        matches = 0
        exception_count = 0
        timeout_count = 0
        exceptions = []
        results = []
        input_logprobs = None
        start_time = time.time()

        for index, result in enumerate(
            execute_threads(self.parallelism, threads),
        ):
            if isinstance(result, BaseException):
                exceptions.append(result)
                if isinstance(
                    result,
                    TimeoutError,
                ):
                    timeout_count += 1
                else:
                    exception_count += 1
                    console.log("Progressed on exception")
                    console.log(result)
            elif isinstance(result, TrialOutput):
                answer = (
                    round(result.answer, 2)
                    if isinstance(result.answer, float)
                    else result.answer
                )
                console.log(
                    f"Answer: {answer} Ground truth: {result.groundtruth} Match: {result.correct}",
                )

                results.append(result)

                if result.exception:
                    exceptions.append(result.exception)

                matches += int(result.correct)

                if result.input_logprobs is not None:
                    input_logprobs = result.input_logprobs
                p_passing = matches / (index + 1)

            self.pbar.update(1)

        end_time = time.time()
        runtime = end_time - start_time
        console.log(
            f"Matches: {matches:,} "
            f"Accuracy: {p_passing:.2%} "
            f"Exceptions: {len(exceptions):,} "
            f"({timeout_count} timeout, {exception_count} other) ",
            f"Total: {index+1:,}",
        )
        runtimes = [round(x.runtime, 2) for x in results]
        console.log(f"Runtimes: {runtimes}, total {runtime:,.2f}")

        return CandidateResult(
            candidate=candidate,
            input_model_response=input_logprobs,
            results=results,
            metric=p_passing,
            runtime=runtime,
        )

    def benchmark(self, test_set_size: int):
        if self.num_demonstrations <= 0:
            demo_size = len(self.dataset[self.train_set_name])
        else:
            demo_size = self.num_demonstrations

        if test_set_size <= 0:
            test_set_size = len(self.dataset[self.test_set_name])

        self.pbar = tqdm(
            total=test_set_size,
            colour="green",
            smoothing=0.3,
            options={"console": console},
        )
        start_time = time.time()
        candidate = self.sample_candidates(1, demo_indices=list(range(demo_size)))[0]

        scores: list[CandidateResult] = [
            self.evaluate(
                candidate,
                self.dataset[self.test_set_name].select(range(test_set_size)),
            ),
        ]

        end_time = time.time()

        self.experiment_log["results"] = {
            "thread_class": str(self.trial_thread),
            "num_threads": self.parallelism,
            "test_set_size": test_set_size,
            "num_candidates": 1,
            "num_demos": demo_size,
            "candidates": [c.to_dict() for c in scores],
            "timestamp": time.time(),
            "runtime": end_time - start_time,
        }

        exp_file = self.save_experiment()

        self.pbar.close()
        console.log(f"Score: {scores[0].metric:.4%}")
        console.log(f"Saved exp. log to {exp_file}")
