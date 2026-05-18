import json

from datasets import load_dataset

dataset = load_dataset("HuggingFaceH4/MATH-500")
# Access the test split
test_data = dataset["test"]

OUTPUT_FILENAME = Path(__file__).resolve().parent / "math_500_test.jsonl"

# for datapoint in lcb_codegen["test"]:
#     print(datapoint)
#     break


with open(OUTPUT_FILENAME, "w", encoding="utf-8") as f:
    for datapoint in dataset["test"]:
        f.write(json.dumps(datapoint) + "\n")
