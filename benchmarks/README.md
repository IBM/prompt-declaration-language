# Benchmarks

This directory contains the benchmarking utilities used to run PDL-based experiments on several datasets and evaluate the resulting outputs.

**Note:** All commands in this document should be run from the `benchmarks` directory unless otherwise specified.

## Quick start

This section is intended for running a first experiment immediately after cloning the repository.

### 1. Install the project

From the repository root, install PDL with benchmark dependencies:

```bash
pip install 'prompt-declaration-language[benchmark]'
```


### 2. Download a dataset

Datasets are fetched with helper scripts in [`datasets/`](datasets/).

For example, to prepare MBPP:

```bash
python datasets/get_mbpp.py
```

Some benchmarks have their own dataset preparation scripts or instructions. Check the benchmark-specific README files under [`pdl/`](pdl/) when available.

### 3. Run a simple experiment

Run an experiment by passing a YAML configuration file to [`run_benchmark.py`](run_benchmark.py:1).

Example:

```bash
python run_benchmark.py -c experiments/<experiment>.yaml
```

If your configuration points to a PDL program, dataset, and model correctly, this command will generate predictions and save benchmark outputs for later analysis.

### 4. Analyze the results

Use [`bench_analyzer.py`](bench_analyzer.py:1) to inspect and summarize completed runs:

```bash
python bench_analyzer.py
```

If you are comparing multiple runs, execute the analyzer after experiments finish so you can review scores, outputs, and generated artifacts in one place.


## Requirements

Some benchmark suites need extra packages or external repositories.

#### LiveCodeBench

[`live_code_benchmark.py`](live_code_benchmark.py:1) depends on LiveCodeBench:

```bash
git clone https://github.com/LiveCodeBench/LiveCodeBench.git
cd LiveCodeBench
pip install .
```


## Benchmark layout

The main entry points in this directory are:

- [`run_all.py`](run_all.py) — main entry point for running multiple benchmark experiments in parallel
- [`run_benchmark.py`](run_benchmark.py) — run a single benchmark from a YAML experiment file
- [`bench_analyzer.py`](bench_analyzer.py) — inspect and summarize runs
- [`benchmark.py`](benchmark.py) — shared benchmark infrastructure
- benchmark runners such as:
  - [`gsm8k_benchmark.py`](gsm8k_benchmark.py)
  - [`mbpp_benchmark.py`](mbpp_benchmark.py)
  - [`math500_benchmark.py`](math500_benchmark.py)
  - [`fever_benchmark.py`](fever_benchmark.py)
  - [`live_code_benchmark.py`](live_code_benchmark.py)

PDL programs used by benchmarks are stored under [`pdl/`](pdl/).

---

## Running experiments

### Running multiple experiments in parallel

The main entry point for running benchmarks is [`run_all.py`](run_all.py:1), which automatically generates experiment configurations and runs them in parallel:

```bash
python run_all.py --task <task> --dir <output_dir> --repeat <num_runs> [options]
```

**Required arguments:**
- `--task` / `-t`: Task to execute (gsm8k, mbpp, mbpp-simple, mbpp-assert, mbpp-react, mbpp-pipeline, mbpp-plus, fever, fever-confidence, live-code, math500)
- `--dir` / `-d`: Directory where to save results
- `--repeat` / `-r`: Number of times the benchmark should be executed

**Optional arguments:**
- `--workers` / `-w`: Maximum number of parallel workers (default: 2)
- `--platform` / `-p`: Platform hosting the models (watsonx, rits; default: rits)
- `--samples` / `-s`: Maximum number of samples to execute (default: all)

**Example:**
```bash
python run_all.py --task gsm8k --dir ./results/gsm8k_run --repeat 3 --workers 4
```

This will:
1. Generate experiment configurations for the specified task with various model/algorithm combinations
2. Create YAML config files in `<output_dir>/experiments/`
3. Run benchmarks in parallel using [`run_benchmark.py`](run_benchmark.py:1)
4. Save logs to `<output_dir>/logs/`
5. Save results to `<output_dir>/results/`

