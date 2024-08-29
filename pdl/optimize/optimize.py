import argparse
from enum import Enum
from pathlib import Path

from datasets import load_from_disk, Dataset, load_dataset
import yaml

from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.mbpp_thread import MBPPTrialThread

from .fever_thread import FEVERTrialThread
from .gsm8k_thread import Gsm8kTrialThread
from .pdl_optimizer import PDLOptimizer


class SamplingMethods(Enum):
    IDENTITY = 1
    REVERSED = 2
    RANDOM_INDICES = 3
    UNCERTAINTY = 4


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--config",
        "-c",
        help="Optimizer config file",
        type=Path,
    )
    parser.add_argument(
        "--yield_output",
        action=argparse.BooleanOptionalAction,
        default=False,
    )
    parser.add_argument(
        "pdl_file",
        type=Path,
        help="Path to a PDL file to optimize",
    )

    args = parser.parse_args()
    config_text = args.config.read_text()
    config_dict = yaml.safe_load(config_text)
    config = OptimizationConfig(**config_dict)

    if config.benchmark == "gsm8k":
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/gsm8k_proc"),
            trial_thread=Gsm8kTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).run()
    if config.benchmark == "gsm8k-baseline":
        gsm8k = load_from_disk("var/gsm8k_proc")
        gsm8k["train"] = load_from_disk("var/gsm8k_base_prompts")["pal"]
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=gsm8k,
            trial_thread=Gsm8kTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).benchmark(config.max_test_set_sizees)
    if config.benchmark == "gsm8k-bench":
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=load_from_disk("var/gsm8k_proc"),
            trial_thread=Gsm8kTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).benchmark(args.starting_test_set_size)
    elif config.benchmark == "fever":
        fever = load_from_disk("var/fever_augmented_nowikipages")
        fever["train"] = fever["train"].filter(lambda x: x["wiki_worked"])
        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=fever,
            trial_thread=FEVERTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).run()
    elif config.benchmark == "evalplus":
        # from evalplus.data import get_mbpp_plus
        # mbpp_plus = get_mbpp_plus()

        mbpp = load_dataset("google-research-datasets/mbpp", name="sanitized")

        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=mbpp,
            trial_thread=MBPPTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).run()
