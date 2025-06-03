---
hide:
  - navigation
  - toc
  - footer
---

# AutoPDL Tutorial

The following sections show how to use the AutoPDL optimizer to produce optimized PDL programs for specific tasks.

To optimize a PDL program, we need the program, an optimizer configuration, a dataset, and an _evaluator_. An evaluator is a Python subclass of `OptimizerEvaluator` that evaluates a candidate, which is a generated configuration instance consisting of e.g. fewshot examples. The evaluator class follows this structure:

```python title="src/pdl/optimize/optimizer_evaluator.py" linenums="1"
class OptimizerEvaluator(Thread):
    """Evaluates a candidate (configuration, i.e. fewshots, style) against **one** test example."""

    def __init__(
        self,
        pdl_program: Program,
        example: dict,
        candidate: dict,
        index: int,
        timeout: int,
        yield_output: bool,
        config: OptimizationConfig,
        cwd: Path,
        answer_key: str = "answer",
    ) -> None:
        super().__init__()
        self.pdl_program = pdl_program
        ...

    def get_scope(self) -> ScopeType:
        """
        Constructs a PDL scope for the candidate,
        can take self.candidate and self.config into account
        """

    def extract_answer(self, document: str) -> Any:
        """
        Extracts the final answer from the PDL result document,
        i.e. the string the PDL program returns
        """

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        """
        Checks the extracted answer against the groundtruth value,
        in self.example[self.answer_key]
        """
```

Let's go through an example for `GSM8K`. Our PDL program uses different prompt patterns from the prompt library, and the variables `prompt_pattern`, `question`, `model`, and `demonstrations` are inserted at runtime by the evaluator.


```yaml title="examples/optimizer/gsm8k.pdl" linenums="1"
--8<-- "./examples/optimizer/gsm8k.pdl"
```

We write a configuration file for the optimizer, see `src/pdl/optimize/config_parser.py` for all fields:

``` { .yaml .copy .annotate title="gsm8k_optimizer_config.yml" linenums="1" }
benchmark: gsm8k # Name our benchmark
budget: null # Set a budget, can be number of iterations, or a duration string e.g. "2h"
budget_growth: double # double validation set size each iteration
# or to_max: reach max_test_set_size by final iteration
initial_test_set_size: 2 # size of test set in first iteration
max_test_set_size: 10 # maximum test set size
num_candidates: 100 # how many candidates to evaluate
num_demonstrations: 5 # how many demonstrations to include per candidate
parallelism: 1 # how many threads to run evaluations across
shuffle_test: false # shuffling of test set
test_set_name: test # name of test set
train_set_name: train # name of train set
validation_set_name: validation # name of validation set
demonstrations_variable_name: demonstrations # variable name to insert demonstrations into
variables: # define discrete options to sample from
  model: # set ${ model } variable
    - watsonx/meta-llama/llama-3-1-8b-instruct
  prompt_pattern: # set ${ prompt_pattern } variable to one of these
    - cot
    - react
    - rewoo
  num_demonstrations: # overrides num demonstrations above
    - 0
    - 3
    - 5
```


```python title="examples/optimizer/gsm8k_evaluator.py" linenums="1"
--8<-- "./examples/optimizer/gsm8k_evaluator.py"
```

We can see an example of a script to run the optimization process in `examples/optimizer/optimize.py`.
Usage:

```
python optimize.py optimize -h
usage: optimize.py optimize [-h] --config CONFIG --dataset-path DATASET_PATH [--experiments-path EXPERIMENTS_PATH]
                            [--yield_output | --no-yield_output] [--dry | --no-dry]
                            pdl_file
```

We also need a dataset to optimize against, with `train`, `test`, and `validation` splits. To produce such a dataset, we can use HuggingFace Datasets `load_dataset` and `save_to_disk`. This example requires the dataset to have columns `question`, `reasoning`, and `answer`, which can be created from the original `openai/gsm8k` dataset. Processing scripts are under development and will follow shortly.

We can run an example like so:

```
cd examples/optimizer
python optimize.py optimize --config config.yml --dataset-path datasets/gsm8k gsm8k.pdl
```

Once the process is complete, a file `optimized_gsm8k.pdl` is written. This file contains the optimal configuration and is directly executable by the standard PDL interpreter.
