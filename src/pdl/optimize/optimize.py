import argparse
from copy import deepcopy
from enum import Enum
from pathlib import Path

import yaml
from datasets import concatenate_datasets, load_dataset, load_from_disk
from evalplus.data import get_mbpp_plus, get_mbpp_plus_hash
from evalplus.evaluate import MBPP_OUTPUT_NOT_NONE_TASKS, get_groundtruth

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
            dataset=load_from_disk("var/gsm8k_proc_json"),
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
        ).benchmark(config.max_test_set_size)
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
        fever = load_from_disk("var/fever_augmented_nowikipages_json")
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

        class SelectableList(list):
            def select(self, iterable):
                return [self[i] for i in iterable]

        class MBPPDataset(dict):
            def __init__(self):
                self.mbpp_plus = get_mbpp_plus()
                self.dataset_hash = get_mbpp_plus_hash()

                expected_outputs = get_groundtruth(
                    deepcopy(self.mbpp_plus),
                    self.dataset_hash,
                    MBPP_OUTPUT_NOT_NONE_TASKS,
                )

                self.mbpp = load_from_disk(
                    "var/mbpp"
                )  # load_dataset("google-research-datasets/mbpp", name="full")

                train_set = self.mbpp[config.train_set_name].rename_columns(
                    {"code": "canonical_solution"}
                )
                self[config.train_set_name] = train_set

                # concatenate_datasets(
                #     self.mbpp.filter(
                #         lambda x: f"Mbpp/{x['task_id']}" not in self.mbpp_plus,
                #     )
                #     .rename_columns({"code": "canonical_solution"})#, "text": "prompt"})
                #     .values(),
                # )
                # self.mbpp[config.train_set_name].rename_columns({"code": "canonical_solution"})

                # (
                #     self.mbpp[config.train_set_name]
                #     .filter(lambda x: f"Mbpp/{x['task_id']}" not in self.mbpp_plus)
                #     .rename_columns({"code": "canonical_solution"})
                # )

                # self.mbpp.save_to_disk("var/mbpp")
                test_task_ids = [
                    f"Mbpp/{t}" for t in self.mbpp[config.test_set_name]["task_id"]
                ]
                for t in test_task_ids:
                    self.mbpp_plus[t]["react_prompt"] = (
                        self.mbpp_plus[t]["prompt"]
                        .strip('"""')
                        .strip()
                        .strip('"""')
                        .strip()
                        .replace("\n\nassert", "\nassert")
                    )
                self[config.test_set_name] = SelectableList(
                    [v for k, v in self.mbpp_plus.items() if k in test_task_ids]
                )
                for i, x in enumerate(self[config.test_set_name]):
                    self[config.test_set_name][i]["expected_output"] = expected_outputs[
                        x["task_id"]
                    ]

                validation_task_ids = [
                    f"Mbpp/{t}"
                    for t in self.mbpp[config.validation_set_name]["task_id"]
                ]
                for t in validation_task_ids:
                    self.mbpp_plus[t]["react_prompt"] = (
                        self.mbpp_plus[t]["prompt"]
                        .strip('"""')
                        .strip()
                        .strip('"""')
                        .strip()
                        .replace("\n\nassert", "\nassert")
                    )
                self[config.validation_set_name] = SelectableList(
                    [v for k, v in self.mbpp_plus.items() if k in validation_task_ids]
                )
                for i, x in enumerate(self[config.validation_set_name]):
                    self[config.validation_set_name][i]["expected_output"] = (
                        expected_outputs[x["task_id"]]
                    )

            def __getitem__(self, key):
                return dict.__getitem__(self, key)

            def __setitem__(self, key, val):
                dict.__setitem__(self, key, val)

        mbpp_dataset = MBPPDataset()

        PDLOptimizer(
            pdl_path=args.pdl_file,
            dataset=mbpp_dataset,
            trial_thread=MBPPTrialThread,
            yield_output=args.yield_output,
            experiment_path=Path("experiments"),
            config=config,
        ).run()
