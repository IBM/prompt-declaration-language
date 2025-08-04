import json
from pathlib import Path

from datasets.dataset_dict import DatasetDict
from datasets.load import load_dataset

# Load dataset
bea19 = load_dataset("juancavallotti/bea-19-corruption")
if not isinstance(bea19, DatasetDict):
    raise TypeError(f"Expected bea19 to be a DatasetDict, but got: {type(bea19)}")

# Create validation split from train (1024 examples)
new_split = bea19["train"].train_test_split(test_size=1024)
bea19["test"] = new_split["test"]

val_split = new_split["train"].train_test_split()
bea19["train"] = val_split["train"]
bea19["validation"] = val_split["test"]

# Output dir
out_dir = Path("bea19_jsonl")
out_dir.mkdir(parents=True, exist_ok=True)


# Save to JSONL
def save_jsonl(dataset, path: Path) -> None:
    with path.open("w") as f:
        for item in dataset:
            f.write(json.dumps(item) + "\n")


for split in ["train", "validation", "test"]:
    save_jsonl(bea19[split], out_dir / f"{split}.jsonl")
