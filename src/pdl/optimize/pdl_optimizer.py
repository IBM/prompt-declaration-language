import argparse
import itertools
import json
import logging
import string
import sys
import time
import warnings
from enum import Enum
from math import ceil, log2
from pathlib import Path
from typing import Any

import yaml
from datasets import load_dataset
from datasets.arrow_dataset import Dataset
from datasets.dataset_dict import DatasetDict
from duration_parser import parse as parse_duration
from numpy.random import default_rng
from rich.logging import RichHandler
from rich.table import Table
from tqdm import TqdmExperimentalWarning
from tqdm.rich import tqdm

from pdl.optimize.config_parser import JsonlDataset, OptimizationConfig
from pdl.optimize.optimizer_evaluator import OptimizerEvaluator
from pdl.optimize.pdl_evaluator import PdlEvaluator
from pdl.optimize.util import CandidateResult, TrialOutput, console, execute_threads
from pdl.pdl_ast import AdvancedBlockType, DataBlock, Program
from pdl.pdl_dumper import dump_program_exclude_internals

warnings.filterwarnings("ignore", category=TqdmExperimentalWarning)
FORMAT = "%(message)s"
logger = logging.getLogger("rich")
logger.setLevel("INFO")
logger.addHandler(RichHandler())
rng = default_rng()


def resave_pdl(input_path: Path, output_path: Path, state: dict) -> int:
    with (input_path.open(encoding="utf-8") as pdl,):
        pdl_program = Program.model_validate(yaml.safe_load(pdl))
        if pdl_program.root is None or not isinstance(
            pdl_program.root,
            AdvancedBlockType,
        ):
            msg = "No root in PDL program"
            raise ValueError(msg)

    for variable, value in state.items():
        if isinstance(value, str):
            pdl_program.root.defs[variable] = state[variable]
        else:
            pdl_program.root.defs[variable] = DataBlock(
                data=state[variable],
            )

    return output_path.write_text(
        dump_program_exclude_internals(pdl_program),
        encoding="utf-8",
    )


class BudgetPolicy(Enum):
    NONE = 0
    DURATION = 1
    ITERATIONS = 2


