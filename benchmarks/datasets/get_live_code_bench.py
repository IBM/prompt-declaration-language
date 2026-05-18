import json
from pathlib import Path

from datasets import load_dataset

lcb_codegen = load_dataset(
    "livecodebench/code_generation_lite", version_tag="release_v6"
)

OUTPUT_FILENAME = Path(__file__).resolve().parent / "live_code_test.jsonl"

# for datapoint in lcb_codegen["test"]:
#     print(datapoint)
#     break


with open(OUTPUT_FILENAME, "w", encoding="utf-8") as f:
    for datapoint in lcb_codegen["test"]:
        f.write(json.dumps(datapoint) + "\n")
