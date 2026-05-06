import json
from datasets import load_dataset
lcb_codegen = load_dataset("livecodebench/code_generation_lite", version_tag="release_v6")

output_filename = "live_code_test.jsonl"

# for datapoint in lcb_codegen["test"]:
#     print(datapoint)
#     break


with open(output_filename, 'w') as f:
    for datapoint in lcb_codegen["test"]:
        f.write(json.dumps(datapoint) + '\n')
