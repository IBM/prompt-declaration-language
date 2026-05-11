# FEVER Fact Verification Programs

This directory contains PPDL (Probabilistic Prompt Declaration Language) programs for the FEVER (Fact Extraction and VERification) benchmark. FEVER is a fact-checking dataset that requires verifying whether a given claim is supported or refuted by evidence from Wikipedia.

## Overview

The programs implement a multi-step fact verification workflow:
1. **Tool-augmented LLM call**: The LLM is given access to a Wikipedia search tool
2. **Evidence gathering**: The LLM decides which topics to search and retrieves relevant information
3. **Quality scoring**: Probabilistic factors score the quality of search topics and evidence
4. **Final verification**: The LLM makes a final true/false determination based on gathered evidence

## Programs

### [`fever.pdl`](fever.pdl)

The standard FEVER verification program with LLM-as-judge scoring.

**Key Components:**

- **Wikipedia Search Tool** (lines 25-47): Defines a [`search`](fever.pdl:25) function that queries Wikipedia and handles disambiguation errors
- **Tool Configuration** (lines 48-61): Exposes the search function as a tool the LLM can call
- **Initial LLM Call** (lines 64-69): Presents the problem statement and enables tool use via [`modelResponse: action`](fever.pdl:67)
- **Evidence Collection Loop** (lines 70-114): 
  - Iterates over tool calls requested by the LLM
  - For each search request:
    - Extracts the topic from tool call arguments (lines 78-88)
    - Uses LLM-as-judge to score topic relevance (lines 94-103) via [`stdlib.llm_as_judge()`](fever.pdl:103)
    - Executes the Wikipedia search (lines 104-106)
  - Applies penalty factors for invalid tool calls (lines 107-110)
- **Evidence Sufficiency Check** (lines 115-125): Uses LLM-as-judge to score whether gathered evidence is sufficient
- **Final Verification** (lines 131-141): Makes the final true/false determination based on all evidence

**Probabilistic Features:**

- [`factor`](fever.pdl:103) statements score execution traces based on:
  - Topic relevance for answering the question
  - Evidence sufficiency for verification
- Penalty factors (`-100`) discourage invalid tool calls
- Enables inference scaling algorithms (IS, SMC) to explore multiple verification paths

### [`fever_confidence.pdl`](fever_confidence.pdl)

An enhanced version that extracts confidence scores from the final LLM response.

**Key Differences from `fever.pdl`:**

1. **Structured Output Configuration** (lines 25-31): Defines [`true_false_decoding`](fever_confidence.pdl:25) with:
   - [`logprobs: true`](fever_confidence.pdl:27) to get token probabilities
   - [`top_logprobs: 5`](fever_confidence.pdl:28) for top-5 token alternatives
   - JSON schema constraining output to `[True, False]` (line 31)

2. **Simplified Evidence Scoring** (lines 77-106): 
   - Removes the LLM-as-judge topic relevance check
   - Uses stricter penalty factors (`-100`, `-200`, `-300`) for error cases

3. **Confidence Extraction** (lines 107-120):
   - Captures the LLM response with [`modelResponse: out`](fever_confidence.pdl:117)
   - Applies structured output parameters via [`true_false_decoding`](fever_confidence.pdl:118)
   - Computes confidence score using [`stdlib.bool_confidence(response=out)`](fever_confidence.pdl:119)
   - Returns the evaluation result (line 120)

**Advantages:**

- Provides calibrated confidence scores for verification decisions
- More efficient (fewer LLM-as-judge calls)
- Stricter error handling with graduated penalties

## Usage

Both programs expect the following variables to be defined:

- `model`: LLM model identifier (e.g., `watsonx/meta-llama/llama-3-3-70b-instruct`)
- `model_parameters`: Model configuration dictionary
- `temperature`: Sampling temperature (typically `0.8`)
- `problem`: The claim to verify (e.g., `"2 Hearts is a musical composition by Minogue."`)

Example configuration (commented out in both files):

```yaml
defs:
  model: watsonx/meta-llama/llama-3-3-70b-instruct
  model_parameters:
    data: {}
  temperature: 0.8
  problem: "2 Hearts is a musical composition by Minogue."
```

## References

- FEVER Dataset: [Thorne et al., 2018](https://arxiv.org/abs/1803.05355)
