# Assumes: 
#   wget https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/bigbench/benchmark_tasks/fact_checker/fever/task.json

import json


# Define the output JSONL file path
output_jsonl_path = "fever_test.jsonl"

with open('task.json', 'r') as f:
    data = json.load(f)

# Save the dataset to a JSONL file
with open(output_jsonl_path, 'w', encoding='utf-8') as f:
    for entry in data["examples"]:
        json.dump(entry, f)
        f.write('\n')

print(f"FEVER dataset (test split) downloaded and saved to {output_jsonl_path}")