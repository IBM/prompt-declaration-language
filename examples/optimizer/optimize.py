import argparse
import sys
import traceback
from pathlib import Path
from typing import Any

import yaml
from datasets import load_dataset, load_from_disk
from fever_evaluator import FEVEREvaluator
from gsm8k_evaluator import Gsm8kEvaluator
from gsmhard_evaluator import GsmHardEvaluator
from mbpp_dataset import MBPPDataset
from mbpp_evaluator import MBPPEvaluator

from pdl.optimize.config_parser import JsonlDataset, OptimizationConfig
from pdl.optimize.optimizer_evaluator import OptimizerEvaluator
from pdl.optimize.pdl_evaluator import PdlEvaluator
from pdl.optimize.pdl_optimizer import PDLOptimizer

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="PDL optimization and benchmarking tool",
    )
    subparsers = parser.add_subparsers(
        dest="command",
        help="Command to execute",
        required=True,
    )

    # Common arguments for both commands
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument(
        "--config",
        "-c",
        help="Optimizer config file",
        type=Path,
        required=True,
    )
    common_parser.add_argument(
        "--dataset-path",
        help="Path to the dataset directory",
        type=Path,
        required=False,
    )
    common_parser.add_argument(
        "--experiments-path",
        help="Path where experiment results will be saved",
        type=Path,
        default=Path("experiments"),
    )
    common_parser.add_argument(
        "--yield_output",
        action=argparse.BooleanOptionalAction,
        default=False,
    )
    common_parser.add_argument(
        "--dry",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    # Optimize command
    optimize_parser = subparsers.add_parser(
        "optimize",
        help="Run optimization",
        parents=[common_parser],
    )

    # Benchmark command
    benchmark_parser = subparsers.add_parser(
        "benchmark",
        help="Run benchmarking",
        parents=[common_parser],
    )
    benchmark_parser.add_argument(
        "uuid",
        help="UUID for the benchmark run",
        type=str,
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
        traceback.print_last()
        sys.exit(1)

    if not Path(config.pdl_path).exists():
        print("PDL file doesn't exist:", config.pdl_path)
        sys.exit(1)

    if args.dry:
        sys.exit(0)

    # Set up dataset and trial thread based on benchmark
    dataset: Any
    TrialThread: type[
        Gsm8kEvaluator
        | GsmHardEvaluator
        | FEVEREvaluator
        | MBPPEvaluator
        | OptimizerEvaluator
    ]

    if config.dataset == "gsm8k":
        dataset = load_from_disk(args.dataset_path)
        TrialThread = Gsm8kEvaluator
    elif config.dataset == "gsmhard":
        dataset = load_from_disk(args.dataset_path)
        TrialThread = GsmHardEvaluator
    elif config.dataset == "fever":
        fever = load_from_disk(args.dataset_path)
        dataset = fever
        TrialThread = FEVEREvaluator
    elif config.dataset == "mbpp":
        dataset = MBPPDataset(args.dataset_path)
        TrialThread = MBPPEvaluator
    elif isinstance(config.dataset, (dict, JsonlDataset)):
        dataset = load_dataset(
            "json",
            data_files={
                "train": config.dataset.train,
                "validation": config.dataset.validation,
                "test": config.dataset.test,
            },
        )
        TrialThread = PdlEvaluator
    else:
        print(f"Unknown dataset: {config.dataset}")
        sys.exit(1)

    # Create optimizer instance
    optimizer = PDLOptimizer(
        dataset=dataset,
        trial_thread=TrialThread,
        yield_output=args.yield_output,
        experiment_path=args.experiments_path,
        config=config,
    )

    # Execute the appropriate command
    if args.command == "optimize":
        optimizer.run()
    elif args.command == "benchmark":
        optimizer.benchmark(config.max_test_set_size, {"uuid": args.uuid})
