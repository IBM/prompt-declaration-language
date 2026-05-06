## Obtaining Datasets


### GSM8k

```bash
curl https://raw.githubusercontent.com/openai/grade-school-math/refs/heads/master/grade_school_math/data/test.jsonl > test.jsonl
```

### MBPP

```
python get_mbpp.py
```

### Math500

```
python get_math_500.py
```


### Fever

https://fever.ai/dataset/fever.html

Download dataset: `Paper Test Dataset`

### LiveCodeBench

Clone LiveCodeBench and install accoding to their instructions:
https://github.com/LiveCodeBench/LiveCodeBench/blob/main/README.md

```
python get_live_code_bench.py
```