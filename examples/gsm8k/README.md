This directory contains experiments with benchmarks GSM8K and GsmHard.

## GSM8K & GsmHard

To install GSM8K:
```
git clone git@github.com:openai/grade-school-math.git
```

To install GsmHard:

```
git clone git@github.com:reasoning-machines/pal.git
```

The file `pdl.benchmark.py` contains a Python driver to read jsonl files and apply different PDL programs to each datapoint.
The basline model is `meta-llama/llama-3-70b-instruct`.

To run a benchmark:
```
python -m pdl.benchmark -b [gsm8k, gsm8k-pal, gsm8k-jinja, gsm-hard, gsm-hard-pal]
```

where the options are:

- `gsm8k`: runs the `examples/gsm8k/math.pdl` program that generates PDL code to solve math problems from GSM8k.
- `gsm8k-pal`: runs the `examples/gsm8k/math-python.pdl` program that generates Python code to solve problems from GSM8k.
- `gsm8k-jinja`: runs the `examples/gsm8k/math-jinja.psl` program that generates Jinja from GSM8k.
- `gsm-hard`: runs the `examples/gsm8k/math.pdl` program that generates PDL code to solve math problems from GsmHard.
- `gsm-hard-pal`: runs the `examples/gsm8k/math-python.pdl` program that generates Python code to solve problems from GsmHard.


## GsmHard Bug Finder

The script `pdl/bugfinder.py` can be used to find bugs in the GsmHard dataset:

```
python -m pdl.bugfinder
```

The file gsmhard-bugfinder.out contains the output of the bugfinder. The file `gsmhard-incorrect.txt` contains manually extracted, verified incorrect data points from the output. The file `gsmhard-logic.txt` contains a selection that are not incorrect, but not logical either.