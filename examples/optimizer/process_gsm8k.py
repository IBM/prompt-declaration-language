import re
from pathlib import Path
from typing import Any

from datasets.dataset_dict import DatasetDict
from datasets.load import load_dataset, load_from_disk

from pdl.optimize.parse_number import parse_number

# Load original GSM8K dataset and split it into train and validation sets

var_dir = Path("var")
var_dir.mkdir(parents=True, exist_ok=True)

gsm8k_orig = load_dataset("openai/gsm8k", "main")
if not isinstance(gsm8k_orig, DatasetDict):
    raise TypeError(
        f"Expected gsm8k_orig to be a DatasetDict, but got: {type(gsm8k_orig)}"
    )
new_split = gsm8k_orig["train"].train_test_split(test_size=1024)
gsm8k_orig["validation"] = new_split["test"]
gsm8k_orig["train"] = new_split["train"]
gsm8k_orig.save_to_disk("var/gsm8k_split")

# Make sure the saved dataset is loaded correctly
gsm8k = load_from_disk("var/gsm8k_split")
if not isinstance(gsm8k, DatasetDict):
    raise TypeError(f"Expected gsm8k to be a DatasetDict, but got: {type(gsm8k)}")


def parse_answers(row: dict[str, Any]) -> dict[str, Any]:
    question = row["question"].strip().replace("’", "'").replace("  ", " ")
    parts = row["answer"].split("####")
    answer = parse_number(parts[-1])
    reasoning = "####".join(parts[:-1]).strip().replace("’", "'").replace("  ", " ")
    return {
        "question": question,
        "answer": answer,
        "reasoning": reasoning,
        "raw_answer": row["answer"],
        "answer_part": parts[-1],
    }


gsm8k = gsm8k.map(parse_answers)


def react_trajectory(row: dict[str, Any]) -> dict[str, list[str]]:
    question = row["question"]
    answer = row["answer"]
    reasoning = row["reasoning"].splitlines()
    trajectory = [{"question": question.strip()}]
    res = answer

    for line in reasoning:
        pattern = (
            r"(?P<pre>(=(\ )?|equals(\ )?)?(\$)?)<<(?P<exp>.*?)=(?P<res>.*?)>>([^\s]*)"
        )
        expressions = re.search(pattern, line)

        if expressions is None:
            trajectory += [
                {"thought": line.strip().replace("  ", " ")},
            ]
        else:
            thought = re.sub(pattern, "", line)
            thought = thought.rstrip(".").rstrip(",")
            exp = expressions.group("exp").strip()
            res = expressions.group("res").strip()

            trajectory += [
                {
                    "thought": f"{thought.strip().replace('  ', ' ')}. I need to calculate {exp}"
                },
                {
                    "action": '{"name": "Calculator", "arguments": {"expr": "'
                    f"{exp}"
                    '"}}'
                },
                {"observation": res},
            ]
    if next(iter(trajectory[-1].keys())) == "observation":
        trajectory.append({"thought": f"The answer is {answer}"})

    trajectory.append(
        {"action": '{"name": "Finish", "arguments": {"answer": "' + f"{answer}" + '"}}'}
    )

    traj_keys = [next(iter(t.keys())) for t in trajectory]
    traj_values = [next(iter(t.values())) for t in trajectory]

    return {
        "traj_keys": traj_keys,
        "traj_values": traj_values,
    }


gsm8k["train"] = gsm8k["train"].map(react_trajectory)


def rewoo_trajectory(row: dict[str, Any]) -> dict[str, list[str]]:
    question = row["question"]
    answer = row["answer"]
    reasoning = row["reasoning"].splitlines()
    trajectory = [{"question": question.strip().replace("  ", " ")}]
    res = answer

    for line in reasoning:
        pattern = (
            r"(?P<pre>(=(\ )?|equals(\ )?)?(\$)?)<<(?P<exp>.*?)=(?P<res>.*?)>>([^\s]*)"
        )
        expressions = re.search(pattern, line)

        if expressions is None:
            trajectory += [
                {"thought": line.strip().replace("  ", " ")},
            ]
        else:
            thought = re.sub(pattern, "", line)
            thought = thought.rstrip(".").rstrip(",")
            exp = expressions.group("exp").strip()
            res = expressions.group("res").strip()

            trajectory += [
                {"thought": f"{thought.strip().replace('  ', ' ')}. Calculate {exp}"},
                {
                    "action": '{"name": "Calculator", "arguments": {"expr": "'
                    f"{exp}"
                    '"}}'
                },
                {"observation": res},
            ]

    evidence_counter = 0
    for i, outer in enumerate(trajectory):
        type_event = next(iter(outer.keys()))
        value = next(iter(outer.values()))

        if type_event == "action":
            evidence_counter += 1
        if type_event == "observation":
            for j in range(i + 1, len(trajectory)):
                inner = trajectory[j]
                inner_type_event = next(iter(inner.keys()))
                if inner_type_event == "action":
                    trajectory[j]["action"] = trajectory[j]["action"].replace(
                        value, f"#E{evidence_counter}"
                    )
                elif inner_type_event == "thought":
                    trajectory[j]["thought"] = trajectory[j]["thought"].replace(
                        value, f"#E{evidence_counter}"
                    )
    traj_keys = [next(iter(t.keys())) for t in trajectory]
    traj_values = [next(iter(t.values())) for t in trajectory]

    return {"rewoo_traj_keys": traj_keys, "rewoo_traj_values": traj_values}


gsm8k["train"] = gsm8k["train"].map(rewoo_trajectory)

# Save the processed dataset
gsm8k.save_to_disk("var/gsm8k_trajectified")

# Make sure the saved dataset is loaded correctly
ds = load_from_disk("var/gsm8k_trajectified")
print(ds)
