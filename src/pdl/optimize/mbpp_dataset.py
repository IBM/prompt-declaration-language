# from pdl.optimize.optimize import config


from datasets import load_from_disk
from evalplus.data import get_mbpp_plus, get_mbpp_plus_hash
from evalplus.evaluate import MBPP_OUTPUT_NOT_NONE_TASKS, get_groundtruth


from copy import deepcopy


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
            "var/mbpp_trajectified"
        )  # load_dataset("google-research-datasets/mbpp", name="full")

        self["train"] = self.mbpp["train"]

        # concatenate_datasets(
        #     self.mbpp.filter(
        #         lambda x: f"Mbpp/{x['task_id']}" not in self.mbpp_plus,
        #     )
        #     .rename_columns({"code": "canonical_solution"})#, "text": "prompt"})
        #     .values(),
        # )
        # self.mbpp["train"].rename_columns({"code": "canonical_solution"})

        # (
        #     self.mbpp["train"]
        #     .filter(lambda x: f"Mbpp/{x['task_id']}" not in self.mbpp_plus)
        #     .rename_columns({"code": "canonical_solution"})
        # )

        test_task_ids = [f"Mbpp/{t}" for t in self.mbpp["test"]["task_id"]]
        # for t in test_task_ids:
        #     if t not in self.mbpp_plus:
        #         print(f"Skipped test {t} because not in dict")
        #         continue

        #     self.mbpp_plus[t]["react_prompt"] = (
        #         self.mbpp_plus[t]["prompt"]
        #         .strip('"')
        #         .strip()
        #         .strip('"')
        #         .strip()
        #         .replace("\n\nassert", "\nassert")
        #     )
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
            [v for k, v in self.mbpp_plus.items() if k in test_task_ids]
        )

        for i, x in enumerate(self["test"]):
            self["test"][i]["expected_output"] = expected_outputs[x["task_id"]]

        validation_task_ids = [f"Mbpp/{t}" for t in self.mbpp["validation"]["task_id"]]
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
            [v for k, v in self.mbpp_plus.items() if k in validation_task_ids]
        )
        for i, x in enumerate(self["validation"]):
            self["validation"][i]["expected_output"] = expected_outputs[x["task_id"]]

    def __getitem__(self, key):
        return dict.__getitem__(self, key)

    def __setitem__(self, key, val):
        dict.__setitem__(self, key, val)
