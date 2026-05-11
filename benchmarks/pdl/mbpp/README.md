# MBPP Code Generation Programs

This directory contains PPDL (Probabilistic Prompt Declaration Language) programs for the MBPP (Mostly Basic Python Problems) benchmark. MBPP is a collection of Python programming tasks that test code generation capabilities of language models.

## Overview

The directory includes multiple program variants demonstrating different approaches to code generation:
- **Simple generation**: Direct code generation with minimal verification
- **Plan-based generation**: Two-stage generation with planning followed by implementation
- **Pipeline generation**: Multi-stage generation with function extraction, testing, and optimization
- **ReAct agent**: Interactive agent that iteratively refines code based on execution feedback
- **Assert-based validation**: Direct validation using problem assertions

## Programs

### [`mbpp_simple.pdl`](mbpp_simple.pdl)

The simplest approach with direct code generation and LLM-as-judge verification.

**Workflow:**
1. Prompt for complete Python function (lines 28-33)
2. Generate code via LLM (lines 34-36)
3. Extract code from markdown or use raw response (lines 37-48)
4. Verify correctness with LLM-as-judge (lines 49-58)
5. Return generated code (line 59)

**Key Features:**
- Separate temperature for generation ([`parameters`](mbpp_simple.pdl:23)) and judging ([`judge_parameters`](mbpp_simple.pdl:24) at temp 0)
- Single [`factor`](mbpp_simple.pdl:58) for probabilistic scoring
- Minimal complexity, suitable for baseline comparisons

### [`mbpp.pdl`](mbpp.pdl)

Plan-based generation with two-stage workflow: planning then implementation.

**Workflow:**
1. Generate English plan (lines 27-32)
2. Verify plan correctness with LLM-as-judge (lines 33-41)
3. Generate code from plan (lines 42-49)
4. Extract code from markdown (lines 50-61)
5. Verify code contains functions via [`utils.contains_functions()`](mbpp.pdl:62)
6. Score linter warnings via [`utils.eval_number_of_warnings()`](mbpp.pdl:63)
7. Verify solution correctness with LLM-as-judge (lines 64-73)
8. Return generated code (line 74)

**Key Features:**
- Three [`factor`](mbpp.pdl:41) statements for multi-stage scoring
- Plan verification before implementation
- Combines LLM-based and rule-based verification

### [`mbpp_pipeline2.pdl`](mbpp_pipeline2.pdl)

Simplified pipeline with function name extraction and two-stage generation.

**Workflow:**
1. Extract function name from problem (lines 28-39)
2. Verify function name appears in problem (line 40)
3. Generate initial code (lines 41-50)
4. Extract code from response (lines 51-60)
5. Verify code structure (line 61)
6. Score linter warnings (line 62)
7. Verify correctness with LLM-as-judge (lines 63-73)
8. Return code (line 74-75)

**Key Features:**
- Function name extraction as first step
- Four [`factor`](mbpp_pipeline2.pdl:40) statements for scoring
- Inline code extraction logic

### [`mbpp_pipeline.pdl`](mbpp_pipeline.pdl)

Modular pipeline with helper functions for code generation, testing, and simplification.

**Helper Functions:**
- [`get_python_code(response)`](mbpp_pipeline.pdl:32): Extracts Python code from markdown (lines 32-44)
- [`get_function_name(problem)`](mbpp_pipeline.pdl:48): Extracts target function name (lines 48-61)
- [`generate_base_code(problem, function_name)`](mbpp_pipeline.pdl:64): Generates initial solution (lines 64-79)
- [`generate_test_function(problem, function_name, solution)`](mbpp_pipeline.pdl:82): Creates test function (lines 82-109)
- [`run_tests(code, tests)`](mbpp_pipeline.pdl:112): Executes tests (lines 112-124)
- [`simplify_solution(problem, function_name, solution)`](mbpp_pipeline.pdl:127): Optimizes code (lines 127-149)

**Main Workflow (lines 152-186):**
1. Extract function name with verification
2. Generate base code with quality checks
3. Verify with LLM-as-judge
4. Generate and validate test function
5. Execute tests on base code
6. Simplify/optimize solution
7. Execute tests on simplified code
8. Return optimized solution

**Key Features:**
- Modular design with reusable functions
- Test generation and execution
- Code optimization step
- Seven [`factor`](mbpp_pipeline.pdl:155) statements for comprehensive scoring

### [`mbpp_pipeline4.pdl`](mbpp_pipeline4.pdl)

Extended pipeline similar to `mbpp_pipeline.pdl` but with inline implementation and optimization focus.

**Workflow:**
1. Extract function name (lines 31-47)
2. Generate initial code with two-stage prompting (lines 53-72)
3. Verify code structure and linter warnings (lines 73-82)
4. Verify correctness with LLM-as-judge (lines 83-93)
5. Generate test function (lines 94-124)
6. Validate test syntax (lines 125-129)
7. Execute tests on base code (lines 130-145)
8. Optimize code (lines 146-173)
9. Verify optimized code quality (lines 174-175)
10. Execute tests on optimized code (lines 176-187)
11. Return optimized solution (line 192)

