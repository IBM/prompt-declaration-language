import argparse
from enum import Enum
from pathlib import Path

from datasets import load_from_disk

from .fever_thread import FEVERTrialThread
from .gsm8k_thread import Gsm8kTrialThread
from .pdl_optimizer import PDLOptimizer


class SamplingMethods(Enum):
    IDENTITY = 1
    REVERSED = 2
    RANDOM_INDICES = 3
    UNCERTAINTY = 4


DEBUG = False


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
        "--timeout",
        "-to",
        type=int,
        help="Number of seconds to run PDL until aborting. Usually 30 to 120 seconds.",
        default=120,
    )
    parser.add_argument(
        "--budget_growth",
        type=str,
        choices=["double", "to_max"],
        help="Whether to double the test set or reach the maximum test set size",
        default="double",
    )
    parser.add_argument(
        "pdl_file",
        type=Path,
        help="Path to a PDL file to optimize",
    )

    args = parser.parse_args()

    if args.bench == "gsm8k":
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/gsm8k_proc"),
            split="train+test",
            signature="question->answer",
            metric=lambda: 0.0,
            prompt_patterns=[
                "react",
                "cot",
                "rewoo",
            ],
            tools=[],
            parallelism=args.parallelism,
            num_demonstrations=args.num_demos,
            starting_test_set_size=args.starting_test_set_size,
            ending_test_set_size=args.end_test_set_size,
            max_candidates=args.trials,
            timeout=args.timeout,
            trial_thread=Gsm8kTrialThread,
            budget_growth=args.budget_growth,
        ).run()
    if args.bench == "gsm8k-bench":
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/gsm8k_proc"),
            split="train+test",
            signature="question->answer",
            metric=lambda: 0.0,
            prompt_patterns=[
                "react",
                "cot",
                "rewoo",
            ],
            tools=[],
            parallelism=args.parallelism,
            num_demonstrations=args.num_demos,
            starting_test_set_size=args.starting_test_set_size,
            ending_test_set_size=args.end_test_set_size,
            max_candidates=args.trials,
            timeout=args.timeout,
            trial_thread=Gsm8kTrialThread,
            budget_growth=args.budget_growth,
        ).benchmark(args.starting_test_set_size)
    elif args.bench == "fever":
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/ref_claim_fever_react"),
            split="train+test",
            signature="question->answer",
            metric=lambda: 0.0,
            prompt_patterns=[
                "react",
                "cot",
                "rewoo"
            ],
            tools=[],
            parallelism=args.parallelism,
            num_demonstrations=args.num_demos,
            starting_test_set_size=args.starting_test_set_size,
            ending_test_set_size=args.end_test_set_size,
            max_candidates=args.trials,
            timeout=args.timeout,
            trial_thread=FEVERTrialThread,
            budget_growth=args.budget_growth,
        ).run()
