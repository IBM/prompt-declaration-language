import json
from pathlib import Path

from datasets.dataset_dict import DatasetDict
from datasets.load import load_dataset

# Load dataset
grammar_correction = load_dataset("agentlans/grammar-correction")
if not isinstance(grammar_correction, DatasetDict):
    raise TypeError(
        f"Expected grammar_correction to be a DatasetDict, but got: {type(grammar_correction)}"
    )

# Create validation split from train (1024 examples)
new_split = grammar_correction["train"].train_test_split(test_size=1024)
grammar_correction["test"] = new_split["test"]

val_split = new_split["train"].train_test_split()
grammar_correction["train"] = val_split["train"]
grammar_correction["validation"] = val_split["test"]

# Output dir
out_dir = Path("grammar_correction_jsonl")
out_dir.mkdir(parents=True, exist_ok=True)


# Save to JSONL
def save_jsonl(dataset, path: Path) -> None:
    with path.open("w") as f:
        for item in dataset:
            f.write(json.dumps(item) + "\n")


for split in ["train", "validation", "test"]:
    save_jsonl(grammar_correction[split], out_dir / f"{split}.jsonl")
