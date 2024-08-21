import random
import string
from collections.abc import Callable
from math import ceil, log2
from pathlib import Path
import time

import yaml
from datasets import Dataset
from numpy.random import default_rng
from rich.table import Table
from tqdm.rich import tqdm

from pdl.optimize.util import (
    CandidateResult,
    Models,
    TrialOutput,
    console,
    execute_threads,
)
from pdl.pdl_ast import DataBlock, Program
from pdl.pdl_dumper import dump_program

rng = default_rng()


class PDLOptimizer:
    def __init__(
        self,
        pdl_path: Path,
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
        timeout: int,
        trial_thread,
        budget_growth: str,
    ):
        self.pdl_path = pdl_path
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
        self.timeout = timeout
        self.trial_thread = trial_thread
        self.budget_growth = budget_growth

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
        alphabet = string.ascii_lowercase + string.digits
        return [
            {
                "uuid": "".join(random.choices(alphabet, k=8)),
                "demonstrations": self.sample_random_indices(self.dataset["train"]),
                "prompt_pattern": self.sample_random_index(self.prompt_patterns),
                "model": str(Models.granite_34b_code_instruct),
            }
            for _ in range(num_candidates)
        ]

    def save_pdl_program(self, pdl_program: Program) -> int:
        output_file = Path(self.pdl_path.parent, "optimized_" + self.pdl_path.name)
        return output_file.write_text(dump_program(pdl_program))

    def evaluate(
        self,
        candidate: dict,
        test_set: list[dict],
    ) -> CandidateResult:
        table = Table(title="Evaluation", show_header=False)
        table.add_row("Test set size", f"{len(test_set):_}")
        table.add_section()
        printable_dict = {}
        for k, v in candidate.items():
            if isinstance(v, str):
                printable_dict[k] = v
            elif hasattr(v, "__len__"):
                printable_dict[k] = f"{len(v):_}"
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
            execute_threads(self.parallelism, threads, self.timeout),
        ):
            if isinstance(result, BaseException):
                self.pbar.update(1)
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
                continue
            gsm8k_output: TrialOutput = result

            answer = (
                round(gsm8k_output.answer, 2)
                if isinstance(gsm8k_output.answer, float)
                else gsm8k_output.answer
            )
            console.log(
                f"Answer: {answer} Ground truth: {gsm8k_output.groundtruth} Match: {gsm8k_output.matches}",
            )

            results.append(gsm8k_output)

            if gsm8k_output.exception:
                exceptions.append(gsm8k_output.exception)

            matches += int(gsm8k_output.matches)

            if gsm8k_output.input_logprobs is not None:
                input_logprobs = gsm8k_output.input_logprobs
            p_passing = matches / (index + 1)
            self.pbar.update(1)

        end_time = time.time()
        runtime = end_time - start_time
        console.log(
            f"Matches: {matches:_} Accuracy: {p_passing:.2%} Exceptions: {len(exceptions):_} ({timeout_count} timeout, {exception_count} other)",
        )
        runtimes = [round(x.runtime, 2) for x in results]
        console.log(f"Runtimes: {runtimes}, total {runtime:,.2f}")

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
        max_candidates = self.max_candidates
        candidates = self.sample_candidates(max_candidates)  # sample
        scores = []
        num_candidates = min(len(candidates), max_candidates)
        max_iterations = 10000
        starting_test_set_size = self.starting_test_set_size
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
        table.add_row("Max candidates", f"{max_candidates:_}")
        table.add_row("Num. candidates", f"{num_candidates:_}")
        table.add_row("Starting test set size", f"{starting_test_set_size:_}")
        table.add_row("Max test set size", f"{ending_test_set_size:_}")
        table.add_row("Num. iterations", f"{num_iterations:_}")
        table.add_row("Total evaluations", f"{total:_}")
        table.add_row("Num. threads", f"{self.parallelism:_}")
        table.add_row("Test set multiplier", f"{test_set_multiplier:_}")
        console.log(table)

        self.pbar = tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
            options={"console": console},
        )

        # We generate a set of random indices to avoid always using the same
        test_set_indices = rng.choice(
            len(self.dataset["test"]),
            size=min(len(self.dataset["test"]), ending_test_set_size),
            replace=False,
        )
        # alternatively, range(min(len(self.dataset["test"]), ending_test_set_size)) works too

        for iteration in range(max_iterations):
            if iteration > num_iterations:
                console.log("Exceeded predicted iterations!!!")

            if starting_test_set_size < 1:
                console.log("Starting test set less than 1!!!")
                break

            selected_candidates = candidates[:num_candidates]

            table = Table(title="Iteration", show_header=False)
            table.add_row("Index", f"{iteration:_}")
            table.add_row("Test set size", f"{starting_test_set_size:_}")
            table.add_row("Num. candidates", f"{num_candidates:_}")
            console.log(table)

            # Step 1: Evaluate all candidates on the current test set
            scores: list[CandidateResult] = [
                self.evaluate(
                    candidate,
                    self.dataset["test"].select(
                        test_set_indices[:starting_test_set_size],
                    ),
                )
                for candidate in selected_candidates
            ]

            console.log(f"Sorting {num_candidates} candidates...")

            # Step 2: Sort candidates by their scores in descending order
            scores.sort(key=lambda x: x.metric, reverse=True)

            scores_str = {x.candidate["uuid"]: round(x.metric, 2) for x in scores}
            console.log(f"{iteration} Candidate id and scores: {scores_str}")

            # Step 3: Keep the top 50% of candidates
            num_candidates = max(1, num_candidates // 2)
            scores = scores[:num_candidates]
            candidates = [r.candidate for r in scores]

            # Step 4: Multiply the test set size for the next iteration
            starting_test_set_size = min(
                starting_test_set_size * test_set_multiplier,
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
                if k in ["demonstrations", "prompt_pattern"]
            }

            console.log("Winner:\n", yaml.dump(winner_summary))
            console.log("Score:", f"{winner.metric:.2f}")

            winner_result.pdl_program.root.defs["demonstrations"] = DataBlock(
                data=winner_scope["demonstrations"],
            )
            winner_result.pdl_program.root.defs["prompt_pattern"] = winner_scope[
                "prompt_pattern"
            ]
            self.save_pdl_program(winner_result.pdl_program)
        else:
            console.log("Error, no results")

    def benchmark(self, test_set_size: int):
        self.pbar = tqdm(
            total=test_set_size,
            colour="green",
            smoothing=0.3,
            options={"console": console},
        )
        candidate = self.sample_candidates(1)[0]
        scores: list[CandidateResult] = [
            self.evaluate(
                candidate,
                self.dataset["test"].select(range(test_set_size)),
            ),
        ]
        self.pbar.close()
        console.log(f"{scores[0].metric:.4%}")
