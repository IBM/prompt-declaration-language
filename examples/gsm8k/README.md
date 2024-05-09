This directory contains PDL code to apply the Program-aided Language Models (PaL) approach to mathematical reasoning for the GSM8K dataset. The file `process.py` contains a Python driver to read the GSM8K jsonl file and apply the PDL program `math.pdl` to each datapoint. The baseline model `is meta-llama/llama-3-70b-instruct`.

To install GSM8K:
```
git clone git@github.com:openai/grade-school-math.git
```

To run the benchmark:
```
python3 -m pdl.process
```