class PDLOptimizer:
    # pylint: disable=too-many-instance-attributes,too-many-arguments,too-many-positional-arguments
    def __init__(
        self,
        dataset: DatasetDict,
        config: OptimizationConfig,
        trial_thread: type[OptimizerEvaluator],
        yield_output: bool,
        experiment_path: Path,
    ) -> None:
        self.trial_thread = trial_thread
        self.yield_output = yield_output

        self.config = config
        self.pdl_path = Path(config.pdl_path)
        self.parallelism = config.parallelism
        self.num_demonstrations = config.num_demonstrations
        self.starting_validation_set_size = config.initial_validation_set_size
        self.ending_validation_set_size = config.max_validation_set_size
        self.max_test_set_size = config.max_test_set_size
        self.max_candidates = config.num_candidates
        self.timeout = config.timeout
        self.budget_growth = config.budget_growth
        self.train_set_name = config.train_set_name
        self.test_set_name = config.test_set_name
        self.validation_set_name = config.validation_set_name
        self.budget = config.budget
        self.shuffle_validation = config.shuffle_test

        self.experiment_path = experiment_path
        self.experiment_uuid = config.experiment_prefix + self.random_uuid()
        self.experiment_log: dict[str, Any] = {"iterations": []}
        self.pbar = None
        self.candidate_results: dict[str, dict] = {}

        # Load
        self.dataset = dataset
        assert {
            self.train_set_name,
            self.test_set_name,
            self.validation_set_name,
        } <= set(self.dataset.keys())
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
        with path.open(encoding="utf-8") as pdl:
            return Program.model_validate(yaml.safe_load(pdl))

    def sample_random_indices(self, dataset: list, size: int) -> list[Any]:
        return list(
            rng.choice(  # pyright: ignore
                len(dataset),
                size=size,
                replace=False,
            ).tolist(),
        )

    def sample_random_index(self, items: list):
        return items[rng.choice(len(items))]

    def random_uuid(self, k: int = 8) -> str:
        alphabet = string.ascii_lowercase + string.digits
        return "".join(rng.choice(list(alphabet), size=k))

    def sample_candidates(
        self,
        num_candidates: int,
        demo_indices: list | None = None,
    ) -> list[dict[str, Any]]:
        demo_name = self.config.demonstrations_variable_name
        candidates = []

        num_demonstrations_set = {
            int(x) for x in self.config.variables.get("num_demonstrations", set())
        }

        if (
            "cot" in self.config.variables.get("prompt_pattern", [])
            and 0 in num_demonstrations_set
        ):
            cot_candidate = {
                k: self.sample_random_index(v) for k, v in self.config.variables.items()
            } | {
                "uuid": self.random_uuid(),
                f"{demo_name}_indices": [],
                f"{demo_name}": self.dataset[self.train_set_name].select([]),
                "prompt_pattern": "cot",
                "num_demonstrations": 0,
            }
            assert cot_candidate["prompt_pattern"] == "cot"
            assert cot_candidate["num_demonstrations"] == 0

            candidates.append(cot_candidate)

        zero_shots_seen = {"cot"}
        while len(candidates) < num_candidates:
            variable_instance = {
                k: self.sample_random_index(v) for k, v in self.config.variables.items()
            }
            if (
                variable_instance.get("num_demonstrations") == 0
                and variable_instance.get("prompt_pattern") is not None
            ):
                if variable_instance["prompt_pattern"] in zero_shots_seen:
                    continue
                zero_shots_seen.add(variable_instance["prompt_pattern"])

            num_demonstrations = int(
                variable_instance.get("num_demonstrations", self.num_demonstrations),
            )
            if demo_indices is None:
                demo_indices_used = self.sample_random_indices(
                    self.dataset[self.train_set_name],  # pyright: ignore
                    size=num_demonstrations,
                )
            else:
                demo_indices_used = demo_indices

            candidate = {
                "uuid": self.random_uuid(),
                f"{demo_name}_indices": demo_indices_used,
                f"{demo_name}": self.dataset[self.train_set_name].select(
                    demo_indices_used,
                ),
            }

            candidate |= variable_instance
            candidates.append(candidate)

        if (
            len(num_demonstrations_set) > 1  # check more than 1 option
            and 0 in num_demonstrations_set  # check zeroshot is an option
        ):
            zero_shotters = [
                x.get("uuid") for x in candidates if x.get("num_demonstrations") == 0
            ]
            variables_zs = self.config.variables.copy()
            variables_zs.pop("num_demonstrations", None)

            max_zs = len(list(itertools.product(*variables_zs.values())))

            if len(zero_shotters) > max_zs:
                logger.warning(
                    "More zero-shot candidates (%d) than expected (%d; "
                    "product of all variables). "
                    "Identical duplicated candidates may waste compute.",
                    len(zero_shotters),
                    max_zs,
                )

        assert len(candidates) == num_candidates
        return candidates

    def save_pdl_program(self, pdl_program: Program) -> int:
        output_file = Path(self.pdl_path.parent, "optimized_" + self.pdl_path.name)
        return output_file.write_text(
            dump_program_exclude_internals(pdl_program),
            encoding="utf-8",
        )

    def save_experiment(self):
        if not self.experiment_path.exists():
            self.experiment_path.mkdir(parents=True, exist_ok=True)
        exp_file = self.experiment_path / f"{self.experiment_uuid}.json"

        with exp_file.open("w") as f:
            try:
                json.dump(self.experiment_log, f)
            except TypeError:
                logger.warning("Unable to save experiment")  # TODO

        return exp_file

    def run(self) -> dict[str, Any]:
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
        candidates = self.sample_candidates(max_candidates)

        scores: list[CandidateResult] = []
        num_candidates = min(len(candidates), max_candidates)
        validation_set_size = len(self.dataset[self.validation_set_name])

        max_iterations = (
            self.max_iterations
            if self.budget_policy == BudgetPolicy.ITERATIONS
            else sys.maxsize  # no limit on iterations
        )

        starting_validation_set_size = min(
            self.starting_validation_set_size,
            validation_set_size,
        )
        ending_validation_set_size = self.ending_validation_set_size
        num_iterations = ceil(log2(num_candidates))

        validation_set_multiplier = 0
        if self.budget_growth == "double":
            validation_set_multiplier = 2
        elif self.budget_growth == "to_max":
            validation_set_multiplier = ceil(
                (ending_validation_set_size / starting_validation_set_size)
                ** (1 / (num_iterations - 1)),
            )

        total = (
            max(num_iterations - 1, 1) * num_candidates * starting_validation_set_size
        )

        combis = len(list(itertools.product(*self.config.variables.values())))
        table = Table(title="PDL Optimizer", show_header=False, border_style="green")
        table.add_row("Config combinations", f"{combis:,}")
        table.add_row("Max candidates", f"{max_candidates:,}")
        table.add_row("Num. candidates", f"{num_candidates:,}")
        table.add_row(
            "Starting validation set size",
            f"{starting_validation_set_size:,}",
        )
        table.add_row("Max validation set size", f"{ending_validation_set_size:,}")
        table.add_row("Num. iterations", f"{num_iterations:,}")
        table.add_row("Total evaluations", f"{total:,}")
        table.add_row("Num. threads", f"{self.parallelism:,}")
        table.add_row("Validation set multiplier", f"{validation_set_multiplier:,}")
        table.add_row("Shuffle validation set", f"{self.shuffle_validation}")
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
            "starting_validation_set_size": starting_validation_set_size,
            "ending_validation_set_size": ending_validation_set_size,
            "num_iterations": num_iterations,
            "total_evaluations": total,
            "num_threads": self.parallelism,
            "validation_set_multiplier": validation_set_multiplier,
            "variables": self.config.variables,
            "budget": self.budget,
            "shuffle_validation": self.shuffle_validation,
            "start_time": time.time(),
            "candidates": [
                {
                    k: v
                    for k, v in c.items()
                    if k != self.config.demonstrations_variable_name
                }
                for c in candidates
            ],  # we don't want to serialize the Dataset object
            "raw_config": self.config.model_dump(),
        }

        self.pbar = tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
            options={"console": console},
        )

        if self.pbar is None:
            raise ValueError("Progress bar not initialized")

        if self.shuffle_validation:
            # We generate a set of random indices to avoid always using the same
            validation_set_indices = list(
                rng.choice(
                    len(self.dataset[self.validation_set_name]),
                    size=min(
                        len(self.dataset[self.validation_set_name]),
                        ending_validation_set_size,
                    ),
                    replace=False,
                ),
            )
        else:
            validation_set_indices = list(
                range(
                    min(
                        len(self.dataset[self.validation_set_name]),
                        ending_validation_set_size,
                    ),
                ),
            )

        start_time = time.time()

        current_validation_set_size = starting_validation_set_size

        for iteration in range(max_iterations):
            if iteration > num_iterations:
                logger.info("Exceeded predicted iterations!!!")

            if current_validation_set_size < 1:
                logger.info("Starting validation set less than 1!!!")

            if self.budget_policy == BudgetPolicy.DURATION:
                end_time = time.time()
                runtime = end_time - start_time
                if runtime > self.time_budget:
                    logger.info("Exhausted time budget %.0f seconds", runtime)
                    break

            selected_candidates = candidates[:num_candidates]

            table = Table(title="Iteration", show_header=False)
            table.add_row("Index", f"{iteration:,}")
            table.add_row("Validation set size", f"{current_validation_set_size:,}")
            table.add_row("Num. candidates", f"{num_candidates:,}")
            console.log(table)

            # Step 1: Evaluate all candidates on the current validation set
            scores = [
                self.evaluate(
                    candidate,
                    self.dataset[self.validation_set_name].select(
                        validation_set_indices[:current_validation_set_size],
                    ),
                )
                for candidate in selected_candidates
            ]

            self.experiment_log["iterations"].append(
                {
                    "iteration": iteration,
                    "current_validation_set_size": current_validation_set_size,
                    "num_candidates": num_candidates,
                    "validation_set_indices": validation_set_indices[
                        :current_validation_set_size
                    ],
                    "selected_candidates_uuids": [
                        x["uuid"] for x in selected_candidates
                    ],
                    "candidates": [c.to_dict() for c in scores],
                    "timestamp": time.time(),
                    # "usage": get_usage_stats(),
                },
            )

            exp_file = self.save_experiment()
            # logger.info(get_usage_stats())
            logger.info("Sorting %d candidates...", num_candidates)

            # Step 2: Sort candidates by their scores in descending order
            scores.sort(key=lambda x: x.metric, reverse=True)

            scores_str = {x.candidate["uuid"]: f"{x.metric:.2%}" for x in scores}
            logger.info("%d Candidate id and scores: %s", iteration, scores_str)

            # Step 3: Keep the top 50% of candidates
            num_candidates = max(1, num_candidates // 2)
            scores = scores[:num_candidates]
            candidates = [r.candidate for r in scores]

            # Step 4: Multiply the validation set size for the next iteration
            current_validation_set_size = min(
                current_validation_set_size * validation_set_multiplier,
                ending_validation_set_size,
            )

            # If only one candidate is left, stop
            if len(candidates) == 1:
                logger.info("Only 1 candidate left. Ending...")
                break

        self.pbar.close()
        if len(scores) <= 0 or len(scores[0].results) <= 0:
            # raise ValueError("No results??")
            logger.warning("No results! no scores")

        # Final run on TEST set Ensure eval 1k
        # or (
        #     self.experiment_log["iterations"][-1]["current_test_set_size"]
        #     < ending_test_set_size
        # )
        if self.test_set_name != self.validation_set_name:
            logger.info("Starting on %s set", self.test_set_name)
            # MUST reset result cache to avoid contaminating
            # test sets!
            self.candidate_results = {}
            logger.info("Reset results cache...")

            # Reset token count stats
            # reset_usage_stats()

            range_end = min(
                self.max_test_set_size,
                len(self.dataset[self.test_set_name]),
            )
            eval_set_indices = list(range(range_end))

            self.pbar = tqdm(
                total=len(eval_set_indices),
                colour="blue",
                smoothing=0.3,
                options={"console": console},
            )
            winning_score = scores[0]
            winning_candidate = candidates[0]
            assert winning_score.candidate["uuid"] == winning_candidate["uuid"]
            before_time = time.time()

            # Step 1: Evaluate all candidates on the current test set
            final_score: CandidateResult = self.evaluate(
                winning_candidate,
                self.dataset[self.test_set_name].select(eval_set_indices),
            )

            self.pbar.close()

            self.experiment_log["final_iteration"] = {
                "ending_test_set_size": range_end,
                "eval_set_indices": eval_set_indices,
                "selected_candidates_uuid": winning_candidate["uuid"],
                "candidate": final_score.to_dict(),
                "timestamp_before": before_time,
                "timestamp_after": time.time(),
                "score": final_score.metric,
            }

            scores = [final_score]

            exp_file = self.save_experiment()

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
            exp_file = self.save_experiment()

            logger.info("Winner:\n%s", yaml.dump(winner_summary))
            logger.info("Score: %.2f", winner.metric)
            logger.info("Saved exp. log to %s", exp_file)

            for variable, value in winner_summary.items():
                if isinstance(value, str):
                    if winner_result.pdl_program.root and hasattr(
                        winner_result.pdl_program.root,
                        "defs",
                    ):
                        # fmt: off
                        winner_result.pdl_program.root.defs[variable] = winner_scope[  # pyright: ignore
                            variable
                        ]
                        # fmt: on
                    else:
                        raise ValueError(
                            "Invalid root in PDL program or 'defs' attribute is missing",
                        )

                else:
                    winner_result.pdl_program.root.defs[variable] = DataBlock(  # type: ignore
                        data=winner_scope[variable],
                    )

            self.save_pdl_program(winner_result.pdl_program)
        else:
            logger.info("Error, no results")
            msg = "No results?!"
            raise ValueError(msg)
        return self.experiment_log

    def evaluate(
        self,
        candidate: dict,
        test_set: list[dict] | Dataset,
    ) -> CandidateResult:
        if self.pbar is None:
            raise ValueError("Progress bar not initialized")

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

        p_passing = 0.0
        pdl_file_parent = Path(self.pdl_path).parent
        threads = []

        cached_results = []

        for index, example in enumerate(test_set):
            if not isinstance(example, dict):
                raise ValueError("Example is not a dict")

            if (
                candidate["uuid"] in self.candidate_results
                and index in self.candidate_results[candidate["uuid"]]
            ):
                cached_results.append(self.candidate_results[candidate["uuid"]][index])
                self.pbar.update(1)
                continue

            threads.append(
                self.trial_thread(
                    pdl_program=self.pdl_program.model_copy(),
                    example=example,
                    candidate=candidate,
                    index=index,
                    timeout=self.timeout,
                    yield_output=self.yield_output,
                    config=self.config,
                    cwd=pdl_file_parent,
                ),
            )

        score = 0
        exception_count = 0
        timeout_count = 0
        exceptions: list[BaseException | bool] = []
        results = []
        start_time = time.time()

        index = -1

        for result in execute_threads(self.parallelism, threads):
            cached_results.append(result)

            if isinstance(result, BaseException):
                exceptions.append(result)
                if isinstance(
                    result,
                    TimeoutError,
                ):
                    timeout_count += 1
                else:
                    exception_count += 1
                    logger.info("Progressed on exception")
                    logger.info(result)
            elif isinstance(result, TrialOutput):
                if result.answer is not None and isinstance(result.answer, float):
                    answer = round(float(result.answer), 2)
                else:
                    answer = result.answer

                logger.info(
                    "Answer: %s Ground truth: %s Score: %s",
                    answer,
                    result.groundtruth,
                    result.score,
                )

                if candidate["uuid"] not in self.candidate_results:
                    self.candidate_results[candidate["uuid"]] = {}

                self.candidate_results[candidate["uuid"]][result.index] = result
            self.pbar.update(1)

        for index, result in enumerate(cached_results):
            if isinstance(result, BaseException):
                logger.info("failed result passed")
            elif isinstance(result, TrialOutput):
                trial_result: TrialOutput = result
                results.append(trial_result)

                if trial_result.exception is not None:
                    exceptions.append(trial_result.exception)

                score += float(trial_result.score)

                p_passing = score / (index + 1)

        end_time = time.time()
        runtime = end_time - start_time

        logger.info(
            "Matches: %s Accuracy: %.2f Exceptions: %s (%s timeout, %s other) Total: %s",
            f"{score:,}",
            p_passing * 100,
            f"{len(exceptions):,}",
            timeout_count,
            exception_count,
            f"{index + 1:,}",
        )

        runtimes = [round(x.runtime, 2) for x in results]
        logger.info("Runtimes: %s, total %.2f", runtimes, runtime)

        return CandidateResult(
            candidate=candidate,
            results=results,
            metric=p_passing,
            runtime=runtime,
        )

    def benchmark(self, test_set_size: int, candidate: dict | None = None):
        if self.num_demonstrations is None:
            demo_size = 0
        elif self.num_demonstrations <= 0:
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

        if self.pbar is None:
            raise ValueError("Progress bar not initialized")

        start_time = time.time()
        if candidate is None:
            candidate = self.sample_candidates(1, demo_indices=list(range(demo_size)))[
                0
            ]

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
        logger.info("Score: %.4f%%", scores[0].metric * 100)
        logger.info("Saved exp. log to %s", exp_file)


def run_optimizer() -> int:
    parser = argparse.ArgumentParser("")

    parser.add_argument(
        "--config",
        "-c",
        help="Optimizer config file",
        type=Path,
        required=True,
    )

    parser.add_argument(
        "--experiments-path",
        help="Path where experiment results will be saved",
        type=Path,
        default=Path("experiments"),
    )

    parser.add_argument(
        "--yield_output",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    args = parser.parse_args()

    if not args.config.exists():
        print("Config file doesn't exist:", args.config)
        sys.exit(1)

    config_text = args.config.read_text()

    try:
        config_dict = yaml.safe_load(config_text)
        config = OptimizationConfig(**config_dict)
    except Exception:
        print("Couldn't load config:", args.config)
        sys.exit(1)

    if not Path(config.pdl_path).exists():
        print("PDL file doesn't exist:", config.pdl_path)
        sys.exit(1)

    # Set up dataset and trial thread based on benchmark
    dataset: Any

    if isinstance(config.dataset, (dict, JsonlDataset)):
        dataset = load_dataset(
            "json",
            data_files={
                "train": config.dataset.train,
                "validation": config.dataset.validation,
                "test": config.dataset.test,
            },
        )
    else:
        print(f"Unknown dataset: {config.dataset}")
        sys.exit(1)

    # Create optimizer instance
    optimizer = PDLOptimizer(
        dataset=dataset,
        trial_thread=PdlEvaluator,
        yield_output=args.yield_output,
        experiment_path=args.experiments_path,
        config=config,
    )
    optimizer.run()
    return 0
