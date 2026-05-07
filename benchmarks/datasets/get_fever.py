# Assumes:
#   wget https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/bigbench/benchmark_tasks/fact_checker/fever/task.json

import json

# Define the output JSONL file path
OUTPUT_JSONL_PATH = "fever_test.jsonl"

with open("task.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Save the dataset to a JSONL file
with open(OUTPUT_JSONL_PATH, "w", encoding="utf-8") as f:
    for entry in data["examples"]:
        json.dump(entry, f)
        f.write("\n")

print(f"FEVER dataset (test split) downloaded and saved to {OUTPUT_JSONL_PATH}")
