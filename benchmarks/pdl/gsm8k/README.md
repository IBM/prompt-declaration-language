# GSM8k Math Problem Solving Program

This directory contains a PPDL (Probabilistic Prompt Declaration Language) program for the GSM8k (Grade School Math 8K) benchmark. GSM8k is a dataset of grade-school level math word problems that require multi-step reasoning to solve.

## Overview

The program implements a straightforward math problem-solving workflow:
1. **Problem presentation**: Present the math problem to the LLM
2. **Solution generation**: Ask the LLM to reason through the problem and generate a solution
3. **Answer extraction**: Parse the final numerical answer from the solution
4. **Solution verification**: Use LLM-as-judge to score the correctness of the solution
5. **Return result**: Output the extracted numerical answer

## Program Structure

### [`gsm8k.pdl`](gsm8k.pdl)

A simple yet effective program for solving grade-school math problems with probabilistic scoring.

**Key Components:**

- **Problem Prompt** (lines 30-31): 
  - Presents the problem with [`"Question: ${ problem }"`](gsm8k.pdl:30)
  - Instructs the LLM to reason and format the answer with `####` prefix (line 31)

- **Solution Generation** (lines 32-34):
  - Calls the LLM with [`model: ${ model }`](gsm8k.pdl:32)
  - Stores the complete solution in the [`solution`](gsm8k.pdl:33) variable

- **Answer Extraction** (lines 35-40):
  - Uses Python code to extract the numerical answer
  - Parses the last line of the solution (line 39)
  - Applies [`extract_math_answer()`](gsm8k.pdl:38) to extract the number
  - Stores the result in the [`result`](gsm8k.pdl:36) variable

- **Solution Verification** (lines 42-48):
  - Constructs a verification prompt asking if the solution is correct (lines 43-47)
  - Uses [`stdlib.llm_as_judge()`](gsm8k.pdl:48) to score the solution
  - The score becomes a [`factor`](gsm8k.pdl:48) in the probabilistic inference

- **Fallback Handling** (lines 50-51):
  - Applies a penalty factor of `-100` if any step fails
  - Ensures failed executions have low probability

**Probabilistic Features:**

- [`factor`](gsm8k.pdl:48) statement scores solutions based on LLM-as-judge verification
- Penalty factor (`-100`) for execution failures
- Enables inference scaling to explore multiple solution paths

## Usage

The program expects the following variables to be defined:

- `model`: LLM model identifier (e.g., `watsonx/meta-llama/llama-3-3-70b-instruct`)
- `model_parameters`: Model configuration dictionary
- `temperature`: Sampling temperature (typically `0.8`)
- `problem`: The math word problem to solve

Example configuration (commented out in the file):

```yaml
defs:
  model: watsonx/meta-llama/llama-3-3-70b-instruct
  model_parameters:
    data: {}
  temperature: 0.8
  problem: |
    Carla is downloading a 200 GB file. Normally she can download 2 GB/minute, 
    but 40% of the way through the download, Windows forces a restart to install 
    updates, which takes 20 minutes. Then Carla has to restart the download from 
    the beginning. How long does it take to download the file?
```

## Expected Output Format

The LLM is instructed to format its solution with the final answer on the last line prefixed by `####`:

```
[reasoning steps...]
Therefore, the answer is:
#### 120
```

The program extracts the numerical value (`120`) from this formatted output.


## References

- GSM8k Dataset: [Cobbe et al., 2021](https://arxiv.org/abs/2110.14168)
