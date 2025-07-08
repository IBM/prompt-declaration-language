---
hide:
  - navigation
  - toc
  - footer
---

# AutoPDL Tutorial

The following sections show how to use the AutoPDL optimizer introduced by [Spiess et al. (2025)](https://openreview.net/forum?id=CAeISyE3aR) in "AutoPDL: Automatic Prompt Optimization for LLM Agents" ([arXiv](https://arxiv.org/abs/2504.04365)), to produce optimized PDL programs for specific tasks. Please ensure PDL was installed with extras e.g.

``` { .bash .copy .annotate linenums="1" }
pip install 'prompt-declaration-language[all]'
# or from source
git clone git@github.com:IBM/prompt-declaration-language.git
cd prompt-declaration-language
pip install -e '.[all]'
```

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

We write a configuration file for the optimizer, and save it as `gsm8k_optimizer_config.yml`. See `src/pdl/optimize/config_parser.py` for all fields. Please note that this example uses the `watsonx` inference service, so an API key is required, although you can also use a local model or any other inference service.

``` { .yaml .copy .annotate title="examples/optimizer/gsm8k_optimizer_config.yml" linenums="1" }
--8<-- "./examples/optimizer/gsm8k_optimizer_config.yml"
```

```python title="examples/optimizer/gsm8k_evaluator.py" linenums="1"
--8<-- "./examples/optimizer/gsm8k_evaluator.py"
```

We can see an example of a script to run the optimization process in `examples/optimizer/optimize.py`.
Usage:

```text
python optimize.py optimize -h
usage: optimize.py optimize [-h] --config CONFIG --dataset-path DATASET_PATH [--experiments-path EXPERIMENTS_PATH]
                            [--yield_output | --no-yield_output] [--dry | --no-dry]
                            pdl_file
```

We also need a dataset to optimize against, with `train`, `test`, and `validation` splits. To produce such a dataset, we can use HuggingFace Datasets `load_dataset` and `save_to_disk`. This example requires the dataset to have columns `question`, `reasoning`, and `answer`, which can be created from the original `openai/gsm8k` dataset.

We provide three scripts in `examples/optimizer` to create datasets, including the rule based agentic trajectories. These are `process_gsm8k.py`, `process_fever.py`, and `process_mbpp.py`. They load the original datasets, process them, and save them to disk in the required format. Dataset specific instructions may be found in the respective script files. Note that the scripts create a folder named `var` in the current directory, which contains the processed dataset in a format that can be used by the optimizer. Therefore, they should be run in the root of the PDL repository.

Let's run the GSM8K dataset processing script:

``` { .bash .copy .annotate linenums="1" }
python examples/optimizer/process_gsm8k.py
```

Which should save the processed dataset in `var/gsm8k_trajectified` and output something like:

```text
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 6449/6449 [00:00<00:00, 557195.73 examples/s]
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 1319/1319 [00:00<00:00, 363559.64 examples/s]
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 1024/1024 [00:00<00:00, 271472.56 examples/s]
Map: 100%|██████████████████████████████████████████████████████████████████████████████████████████████| 6449/6449 [00:00<00:00, 71242.31 examples/s]
Map: 100%|██████████████████████████████████████████████████████████████████████████████████████████████| 1024/1024 [00:00<00:00, 68826.30 examples/s]
Map: 100%|██████████████████████████████████████████████████████████████████████████████████████████████| 6449/6449 [00:00<00:00, 22520.85 examples/s]
Map: 100%|██████████████████████████████████████████████████████████████████████████████████████████████| 6449/6449 [00:00<00:00, 18186.53 examples/s]
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 6449/6449 [00:00<00:00, 698328.77 examples/s]
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 1319/1319 [00:00<00:00, 232468.57 examples/s]
Saving the dataset (1/1 shards): 100%|█████████████████████████████████████████████████████████████████| 1024/1024 [00:00<00:00, 413375.10 examples/s]
DatasetDict({
    train: Dataset({
        features: ['question', 'answer', 'reasoning', 'raw_answer', 'answer_part', 'traj_keys', 'traj_values', 'rewoo_traj_keys', 'rewoo_traj_values'],
        num_rows: 6449
    })
    test: Dataset({
        features: ['question', 'answer', 'reasoning', 'raw_answer', 'answer_part'],
        num_rows: 1319
    })
    validation: Dataset({
        features: ['question', 'answer', 'reasoning', 'raw_answer', 'answer_part'],
        num_rows: 1024
    })
})
```

Finally, we can run the example like so:

``` { .bash .copy .annotate linenums="1" }
cd examples/optimizer
python optimize.py optimize --config gsm8k_optimizer_config.yml --dataset-path ../../var/gsm8k_trajectified gsm8k.pdl
```

This will report details about the optimization process, such as the number of candidates evaluated. The output will look something like this:

```text
                                           PDL Optimizer                                  pdl_optimizer.py:336
           ┌──────────────────────────────┬─────────────────────────────────────────────┐
           │ Config combinations          │ 9                                           │
           │ Max candidates               │ 100                                         │
           │ Num. candidates              │ 100                                         │
           │ Starting validation set size │ 2                                           │
           │ Max validation set size      │ 10                                          │
           │ Num. iterations              │ 7                                           │
           │ Total evaluations            │ 1,200                                       │
           │ Num. threads                 │ 1                                           │
           │ Validation set multiplier    │ 2                                           │
           │ Shuffle validation set       │ False                                       │
           │ Budget policy                │ None                                        │
           ├──────────────────────────────┼─────────────────────────────────────────────┤
           │ model                        │ ['watsonx/meta-llama/llama-3-2-3b-instruct… │
           │ prompt_pattern               │ ['cot', 'react', 'rewoo']                   │
           │ num_demonstrations           │ [0, 3, 5]                                   │
           └──────────────────────────────┴─────────────────────────────────────────────┘
                     Iteration                                                            pdl_optimizer.py:419
           ┌─────────────────────┬─────┐
           │ Index               │ 0   │
           │ Validation set size │ 2   │
           │ Num. candidates     │ 100 │
           └─────────────────────┴─────┘
                                        Evaluation                                        pdl_optimizer.py:601
           ┌────────────────────────┬──────────────────────────────────────────┐
           │ Test set size          │ 2                                        │
           ├────────────────────────┼──────────────────────────────────────────┤
           │ model                  │ watsonx/meta-llama/llama-3-2-3b-instruct │
           │ prompt_pattern         │ cot                                      │
           │ num_demonstrations     │ 0                                        │
           │ uuid                   │ enl0ertp                                 │
           │ demonstrations_indices │ 0                                        │
           │ demonstrations         │ 0                                        │
           └────────────────────────┴──────────────────────────────────────────┘
           Running without parallelism                                                              util.py:74
   0% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 0/1,200  [ 0:00:01 < -:--:-- , ? it/s ]
```

Note that it is not unusual to observe PDL exceptions during the optimization process.

```text
[15:44:14] Type errors during spec checking:
../../contrib/prompt_library/ReAct.pdl:0 -  should be an object
../../contrib/prompt_library/ReAct.pdl:0 - Type errors during spec checking:
../../contrib/prompt_library/ReAct.pdl:0 -  should be an object
Retrying:  False
Runtime FAILED and took seconds: 10.21
```

Such exceptions, here for example in `ReAct.pdl`, are caused by the _typed_ model call in `ReAct.pdl:98`. If the model output does not result in a parsable JSON that matches the expected type `{ name: string, arguments: object }`, the PDL interpreter raises an exception.

Once the process is complete, a file `optimized_gsm8k.pdl` is written in same directory as the source PDL file. This file contains the optimal configuration and is directly executable by the standard PDL interpreter. A log of the optimization process is written to `experiments/` by default.