### Running a single experiment

You can also run individual experiments by passing a YAML configuration file directly to [`run_benchmark.py`](run_benchmark.py:1):

```bash
python run_benchmark.py -c experiments/<experiment>.yaml
```

The configuration file controls which benchmark runner is used, where data comes from, which PDL program is executed, and where outputs are written.

A typical workflow is:

1. install the required dependencies
2. fetch or prepare the dataset
3. create or edit an experiment YAML file
4. run [`python run_benchmark.py`](run_benchmark.py:1)
5. inspect results with [`python bench_analyzer.py`](bench_analyzer.py:1)

---

## Configuring experiments

Experiment configuration is done through YAML files passed to [`run_benchmark.py`](run_benchmark.py:1).

### What an experiment config usually specifies

Although exact keys depend on the benchmark runner, an experiment configuration typically defines:

- the benchmark task or runner to execute
- the dataset location or dataset split
- the PDL file to run
- the model or inference backend
- generation or decoding parameters
- output locations for predictions and metrics
- optional evaluation settings

In practice, the YAML ties together a benchmark implementation in [`*.py`](./) with a PDL program in [`pdl/`](pdl/).

### Choosing the benchmark logic

Each benchmark runner encapsulates task-specific loading and evaluation. For example:

- [`gsm8k_benchmark.py`](gsm8k_benchmark.py) for grade-school math reasoning
- [`mbpp_benchmark.py`](mbpp_benchmark.py) for programming problems
- [`math500_benchmark.py`](math500_benchmark.py) for math evaluation
- [`fever_benchmark.py`](fever_benchmark.py) for fact verification
- [`live_code_benchmark.py`](live_code_benchmark.py) for LiveCodeBench tasks

Your experiment config should match the expectations of the selected benchmark runner.

### Choosing the prompt or pipeline

The prompt, agent, or reasoning pipeline is usually implemented as a PDL file under [`pdl/`](pdl/). For example:

- [`pdl/gsm8k/gsm8k.pdl`](pdl/gsm8k/gsm8k.pdl)
- [`pdl/math500/math500.pdl`](pdl/math500/math500.pdl)
- [`pdl/live_code/live_code.pdl`](pdl/live_code/live_code.pdl)
- [`pdl/mbpp/mbpp_pipeline.pdl`](pdl/mbpp/mbpp_pipeline.pdl)
- [`pdl/mbpp/mbpp_react_completion.pdl`](pdl/mbpp/mbpp_react_completion.pdl)

To compare prompting strategies, create multiple experiment YAML files that point to different PDL programs while keeping the same dataset and evaluation settings.

### Configuring datasets

Datasets are prepared separately from experiment execution.

Available helper scripts include:

- [`get_fever.py`](datasets/get_fever.py)
- [`get_math_500.py`](datasets/get_math_500.py)
- [`get_mbpp.py`](datasets/get_mbpp.py)

Run the appropriate script before launching the experiment. If a benchmark relies on an external upstream package, follow the corresponding setup instructions first.

### Configuring models

Model configuration usually comes from the YAML file and may include:

- provider or backend
- model name
- inference parameters
- authentication through environment variables expected by the underlying PDL or model client setup

Before launching larger runs, validate that the selected model can execute the referenced PDL file on a small sample.

### Organizing experiment files

A practical pattern is to keep one YAML file per benchmark/model/prompt combination, for example:

- one config for GSM8K with a direct reasoning prompt
- one config for GSM8K with ReAct
- one config for MBPP with a pipeline prompt
- one config for MBPP with a completion-style prompt

This makes comparisons easier during analysis and avoids editing the same file repeatedly.


## Analyzing experiments

After one or more runs complete, use [`bench_analyzer.py`](bench_analyzer.py:1):

```bash
python bench_analyzer.py
```

Use the analyzer to review experiment outputs, compare runs, and inspect the generated benchmark artifacts. This is the main post-processing step after running experiments.

For benchmark-specific details about outputs and prompting assets, also consult the README files under [`pdl/`](pdl/).

