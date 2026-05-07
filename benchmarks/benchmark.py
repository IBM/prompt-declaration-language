import json
import math
import os
import random
import time
import traceback
from abc import ABC, abstractmethod
from asyncio import AbstractEventLoop
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from sys import stderr
from typing import Optional

from pydantic import BaseModel, Field
from rich.console import Console
from rich.table import Table
from scipy.special import logsumexp

from pdl import __version__ as pdl_version
from pdl.pdl_ast import PdlUsage
from pdl.pdl_distributions import Categorical
from pdl.pdl_dumper import as_json, block_to_dict
from pdl.pdl_scheduler import create_event_loop_thread

console = Console()
os.environ["EVALPLUS_MAX_MEMORY_BYTES"] = "68719476736"


class ExperimentConfig(BaseModel):
    name: str
    aggregated_results_path: str
    examples_results_path: str
    task: str
    dataset: str = Field(..., description="Path to the dataset")
    pdl_path: str = Field(..., description="Path to the PDL file")
    model: str
    model_parameters: dict = Field(default_factory=lambda: {})
    temperature: float = Field(default=0.8)
    algorithm: str = Field(default="smc")
    particles: int = Field(default=5)
    num_tests: int = Field(default=1)
    max_workers: int = Field(default=5)
    retry: int = Field(default=0)


class Stats(BaseModel):
    successes: int = Field(default=0)
    failures: list = Field(default_factory=list)


class AggregatedResults(BaseModel):
    total: int = Field(default=0)
    mode: Stats = Field(default_factory=Stats)
    maj: Stats = Field(default_factory=Stats)
    pass_at_1: Stats = Field(default_factory=Stats)
    pass_at_k: Stats = Field(default_factory=Stats)
    success_expectation: Optional[float] = Field(default=None)
    exceptions: list = Field(default_factory=list)
    total_time: float = Field(default=0)
    llm_usage: PdlUsage = Field(default_factory=PdlUsage)


class Experiment(BaseModel):
    config: ExperimentConfig
    pdl_version: str = pdl_version
    result: AggregatedResults


class ExampleResult(BaseModel):
    example_id: int
    problem: str
    solutions: list
    scores: list[float]
    passes: list[bool]
    traces: list[dict]
    pass_at_1_passes: Optional[bool] = None
    pass_at_1_solution: Optional[list[int]] = None
    pass_at_k_passes: bool
    maj_passes: bool
    maj_solution: list[int]
    mode_passes: bool
    mode_solution: list[int]
    success_probability: Optional[float]
    llm_usage: PdlUsage


