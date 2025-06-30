# Instructions:
# 1. Install EvalPlus e.g. `pip install evalplus`
# 2. Run this script to process the MBPP dataset into a format suitable for evaluation.
import re
from pathlib import Path
from typing import Any

from datasets.dataset_dict import DatasetDict
from datasets.load import load_dataset, load_from_disk
from evalplus.data import get_mbpp_plus

var_dir = Path("var")
var_dir.mkdir(parents=True, exist_ok=True)

mbpp_plus = get_mbpp_plus()

mbpp = load_dataset("google-research-datasets/mbpp", name="full")
if not isinstance(mbpp, DatasetDict):
    raise TypeError(f"Expected mbpp to be a DatasetDict, but got: {type(mbpp)}")

mbpp["test"] = mbpp["test"].filter(
    lambda x: f"Mbpp/{x['task_id']}" in mbpp_plus,
)

mbpp["validation"] = mbpp["validation"].filter(
    lambda x: f"Mbpp/{x['task_id']}" in mbpp_plus,
)


def trajectify(row: dict[str, Any]) -> dict[str, list[str]]:
    code = row["code"].replace("\r\n", "\n").replace("\r", "\n").strip()
    first_test = row["test_list"][0].strip().lstrip()
    pattern = r"assert\s+(\w+\(.*?\))\s*==\s*(.+)"

    # Replacement format
    replacement = r"res = \1\nassert res == \2, \"Expected \2 but got {}\".format(res)"

    # Perform the substitution
    converted_string = (
        re.sub(pattern, replacement, first_test)
        .replace('\\"Expected ', '"Expected ')
        .replace('{}\\"', '{}"')
    )
    code_w_assert = code + "\n" + converted_string.strip()
    prompt = row["text"].strip() + "\n" + first_test

    trajectory = [
        {"task": prompt},
        {
            "thought": "I should run a solution on the test case before proposing a solution."
        },
        {"action": code_w_assert},
        {"observation": "[Executed Successfully with No Output]"},
        {"thought": "There is no AssertionError. I can now submit the solution."},
        {"solution": code},
    ]

    traj_keys = [next(iter(t.keys())) for t in trajectory]
    traj_values = [next(iter(t.values())) for t in trajectory]

    return {
        "react_prompt": prompt,
        "code": code,
        "traj_keys": traj_keys,
        "traj_values": traj_values,
    }


mbpp_trajectified = mbpp.map(trajectify)
assert len(mbpp_trajectified["train"]) == 374
assert len(mbpp_trajectified["test"]) == 224
assert len(mbpp_trajectified["validation"]) == 39

# Save the processed dataset
mbpp_trajectified.save_to_disk("var/mbpp_trajectified")

# Make sure the saved dataset is loaded correctly
ds = load_from_disk("var/mbpp_trajectified")
print(ds)