**Key Features:**
- Inline implementation (no helper functions)
- Optimization prompt asks to use libraries like pandas/numpy (line 156)
- Multiple [`factor`](mbpp_pipeline4.pdl:48) statements at each stage
- Detailed logging with print statements

### [`mbpp_react.pdl`](mbpp_react.pdl)

Interactive ReAct (Reasoning + Acting) agent that iteratively refines code based on execution feedback.

**Key Components:**

- **Demonstrations** (lines 90-125): Example trajectory showing thought-action-observation loop
- [`format_trajectory(trajectory)`](mbpp_react.pdl:45): Formats trajectory for display (lines 45-89)
- **Main Loop** (lines 143-205):
  - Generate thought (lines 148-174)
  - Extract action (execute or solution) via regex (lines 168-172)
  - Execute code in IPython if action is "execute" (lines 178-192)
  - Display observation and continue loop
  - Stop when solution tag found (line 204)
  - Maximum iterations: 5 (line 33)

**Workflow:**
1. Show example trajectory (lines 127-133)
2. Present problem (lines 134-142)
3. Loop until solution found or max iterations:
   - Generate thought with LLM
   - Parse for `<execute>` or `<solution>` tags
   - If execute: run code in IPython, show observation
   - If solution: extract and return
4. Verify final solution contains functions (line 206)
5. Return solution (line 208)

**Key Features:**
- Interactive execution with IPython (line 184)
- Few-shot learning with demonstration (lines 90-125)
- Penalty factor for iterations ≥ 2 (line 203)
- Self-correction through observation feedback
- Uses text completion model format

### [`mbpp_assert.pdl`](mbpp_assert.pdl)

Direct validation using assertions from the problem statement.

**Workflow:**
1. Generate Python function (lines 36-44)
2. Extract code from markdown (lines 45-56)
3. Extract assertions from problem via [`get_asserts()`](mbpp_assert.pdl:25) (lines 25-34)
4. Execute code with assertions (lines 57-68)
5. Apply factor: 0 if assertions pass, -100 if fail (line 68)
6. Return code (line 69)

**Key Features:**
- Direct execution-based validation
- Extracts assertions from problem docstring (lines 31-34)
- Binary scoring: pass (0) or fail (-100)
- No LLM-as-judge, only execution results

### [`utils.pdl`](utils.pdl)

Shared utility functions for code quality assessment.

**Functions:**

- [`flake8(code)`](utils.pdl:26): Runs flake8 linter, returns list of errors/warnings (lines 26-86)
  - Ignores certain style warnings (E111, E2, E3, E501, W1, W2, W3)
  - Identifies hard errors (F821, F822, F831, E112, E113, E999, E902)
  
- [`is_parsing(code)`](utils.pdl:88): Validates Python syntax (lines 88-101)
  - Returns 0 if valid, -100 if invalid
  
- [`contains_functions(code)`](utils.pdl:103): Checks for function definitions (lines 103-125)
  - Returns 0 if valid functions found
  - Returns -5 if function body is just `...`
  - Returns -100 if no functions
  - Returns -200 on parse errors
  
- [`eval_number_of_warnings(response)`](utils.pdl:127): Scores based on linter warnings (lines 127-133)
  - Uses [`Geometric(0.5).log_prob(num_warnings)`](utils.pdl:133)
  - More warnings = lower score
  
- [`Geometric`](utils.pdl:11): Geometric probability distribution class (lines 11-24)
  - Used for probabilistic scoring of warning counts

**Design Pattern:**
All functions return log-probability scores suitable for [`factor`](utils.pdl:133) statements.

## Usage

All programs expect these variables:

- `model`: LLM model identifier
- `model_parameters`: Model configuration dictionary  
- `temperature`: Sampling temperature (typically 0.8)
- `problem`: Coding problem with test assertions

Example configuration:

```yaml
defs:
  model: watsonx/ibm/granite-4-h-small
  model_parameters:
    data: {}
  temperature: 0.8
  problem: |
    Write a function to find nth centered hexagonal number.
    assert centered_hexagonal_number(10) == 271
```

## Program Comparison

| Program | Stages | Factors | Testing | Optimization | Complexity |
|---------|--------|---------|---------|--------------|------------|
| `mbpp_simple.pdl` | 1 | 1 | No | No | Low |
| `mbpp.pdl` | 2 | 3 | No | No | Medium |
| `mbpp_pipeline2.pdl` | 2 | 4 | No | No | Medium |
| `mbpp_pipeline.pdl` | 3 | 7 | Yes | Yes | High |
| `mbpp_pipeline4.pdl` | 3 | 8+ | Yes | Yes | High |
| `mbpp_react.pdl` | Interactive | 2 | Iterative | No | High |
| `mbpp_assert.pdl` | 1 | 1 | Direct | No | Low |


## References

- MBPP Dataset: [Austin et al., 2021](https://arxiv.org/abs/2108.07732)
