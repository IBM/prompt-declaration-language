# LiveCodeBench Code Generation Program

This directory contains a PPDL (Probabilistic Prompt Declaration Language) program for the LiveCodeBench benchmark. LiveCodeBench is a dynamic, contamination-free benchmark that uses fresh programming problems from competitive coding platforms like LeetCode, AtCoder, and Codeforces.

## Overview

The program implements a plan-based code generation workflow specifically designed for competitive programming problems:
1. **Planning**: Generate an English plan for solving the problem
2. **Plan verification**: Use LLM-as-judge to verify the plan's correctness
3. **Code generation**: Generate Python code with a `main()` function that reads from `input()`
4. **Code extraction**: Parse code from markdown blocks
5. **Quality checks**: Score code based on linter warnings
6. **Solution verification**: Use LLM-as-judge to verify the solution's correctness
7. **Return code**: Output the generated Python code

## Program Structure

### [`live_code.pdl`](live_code.pdl)

A plan-based program tailored for competitive programming problems with standard input/output.

**Key Components:**

- **Utility Import** (line 22): 
  - Imports [`utils.pdl`](live_code.pdl:22) from the MBPP directory
  - Provides access to `eval_number_of_warnings()` and other quality checks

- **Planning Stage** (lines 25-30):
  - Prompts for an English plan (lines 25-27)
  - Generates plan via LLM (lines 28-30)
  - Stores in [`plan`](live_code.pdl:30) variable

- **Plan Verification** (lines 31-39):
  - Constructs verification prompt (lines 32-38)
  - Uses [`stdlib.llm_as_judge()`](live_code.pdl:39) to score plan correctness
  - First [`factor`](live_code.pdl:39) statement

- **Code Generation** (lines 40-51):
  - Specific instructions for competitive programming format (lines 41-44):
    - Generate single `main` function
    - Use `input()` for reading inputs
    - Include function call to `main()`
  - Generates code via LLM (lines 46-48)
  - Extracts code from markdown using regex (lines 49-51)
  - Stores in [`solution`](live_code.pdl:48) variable

- **Code Quality Check** (line 54):
  - Uses [`utils.eval_number_of_warnings()`](live_code.pdl:54) to score linter warnings
  - Applies geometric distribution penalty for warnings
  - Second [`factor`](live_code.pdl:54) statement

- **Solution Verification** (lines 55-64):
  - Constructs verification prompt (lines 56-62)
  - Uses [`stdlib.llm_as_judge()`](live_code.pdl:64) to verify solution correctness
  - Third [`factor`](live_code.pdl:64) statement

- **Fallback Handling** (lines 66-67):
  - Applies penalty factor of `-100` if any step fails
  - Ensures failed executions have low probability

**Probabilistic Features:**

- Three [`factor`](live_code.pdl:39) statements for multi-stage scoring:
  1. Plan correctness
  2. Code quality (linter warnings)
  3. Solution correctness
- Penalty factor (`-100`) for execution failures
- Enables inference scaling algorithms (IS, SMC)

## Usage

The program expects the following variables to be defined:

- `model`: LLM model identifier (e.g., `openai/ibm-granite/granite-4.0-h-small`)
- `model_parameters`: Model configuration dictionary
- `temperature`: Sampling temperature (typically `0.8`)
- `problem`: The competitive programming problem with input/output examples

Example configuration (commented out in the file):

```yaml
defs:
  model: openai/ibm-granite/granite-4.0-h-small
  model_parameters:
    data: {}
  temperature: 0.8
  problem: |
    There are three cards with letters a, b, c placed in a row in some order.
    You can do the following operation at most once:
    - Pick two cards, and swap them.
    Is it possible that the row becomes abc after the operation?
    Output "YES" if it is possible, and "NO" otherwise.
    
    Input: The first line contains a single integer t (1 ≤ t ≤ 6) — the number of test cases.
    The only line of each test case contains a single string consisting of each of
    the three characters a, b, and c exactly once, representing the cards.
    
    Output: For each test case, output "YES" if you can make the row abc with at
    most one operation, or "NO" otherwise.
```

## Key Design Decisions

### Competitive Programming Format

The program generates code specifically for competitive programming platforms:

1. **Single `main()` function**: All logic in one function (line 42)
2. **Standard input**: Uses `input()` for reading test cases (line 43)
3. **Function call included**: Generates the call to `main()` (line 44)
4. **Standard output**: Uses `print()` for results (implicit)

This format matches the execution model of platforms like LeetCode and Codeforces.

### Plan-Based Approach

The two-stage workflow (plan → code) is particularly valuable for competitive programming because:
- Problems often require algorithmic insights before implementation
- Planning helps identify edge cases and constraints
- Verification of the plan catches logical errors early
- Reduces the chance of implementing an incorrect algorithm

### Code Quality Scoring

Uses [`utils.eval_number_of_warnings()`](live_code.pdl:54) which:
- Runs flake8 linter on generated code
- Applies geometric distribution: `Geometric(0.5).log_prob(num_warnings)`
- More warnings = exponentially lower score
- Encourages clean, well-formatted code


## References

- LiveCodeBench: [Jain et al., 2024](https://arxiv.org/abs/2403.07974)
