# Math500 Problem Solving Program

This directory contains a PPDL (Probabilistic Prompt Declaration Language) program for the Math500 benchmark. Math500 is a curated selection of 500 challenging mathematical problems from the MATH dataset, spanning algebra, geometry, number theory, pre-calculus, and probability.

## Overview

The program implements a straightforward mathematical problem-solving workflow with step-by-step reasoning verification:
1. **Problem presentation**: Present the math problem to the LLM
2. **Solution generation**: Generate a complete solution with reasoning
3. **Line-by-line verification**: Use LLM-as-judge to verify reasoning correctness
4. **Return solution**: Output the complete solution

## Program Structure

### [`math500.pdl`](math500.pdl)

A focused program for solving advanced mathematical problems with reasoning verification.

**Key Components:**

- **Problem Prompt** (line 23): 
  - Presents the problem with [`"Problem: ${ problem }"`](math500.pdl:23)
  - No specific formatting instructions, allowing natural mathematical notation

- **Solution Generation** (lines 24-26):
  - Calls the LLM with [`model: ${ model }`](math500.pdl:24)
  - Uses generation temperature from [`parameters`](math500.pdl:26)
  - Stores complete solution in [`solution`](math500.pdl:25) variable

- **Reasoning Verification** (lines 27-34):
  - Constructs detailed verification prompt (lines 28-33)
  - Asks LLM to read solution "line by line" and identify reasoning errors
  - Uses [`stdlib.llm_as_judge()`](math500.pdl:34) with zero temperature ([`judge_parameters`](math500.pdl:34))
  - Returns True if no issues found, False if errors detected
  - Score becomes a [`factor`](math500.pdl:34) in probabilistic inference

- **Fallback Handling** (lines 36-37):
  - Applies penalty factor of `-100` if any step fails
  - Ensures failed executions have low probability

**Probabilistic Features:**

- Single [`factor`](math500.pdl:34) statement for solution quality scoring
- Penalty factor (`-100`) for execution failures
- Enables inference scaling to explore multiple solution approaches

## Usage

The program expects the following variables to be defined:

- `model`: LLM model identifier (e.g., `openai/ibm-granite/granite-4.0-h-small`)
- `model_parameters`: Model configuration dictionary
- `temperature`: Sampling temperature for generation (typically `0.8`)
- `problem`: The mathematical problem to solve

Example configuration (commented out in the file):

```yaml
defs:
  model: openai/ibm-granite/granite-4.0-h-small
  model_parameters:
    data: {}
  temperature: 0.8
  problem: |
    Convert the point $(0,3)$ in rectangular coordinates to polar coordinates.
    Enter your answer in the form $(r,\theta),$ where $r > 0$ and $0 \le \theta < 2 \pi.$
```

## Key Design Decisions

### Separate Temperature Settings

The program uses two different temperature configurations:

- **Generation** ([`parameters`](math500.pdl:18)): Uses the specified temperature (typically 0.8) for creative problem-solving
- **Judging** ([`judge_parameters`](math500.pdl:19-20)): Uses temperature 0 for consistent, deterministic verification

This separation ensures diverse solution generation while maintaining reliable verification.

### Line-by-Line Reasoning Verification

Unlike simpler verification approaches that only check final answers, this program asks the LLM-as-judge to:
1. Read the solution line by line
2. Reason about each step
3. Identify any errors in reasoning

This approach is particularly valuable for Math500 because:
- Problems require multi-step reasoning
- Intermediate steps are as important as final answers
- Catching reasoning errors early improves solution quality

### No Answer Extraction

Unlike GSM8k which extracts numerical answers, Math500 returns the complete solution. This is appropriate because:
- Math500 problems have diverse answer formats (equations, coordinates, expressions)
- The reasoning process is as important as the final answer
- Solutions often require mathematical notation that shouldn't be simplified


## References

- Math500 Dataset: Curated from [MATH Dataset (Hendrycks et al., 2021)](https://arxiv.org/abs/2103.03874)
