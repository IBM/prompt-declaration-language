# from pdl.optimize.optimize import config


from copy import deepcopy

from datasets import load_from_disk
from evalplus.data import get_mbpp_plus, get_mbpp_plus_hash
from evalplus.evaluate import MBPP_OUTPUT_NOT_NONE_TASKS, get_groundtruth


class SelectableList(list):
    def select(self, iterable):
        return [self[i] for i in iterable]


class MBPPDataset(dict):
    def __init__(self, dataset_path: str) -> None:
        self.mbpp_plus = get_mbpp_plus()
        self.dataset_hash = get_mbpp_plus_hash()

        expected_outputs = get_groundtruth(
            deepcopy(self.mbpp_plus),
            self.dataset_hash,
            MBPP_OUTPUT_NOT_NONE_TASKS,
        )

        self.mbpp = load_from_disk(dataset_path).rename_column(
            "code",
            "canonical_solution",
        )

        self["train"] = self.mbpp["train"]

        test_task_ids = [
            f"Mbpp/{t}" for t in self.mbpp["test"]["task_id"]  # pyright: ignore
        ]

        for k in self.mbpp_plus:
            self.mbpp_plus[k]["react_prompt"] = (
                self.mbpp_plus[k]["prompt"]
                .strip('"')
                .strip()
                .strip('"')
                .strip()
                .replace("\n\nassert", "\nassert")
            )
        self["test"] = SelectableList(
            [v for k, v in self.mbpp_plus.items() if k in test_task_ids],
        )

        for i, x in enumerate(self["test"]):
            self["test"][i]["expected_output"] = expected_outputs[x["task_id"]]

        validation_task_ids = [
            f"Mbpp/{t}" for t in self.mbpp["validation"]["task_id"]  # pyright: ignore
        ]
        for t in validation_task_ids:
            if t not in self.mbpp_plus:
                print(f"Skipped validation {t} because not in dict")
                continue

            self.mbpp_plus[t]["react_prompt"] = (
                self.mbpp_plus[t]["prompt"]
                .strip('"')
                .strip()
                .strip('"')
                .strip()
                .replace("\n\nassert", "\nassert")
            )
        self["validation"] = SelectableList(
            [v for k, v in self.mbpp_plus.items() if k in validation_task_ids],
        )
        for i, x in enumerate(self["validation"]):
            self["validation"][i]["expected_output"] = expected_outputs[x["task_id"]]

        for split in ["train", "validation", "test"]:
            if "canonical_solution" not in self[split][0]:
                print(self[split][0])
                msg = f"Canonical solution not found in {split}"
                raise ValueError(msg)

    def __getitem__(self, key):
        return dict.__getitem__(self, key)

    def __setitem__(self, key, val) -> None:
        dict.__setitem__(self, key, val)
