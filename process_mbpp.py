from datasets import load_from_disk
from datasets import load_dataset, concatenate_datasets
from tqdm.autonotebook import tqdm
from pprint import pprint
import re
from evalplus.data import get_mbpp_plus

mbpp_plus = get_mbpp_plus()

mbpp = load_dataset("google-research-datasets/mbpp", name="full")

mbpp["train"] = mbpp["train"].filter(
    lambda x: f"Mbpp/{x['task_id']}" not in mbpp_plus,
)
# .rename_columns(
#             {"code": "canonical_solution"}
#         )

mbpp["test"] = mbpp["test"].filter(
    lambda x: f"Mbpp/{x['task_id']}" in mbpp_plus,
)

mbpp["validation"] = mbpp["validation"].filter(
    lambda x: f"Mbpp/{x['task_id']}" not in mbpp_plus,
)


def trajectify(row):
    # - action: |-
    #         def similar_elements(test_tup1, test_tup2):
    #           res = tuple(set(test_tup1) & set(test_tup2))
    #           return res
    #         res = similar_elements((3, 4, 5, 6), (5, 7, 4, 10))
    #         assert res == (4, 5), "Expected (4, 5) but got {}".format(res)
    #     - observation: "[Executed Successfully with No Output]"
    #     - thought: There is no more AssertionError. I can now submit the solution.
    #     - solution: |-
    #         def similar_elements(test_tup1, test_tup2):
    #           res = tuple(set(test_tup1) & set(test_tup2))
    #           return res
    # Regex pattern to match the assert statement and capture the function call and expected result
    task_id = f"Mbpp/{row['task_id']}"
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
    # (
    #     mbpp_plus[task_id]["prompt"]
    #     .strip('"""')
    #     .strip()
    #     .strip('"""')
    #     .strip()
    #     .replace("\n\nassert", "\nassert")
    # )  # row["text"].strip() + "\n" + first_test
    # print(code_w_assert)
    # print("-----")
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
        # "prompt": row[].strip('"""').strip().strip('"""').strip()
        "react_prompt": prompt,
        "code": code,
        "traj_keys": traj_keys,
        "traj_values": traj_values,
    }


mbpp_trajectified = mbpp.map(trajectify)
# mbpp_trajectified.save_to_disk("var/mbpp_trajectified")

train_concat = concatenate_datasets(
    mbpp.filter(
        lambda x: f"Mbpp/{x['task_id']}" not in mbpp_plus,
    )
    # .rename_columns({"code": "canonical_solution", "text": "prompt"})
    .values()
)

test_concat = concatenate_datasets(
    mbpp.filter(
        lambda x: f"Mbpp/{x['task_id']}" in mbpp_plus,
    )
    # .rename_columns({"code": "canonical_solution", "text": "prompt"})
    .values()
)

# filt = mbpp.filter(
#     lambda x: f"Mbpp/{x['task_id']}" in mbpp_plus,
# )
