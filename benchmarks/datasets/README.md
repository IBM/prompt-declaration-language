# Benchmark Datasets

This directory contains scripts and instructions for obtaining various benchmark datasets used in PPDL experiments.

## Overview

The following datasets are supported:
- **GSM8k**: Grade school math problems
- **MBPP**: Mostly Basic Python Problems
- **Math500**: Mathematical reasoning problems
- **FEVER**: Fact Extraction and VERification dataset
- **LiveCodeBench**: Live coding benchmark problems

## Dataset Acquisition

### GSM8k

GSM8k (Grade School Math 8k) is a dataset of grade school math word problems.

**Download:**
```bash
curl https://raw.githubusercontent.com/openai/grade-school-math/refs/heads/master/grade_school_math/data/test.jsonl > gsm8k_test.jsonl
```

**Source:** [OpenAI Grade School Math Repository](https://github.com/openai/grade-school-math)

### MBPP

MBPP (Mostly Basic Python Problems) is a benchmark for evaluating program synthesis capabilities.

**Download:**
```bash
python get_mbpp.py
```

This script will automatically fetch and prepare the MBPP dataset.

### Math500

Math500 is a curated collection of 500 mathematical reasoning problems from the MATH dataset.

**Download:**
```bash
python get_math_500.py
```

This script will download and format the Math500 dataset for use in benchmarks.

**Source:** [HuggingFaceH4/MATH-500 on Hugging Face](https://huggingface.co/datasets/HuggingFaceH4/MATH-500)

### FEVER

FEVER (Fact Extraction and VERification) is a dataset for fact-checking and verification tasks.

**Download:**
```bash
curl https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/bigbench/benchmark_tasks/fact_checker/fever/task.json
python get_fever.py
```

**Note:** Manual download is required as the dataset requires acceptance of terms.

### LiveCodeBench

LiveCodeBench provides real-world coding problems for evaluating code generation models.

**Setup (requires Python 3.11):**
1. Clone the LiveCodeBench repository:
   ```bash
   pip install git+https://github.com/LiveCodeBench/LiveCodeBench.git
   ```

2. Run the dataset preparation script:
   ```bash
   python get_live_code_bench.py
   ```

**Source:** [LiveCodeBench Repository](https://github.com/LiveCodeBench/LiveCodeBench)


## Troubleshooting

### Common Issues

**Permission errors when downloading:**
- Ensure you have write permissions in the `benchmarks/datasets/` directory
- Check your internet connection and firewall settings

**Script execution errors:**
- Verify all required dependencies are installed (see main benchmarks README)
- Ensure Python version compatibility (Python 3.8+ recommended)

**Missing dataset files:**
- Confirm the download completed successfully
- Check that extraction (for archived datasets) completed without errors

## Contributing

To add a new dataset:
1. Create a `get_<dataset_name>.py` script following the existing patterns
2. Update this README with download instructions
3. Add dataset information to the main benchmarks documentation

## License

Each dataset has its own license. Please refer to the original dataset sources for licensing information:
- GSM8k: MIT License
- MBPP: Apache 2.0 License
- FEVER: Check dataset website for terms
- LiveCodeBench: Check repository for license details

## References

- GSM8k: Cobbe et al., "Training Verifiers to Solve Math Word Problems" (2021)
- MBPP: Austin et al., "Program Synthesis with Large Language Models" (2021)
- Math500: Lightman et al., "Let's Verify Step by Step" (2023) - Subset from MATH dataset (Hendrycks et al., 2021)
- FEVER: Thorne et al., "FEVER: a large-scale dataset for Fact Extraction and VERification" (2018)
- LiveCodeBench: Jain et al., "LiveCodeBench: Holistic and Contamination Free Evaluation of Large Language Models for Code" (2024)