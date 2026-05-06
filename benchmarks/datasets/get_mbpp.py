import json
from datasets import load_dataset
from datasets.load import load_dataset
from evalplus.data import get_mbpp_plus, get_mbpp_plus_hash
from evalplus.evaluate import MBPP_OUTPUT_NOT_NONE_TASKS, get_groundtruth
from copy import deepcopy

class SelectableList(list):
    def select(self, iterable):
        return [self[i] for i in iterable]

mbpp = load_dataset("google-research-datasets/mbpp", name="full").rename_column(
    "code",
    "canonical_solution",
)

mbpp_plus = get_mbpp_plus()
dataset_hash = get_mbpp_plus_hash()

expected_outputs = get_groundtruth(
    deepcopy(mbpp_plus),
    dataset_hash,
    MBPP_OUTPUT_NOT_NONE_TASKS,
)

print(mbpp["test"][0])


test_task_ids = [
    f"Mbpp/{t}" for t in mbpp["test"]["task_id"]  # pyright: ignore
]

tests = SelectableList(
    [v for k, v in mbpp_plus.items() if k in test_task_ids],
)

for i, x in enumerate(tests):
    tests[i]["expected_output"] = expected_outputs[x["task_id"]]


# Create a local jsonl file and write the dataset to it
output_filename = "mbpp_expected_test.jsonl"
with open(output_filename, 'w') as f:
    count = 0
    for example in tests:
        # The `test_list` and `challenge_test_list` fields are lists of strings.
        # Ensure they are correctly formatted as JSON.
        json_object = {
            "task_id": example["task_id"],
            "prompt": example["prompt"],
            "entry_point": example["entry_point"],
            "canonical_solution": example["canonical_solution"],
            "base_input": example["base_input"],
            "atol": example["atol"],
            "plus_input": example["plus_input"],
            "contract": example["contract"],
            "assertion": example["assertion"],
            "expected_output": example["expected_output"]
        }
        try:
            f.write(json.dumps(json_object) + '\n')

        except:
            count += 1
            continue

print(count)
print(f"MBPP dataset saved to {output_filename}")