class BenchmarkBase(ABC):
    config: ExperimentConfig
    event_loop: AbstractEventLoop
    secret: str

    def __init__(self, c: ExperimentConfig, secret: str):
        self.config = c
        self.event_loop = create_event_loop_thread()
        self.secret = secret

    # @abstractmethod
    # def solve(self, *args) -> tuple[Categorical[Any], PdlUsage]:
    #     pass

    # @abstractmethod
    # def passes(self, *args) -> bool:
    #     pass

    @abstractmethod
    def get_question(self, datapoint: dict[str, dict]):
        pass

    @abstractmethod
    def get_answer(self, datapoint: dict[str, dict]):
        pass

    def redact_rits_api_key_in_str(self, s):
        return s.replace(self.secret, "${ RITS_API_KEY }")

    def print_dict(self, to_print: dict, title: str):
        table = Table(title=title, show_header=False)
        table.add_section()
        console.logable_dict = {}
        for k, v in to_print.items():
            if isinstance(v, str):
                console.logable_dict[k] = self.redact_rits_api_key_in_str(v)
            # elif hasattr(v, "__len__"):
            #     console.logable_dict[k] = f"{len(v):,}"
            else:
                console.logable_dict[k] = self.redact_rits_api_key_in_str(f"{v}")
            table.add_row(f"{k}", console.logable_dict[k])
        console.log(table)

    def run(self):  # noqa: C901
        self.print_dict(self.config.model_dump(), "Experiment")
        aggregated_results = AggregatedResults()
        success_probabilities = []
        n_workers = 5

        with (
            open(self.config.dataset, "r", encoding="utf-8") as dataset_f,
            open(
                self.config.examples_results_path, "w", encoding="utf-8"
            ) as examples_results_file,
            ThreadPoolExecutor(max_workers=n_workers) as executor,
        ):
            try:
                for line in dataset_f:
                    if aggregated_results.total == self.config.num_tests:
                        break
                    aggregated_results.total += 1
                    example_id = aggregated_results.total
                    datapoint = json.loads(line)
                    problem = self.get_question(datapoint)
                    console.log("-----------------------------")
                    console.log(f"Example {example_id}")
                    console.log(problem)

                    start_time = time.perf_counter()
                    try:
                        solutions, llm_usage = retry(self.solve, problem)
                    except KeyboardInterrupt as exc:
                        raise exc from exc
                    except Exception as exc:
                        err_msg = traceback.format_exc()
                        console.log(
                            f"Fail to solve example {example_id}: {exc}\n{err_msg}"
                        )
                        aggregated_results.exceptions.append(example_id)
                        solutions = None
                        llm_usage = PdlUsage()
                    end_time = time.perf_counter()
                    solve_time = end_time - start_time
                    aggregated_results.total_time += solve_time

                    # Compute solutions stats
                    aggregated_results.llm_usage.model_calls += llm_usage.model_calls
                    aggregated_results.llm_usage.completion_tokens += (
                        llm_usage.completion_tokens
                    )
                    aggregated_results.llm_usage.prompt_tokens += (
                        llm_usage.prompt_tokens
                    )
                    console.log(
                        f"example {example_id}: {llm_usage.model_calls:3d} model calls  {llm_usage.prompt_tokens:5d} prompt tokens  {llm_usage.completion_tokens:5d} completion tokens  {solve_time} s"
                    )

                    # example_stats = ModelStats()
                    # for i, metadata in enumerate(solutions.metadata):
                    #     stat = ModelStats()
                    #     if len(metadata) > 0:
                    #         for trace in metadata:
                    #             stat.llm_stats(trace)
                    #     console.log(f"solution {i}: {stat.model_calls:3d} model calls  {stat.prompt_tokens:5d} prompt tokens  {stat.completion_tokens:5d} completion tokens")
                    #     example_stats = example_stats + stat
                    # aggregated_results.stats = aggregated_results.stats + example_stats

                    if solutions is None:
                        results = []
                        pass_at_1_passes = False
                        pass_at_1_solution = []
                        pass_at_k_passes = False
                        most_frequent_passes = False
                        most_frequent_solution = []
                        mode_passes = False
                        mode_solution = []
                        traces = []
                        success_probability = 0.0
                    else:
                        # Check if the solutions pass
                        successes = 0
                        results = []
                        passes_futures = []
                        for solution in solutions.values:
                            passes_futures.append(
                                executor.submit(self.passes, solution, datapoint)
                            )
                        for i, (solution, score, passes_future) in enumerate(
                            zip(solutions.values, solutions.logits, passes_futures)
                        ):
                            # passes =  self.passes(solution, datapoint)
                            passes = passes_future.result()
                            console.log(f"solution {i}: {passes} ({score=})")
                            if passes:
                                successes += 1
                            results.append((i, solution, score, passes))

                        # Pass at k
                        pass_at_k_passes = successes > 0
                        if pass_at_k_passes:
                            aggregated_results.pass_at_k.successes += 1
                        else:
                            aggregated_results.pass_at_k.failures.append(example_id)
                        console.log(f"Pass@{len(solutions.values)}: {pass_at_k_passes}")

                        # Pass at 1
                        sampled_solution = solutions.sample()
                        pass_at_1_solution = []
                        pass_at_1_passes = False
                        for i, s, _, passes in results:
                            if sampled_solution == s:
                                pass_at_1_solution.append(i)
                                pass_at_1_passes = passes
                        if pass_at_1_passes:
                            aggregated_results.pass_at_1.successes += 1
                        else:
                            aggregated_results.pass_at_1.failures.append(example_id)
                        console.log(
                            f"Pass@1: {pass_at_1_passes} (solutions: {pass_at_1_solution})"
                        )

                        # Majority voting
                        most_frequent_solution, most_frequent_passes = (
                            _get_most_frequent(results)
                        )
                        if most_frequent_passes:
                            aggregated_results.maj.successes += 1
                        else:
                            aggregated_results.maj.failures.append(example_id)
                        console.log(
                            f"Majority voting: {most_frequent_passes} (solutions: {most_frequent_solution})"
                        )

                        # mode solution
                        mode_solution, mode_passes = _get_mode(results)
                        if mode_passes:
                            aggregated_results.mode.successes += 1
                        else:
                            aggregated_results.mode.failures.append(example_id)
                        console.log(f"Mode: {mode_passes} (solutions: {mode_solution})")

                        traces = []
                        for i, m in enumerate(solutions.metadata):
                            if len(m) != 1:
                                print(
                                    f"XXXXX Example {example_id}: the number of metadata for solution {i} is not 1. This should not arrive!\n{m}",
                                    flush=True,
                                    file=stderr,
                                )
                            trace = block_to_dict(m[0], json_compatible=True)
                            trace = as_json(trace)
                            traces.append(trace)

                        # Success probability
                        success_probability = _get_success_probability(results)
                        success_probabilities.append(success_probability)
                        console.log(f"Success probability: {success_probability}")

                    example_result = ExampleResult(
                        example_id=example_id,
                        problem=problem,
                        solutions=[v for _, v, _, _ in results],
                        scores=[s for _, _, s, _ in results],
                        passes=[p for _, _, _, p in results],
                        traces=traces,
                        pass_at_k_passes=pass_at_k_passes,
                        pass_at_1_passes=pass_at_1_passes,
                        pass_at_1_solution=pass_at_1_solution,
                        maj_passes=most_frequent_passes,
                        maj_solution=most_frequent_solution,
                        mode_passes=mode_passes,
                        mode_solution=mode_solution,
                        success_probability=success_probability,
                        llm_usage=llm_usage,
                    )
                    print(
                        example_result.model_dump_json(),
                        file=examples_results_file,
                        flush=True,
                    )

                    console.log("**** Accuracy:")
                    console.log(
                        f"  pass@1: {show_stats(aggregated_results.pass_at_1, aggregated_results.total)}"
                    )
                    console.log(
                        f"  pass@k: {show_stats(aggregated_results.pass_at_k, aggregated_results.total)}"
                    )
                    console.log(
                        f"  maj:    {show_stats(aggregated_results.maj, aggregated_results.total)}"
                    )
                    console.log(
                        f"  mode:   {show_stats(aggregated_results.mode, aggregated_results.total)}"
                    )
                    console.log(
                        f"  success expectation: {sum(success_probabilities) / aggregated_results.total}"
                    )
                    console.log(f"**** Total: {aggregated_results.total}")
            finally:
                success_expectation = (
                    sum(success_probabilities) / aggregated_results.total
                )
                aggregated_results.success_expectation = success_expectation
                experiment = Experiment(config=self.config, result=aggregated_results)
                experiment_dict = experiment.model_dump()
                with open(
                    self.config.aggregated_results_path, "w", encoding="utf-8"
                ) as f:
                    f.write(json.dumps(experiment_dict, indent=4))
                summary = self.config.model_dump() | aggregated_results.model_dump()
                self.print_dict(summary, "Result")


