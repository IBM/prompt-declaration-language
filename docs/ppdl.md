
# PPDL: Probabilistic PDL

PPDL is the probabilistic extension of PDL, introduced in the paper
*[PPDL: LLM-Based Flows as Probabilistic Programs](https://openreview.net/forum?id=37hqMR7Cbx)*
(ICML 2026).
It turns any PDL program into a probabilistic program by adding a single new construct — `factor` — and
a set of plug-and-play probabilistic inference engines.

## Motivation

LLM-based flows accumulate uncertainty: each step depends on the (probabilistic) output of the previous
one, so errors compound.  PPDL addresses this in two complementary ways:

1. **Quantify uncertainty** — instead of a single output value, the runtime returns a *distribution* over
   possible outputs, giving users a principled view of confidence.
2. **Improve accuracy** — inference engines (importance sampling, SMC, majority voting) explore many
   execution traces in parallel and weight them by user-supplied constraints, steering the search toward
   more correct answers.

Because the inference engine is *orthogonal* to the program logic, you write the flow once and switch
between algorithms at runtime without touching a single line of PDL.

---

## The `factor` Block

PDL already provides the first core construct of probabilistic programming — **sample** — in the form of
an LLM model call.  PPDL adds the second: **factor**.

```yaml
factor: <score_expression>
```

`factor` updates the *score* (log-probability) of the current execution trace by the value of the
expression.  The expression must evaluate to a `float`.

* A **positive** value makes the current trace more likely (rewards).
* A **negative** value makes it less likely (soft penalty).
* `−∞` (or a very large negative number like `-1000`) is a **hard constraint** — it effectively
  eliminates the trace.

The result of a `factor` block is the empty string `""` and it does not contribute to the background
context.

### Simple example: biased coin

```yaml title="examples/ppdl/coin.pdl"
--8<-- "./examples/ppdl/coin.pdl"
```

Here the LLM is asked to guess the bias `p` of a coin given a sequence of observations.  The
`factor` block scores the trace by the log-likelihood of the observed flips given `p`, so that
after inference the distribution of `p` values concentrates around the one most consistent with
the data.

---

## Running PPDL Programs

PPDL programs are executed with the `pdl-infer` command-line tool (installed alongside `pdl`):

```bash
pdl-infer [OPTIONS] <program.pdl>
```

| Option | Default | Description |
|--------|---------|-------------|
| `--algo` | `smc` | Inference algorithm (see below) |
| `-n`, `--num-particles` | `5` | Number of particles |
| `-w`, `--workers` | unlimited | Max parallel workers |
| `-d`, `--data` | — | Initial scope variables (YAML/JSON string) |
| `-f`, `--data-file` | — | YAML file containing initial scope variables |
| `-v`, `--viz` | off | Display bar chart of the output distribution |

The tool prints a sample drawn from the output distribution.

### Example

```bash
# Run with Sequential Monte Carlo, 10 particles, 4 parallel workers
pdl-infer --algo smc -n 10 -w 4 examples/ppdl/coin.pdl
```

---

## Inference Algorithms

PPDL provides four families of inference engines, each available in a sequential and a
parallelized variant.

### Importance Sampling (`is` / `parallel-is`)

Runs `N` independent full traces of the program and weights the results by their accumulated
score.  Use this when the constraint information is mostly available at the *end* of a trace.

### Sequential Monte Carlo (`smc` / `parallel-smc`) — *default*

Runs `N` particles and **resamples** after each `factor` block: particles with a low score are
replaced by copies of higher-scoring particles.  This redirects compute toward more promising
partial traces *during* execution, making it particularly effective for deep multi-step flows
with informative intermediate constraints.

Resampling points correspond to `factor` blocks in the program.

### Majority Voting (`maj` / `parallel-maj`)

Runs `N` independent traces and ignores all factor scores; the output distribution is uniform.
Use this as a simple ensemble baseline when you do not have meaningful factors.

### Rejection Sampling (`rejection` / `parallel-rejection`)

Repeatedly runs the program until `N` accepted samples are collected.  Accepts a trace with
probability proportional to its score.

---

## Adding Constraints to a Flow

The real power of PPDL comes from combining a regular PDL flow with one or more `factor` blocks
that encode soft or hard constraints.

### LLM-as-a-Judge

Use an LLM call to score intermediate or final results:

```yaml
defs:
  llm: ollama/granite4:micro
  problem_statement: |
    Write a function to find nth centered hexagonal number.
    assert centered_hexagonal_number(10) == 271
lastOf:
  - >
    Generate an English plan for how to generate code for
    the following problem: ${ problem_statement }
  - model: ${ llm }
    def: plan

  # Score the plan using an LLM-as-judge
  - defs:
      score:
        lastOf:
          - Is this plan for the problem correct?
            Problem: ${ problem_statement }
            Plan: ${ plan }
          - model: ${ llm }
            parser: json
            spec: boolean
    # log-probability: 0 if true, -inf if false
    factor: ${ 0 if score else -1000 }

  - >
    Generate a complete Python function definition for: ${ problem_statement }
  - model: ${ llm }
    def: solution
  - ${ solution }
```

!!! note
    The PPDL paper uses a continuous score based on log-probabilities of the judge's *true/false*
    output tokens, which is available via the `expectations` sugar (see below).

### Rule-Based Constraints

Hard or soft constraints derived from deterministic checks:

```yaml
defs:
  count_warnings:
    function:
      code: string
    return:
      lang: python
      code: |
        import subprocess
        result = subprocess.run(
            "flake8 --isolated -", input=code, capture_output=True,
            shell=True, text=True, check=False
        )
        result = len(result.stdout.strip().splitlines())
...
  # Geometric prior: penalise each additional warning
  - defs:
      warnings:
        call: ${ count_warnings }
        args: { code: ${ solution.code } }
      import math
      penalty: ${ math.log(0.5) * warnings }
    factor: ${ penalty }
```

### Hard Constraints

Set the factor to a very large negative number to eliminate a trace entirely:

```yaml
factor: ${ 0 if valid else -1000 }
```

or use `factor: -1000` directly for a constant hard penalty.

---

## The `expectations` Sugar

For common LLM-as-a-judge patterns, PDL provides the `expectations` field on any block.
It is shorthand that automatically wires up an LLM judge and a `factor`:

```yaml
model: ${ llm }
def: solution
expectations:
  - expect: This solution is correct for the following problem.
    # optional custom feedback function; defaults to stdlib LLM judge
```

The runtime evaluates each expectation using the configured judge model and applies the
resulting score as a `factor`.  The `feedback` field allows providing a custom scoring
function that returns either a `float` score or a `[float, str]` pair where the string is
feedback injected into the context for retrying.

---

## Python SDK

### Running a PPDL program

```python
from pdl.pdl_infer import exec_file, exec_str, PpdlConfig
from pdl.pdl_distributions import Categorical

ppdl_config = PpdlConfig(
    algo="parallel-smc",   # or "is", "maj", "rejection", ...
    num_particles=10,
    max_workers=4,
)

dist: Categorical = exec_file("examples/ppdl/coin.pdl", ppdl_config=ppdl_config)

# Inspect the distribution
dist_sorted = dist.sort()           # sort by probability (highest first)
best = dist_sorted.values[0]        # most probable output
prob = dist_sorted.probs[0]         # its probability
print(f"Best answer: {best}  (p={prob:.4f})")

# Or sample from the distribution
sample = dist.sample()
```

### `PpdlConfig` reference

See [`PpdlConfig`](api_reference.md#src.pdl.pdl_infer.PpdlConfig) in the API reference.

### `exec_file` / `exec_str` / `exec_dict` / `exec_program`

See the [Probabilistic Inference section](api_reference.md#probabilistic-inference-ppdl) of the API reference.

### `Categorical` distribution

See [`Categorical`](api_reference.md#src.pdl.pdl_distributions.Categorical) in the API reference.

---

## Built-in Special Variables

During PPDL execution, the interpreter maintains two special scope variables:

| Variable | Description |
|----------|-------------|
| `pdl_context` | The accumulated conversation context (list of role/content messages). |
| `pdl_score` | The running log-probability of the current trace, updated by each `factor` block. |

`pdl_score` is not typically accessed in PDL programs directly; it is managed by the runtime
and used by the inference engine for weighting and resampling.

The variable `pdl_particle_id` (an integer) is injected into the scope for each particle,
which is useful when you need different behavior per particle (e.g., different random seeds).

---

## Parallel Execution

PPDL parallelizes execution at two levels:

1. **Across particles** — multiple traces are executed concurrently using a thread pool
   (`parallel-is`, `parallel-smc`, etc.). For SMC, a synchronization point occurs at each
   `factor` block for resampling.

2. **Within a single trace** — independent model calls within one trace are parallelized using
   futures.  The interpreter only awaits a model response when the result is actually needed,
   which is especially effective inside `defs` blocks where several variables can be computed
   concurrently.

Control the number of worker threads with the `-w` / `--workers` CLI flag or the
`max_workers` key in `PpdlConfig`.

---

## Complete Examples

### Name suggestion with demographic priors ([`examples/ppdl/name_finder.pdl`](https://github.com/IBM/prompt-declaration-language/blob/main/examples/ppdl/name_finder.pdl))

Demonstrates using `factor` to steer an LLM toward names that are popular in two different
geographic populations.

```yaml title="examples/ppdl/name_finder.pdl"
--8<-- "./examples/ppdl/name_finder.pdl"
```

### Hidden Markov Model posterior ([`examples/ppdl/hmm.pdl`](https://github.com/IBM/prompt-declaration-language/blob/main/examples/ppdl/hmm.pdl))

Shows PPDL as a general probabilistic programming language: a classical state-space model
where the LLM is replaced by a Python sampler, and `factor` encodes the observation
likelihood.

```yaml title="examples/ppdl/hmm.pdl"
--8<-- "./examples/ppdl/hmm.pdl"
```

### Code generation with constraints ([`examples/ppdl/mbpp.pdl`](https://github.com/IBM/prompt-declaration-language/blob/main/examples/ppdl/mbpp.pdl))

A MBPP benchmark program that combines an LLM-as-a-judge (`expectations`) with a
rule-based `flake8` linter score.

### Probabilistic ReAct agent ([`examples/prompt_library/gsm8k_prob_react.pdl`](https://github.com/IBM/prompt-declaration-language/blob/main/examples/prompt_library/gsm8k_prob_react.pdl))

Extends the standard ReAct agent with `factor` blocks that penalize invalid actions and
long trajectories, giving the SMC engine useful intermediate signals for resampling.

---

## Relationship to PDL

PPDL is a strict superset of PDL:

* Every PDL program is a valid PPDL program.  Running it with `pdl-infer -n 1` is equivalent
  to running it with `pdl`.
* The `factor` block is the only new language construct.
* The `expectations` field (available on any block) is syntactic sugar built on top of
  `factor` and the existing `retry` mechanism.
* All PDL features — variables, conditionals, loops, functions, tool calls, parsers,
  type-checking, imports — work unchanged inside PPDL programs.

The key difference is the **execution model**: whereas `pdl` always runs a single trace and
returns one result, `pdl-infer` runs many traces, weights them, and returns a `Categorical`
distribution over results.

---

## Further Reading

* [PPDL paper (ICML 2026)](https://openreview.net/forum?id=37hqMR7Cbx)
* [PDL Tutorial](tutorial.md) — full PDL language reference
* [API Reference](api_reference.md) — Python SDK documentation