def show_stats(stats, total):
    return f"{stats.successes}/{total} = {(100 * stats.successes / total):5.2f}%"


def _get_most_frequent(results):
    counts = {}
    max_frequency = 0
    for i, solution, _, passes in results:
        if solution in counts:
            ids, n, b = counts[solution]
            if b != passes:
                print(
                    f"XXXXXXXXXXXXXXXXXXXX THIS SHOULD NOT APPEND: the same solutions {i} and {ids} have different pass status:\n```\n{solution}```",
                    file=stderr,
                    flush=True,
                )
            ids = ids + [i]
            n = n + 1
            b = b or passes
        else:
            ids = [i]
            n = 1
            b = passes
        counts[solution] = (ids, n, b)
        max_frequency = max(max_frequency, n)
    most_frequents = [
        (ids, passes) for _, (ids, n, passes) in counts.items() if n == max_frequency
    ]
    most_frequent = random.choice(most_frequents)
    return most_frequent


def _get_mode(results):
    res = {}
    scores = [score for _, _, score, _ in results]
    lse = logsumexp(scores)
    max_prob = -math.inf
    for i, solution, score, passes in results:
        prob = math.exp(score - lse)
        if solution in res:
            ids, p, b = res[solution]
            if b != passes:

                print(
                    f"XXXXXXXXXXXXXXXXXXXX THIS SHOULD NOT APPEND: the same solutions {i} and {ids} have different pass status:\n```\n{solution}```",
                    file=stderr,
                    flush=True,
                )
            ids = ids + [i]
            p = p + prob
            b = b or passes
        else:
            ids = [i]
            p = prob
            b = passes
        max_prob = max(max_prob, p)
        res[solution] = (ids, p, b)
    modes = [(ids, passes) for _, (ids, p, passes) in res.items() if p == max_prob]
    if len(modes) == 0:
        print("XXXXX This should not arrive!", file=stderr, flush=True)
        print(f"XXXXX {results=}", file=stderr, flush=True)
        print(f"XXXXX {res=}", file=stderr, flush=True)
        print(f"XXXXX {max_prob=}", file=stderr, flush=True)
        modes = [(ids, passes) for _, (ids, p, passes) in res.items()]
    mode = random.choice(modes)
    return mode


def _get_success_probability(results):
    d = [(passes, score, [i]) for i, _, score, passes in results]
    dist = Categorical(d)
    return dist.prob(True)


def retry(f, *args, **kargs):
    num_tries = 3
    for i in range(1, num_tries + 1):
        try:
            return f(*args, **kargs)
        except KeyboardInterrupt as exc:
            raise exc from exc
        except Exception as exc:
            if i < num_tries:
                console.log(f"Try {i} failed: {exc}")
                time.sleep(1)
            else:
                console.log(f"Fail after {i} tries: {exc}")
                raise exc from exc


def make_results_paths(config_name, results_dir):
    time_stamp = str(datetime.now().strftime("%Y-%m-%d_%H:%M:%S"))
    os.makedirs(results_dir, exist_ok=True)
    aggregated_results_path = (
        f"{results_dir}/{config_name}_{time_stamp}_aggregated.json"
    )
    examples_results_path = f"{results_dir}/{config_name}_{time_stamp}_examples.jsonl"
    return aggregated_results_path, examples_results_path
