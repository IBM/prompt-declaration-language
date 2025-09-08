---
hide:
  - navigation
  - toc
  - footer
---

# AutoPDL Tutorial

This tutorial describes how to use AutoPDL, PDL's prompt optimizer tool [Spiess et al. (2025)](https://openreview.net/forum?id=CAeISyE3aR). AutoPDL can be used to optimize any part of a PDL program. This includes few-shots examples and textual prompts, but also prompting patterns. It outputs an optimized PDL program with optimal values.

## Installing AutoPDL

Please ensure PDL was installed with extras e.g.

``` { .bash .copy .annotate linenums="1" }
pip install 'prompt-declaration-language[all]'
# or from source
git clone git@github.com:IBM/prompt-declaration-language.git
cd prompt-declaration-language
pip install -e '.[all]'
```

## Writing a PDL program to optimize

The first step in using AutoPDL is to write a PDL program that has free variables. Consider for example, the following PDL program, which queries an LLM to correct a sentence with grammatical errors ([file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/optimizer/grammar_correction.pdl)):

```yaml linenums="1"
--8<-- "./examples/optimizer/grammar_correction.pdl"
```

This program starts with a definition section. Note that a `defs` section is necessary. This is followed by a `lastOf` sequence (a list of blocks to be executed where the result of the last block is returned as the result of the whole sequence). First, the program establishes some demonstrations obtained from a `demonstrations` variable. The `for` loop at lines 5 to 10 ensures that all demonstrations are formatted in a consistent way. On lines 11 to 16 the program formulates a prompt to correct a sentence stored in variable `input`. Lines 17 through 21 show a model call where the model id is given by variable `model`. Finally, lines 23 through 28 check if variable `verify` is set to `true`. If so, it makes another model to verify the previous response and to produce a new one if needed.

Notice that variables `input`, `model`, `demonstrations`, `verify` are not defined. The first of these is an instance variable that will help in holding different instances when the optimizer is running. The rest of them are parameters to be optimized. We can pick among different models, different demonstrations, and especially different prompting patterns. PDL supports first-class functions, so the program could be made to pick the optimal function to be used, thereby choosing the prompting pattern. In this example, finding an optimal value for `verify` will determine whether it's best to call the model once or twice.



## Dataset

In addition to the PDL program, AutoPDL also needs a dataset. These will be used to perform the optimization, and as a source of demonstrations. The train split will be used to draw instances and demonstrations, the validation for checking during the optimization, and test to evaluate and obtain a final score at the end of the optimization run.

 In this example, we need a dataset containing sentences with mistakes and the corrected version. We can use [process_grammar_correction.py](https://github.com/IBM/prompt-declaration-language/blob/main/examples/optimizer/process_grammar_correction.py) to obtain a dataset split into train/validation/test. Simply run:

```
python process_grammar_correction.py
```

## Loss function

The lost function is use to guide the optimizer towards the best solution and evaluate the final program. The loss function can must be a PDL function named `score` that takes as input the result of the program, the ground truth, and returns a floating point number.
In our example, we are using the Levenshtein distance that we import from the `textdistance` Python module. The `score` function is defined in the [`eval_levenshtein.pdl` file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/optimizer/eval_levenshtein.pdl):

```yaml
--8<-- "./examples/optimizer/eval_levenshtein.pdl"
```

The final ingredient needed is a configuration file as explained in the next section.

## Writing a configuration file

An AutoPDL configuration file describes the state-space and parameters for the search. In this example, the configuration is given in the following [file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/optimizer/grammar_correction.yaml):

```yaml
--8<-- "./examples/optimizer/grammar_correction.yaml"
```

Field `pdl_path` is the path to the PDL program to optimize. `dataset` points to the dataset to be used. In this case, it's an object with paths for train/validation/test splits. 
`demonstrations_variable_name` gives the name of the PDL variable that will hold the demonstrations in the optimized program. `demonstration_columns` indicates the field names in the dataset that will be used to create demonstrations, and `instance_columns` are those fields that will be used to formulate an instance query (see the query in the PDL program above, which uses `input`). The `groundtruth_column` holds the field with the ground truth (in this case `output`). `eval_pdl` is the path of the PDL program that encapsulates the loss function.

`initial_validation_set_size` is the initial size of the validation set (i.e., the number of tests used initially to validate candidates). `max_validation_set_size` indicates the maximum to which this validation set will grow. For more details on the successive halving algorithm used in AutoPDL see [here](https://arxiv.org/abs/2504.04365). `max_test_set_size: 10` is the maximum of the test set used to evaluate at the end of the evaluation run. `num_candidates` indicates the number of candidates to consider (sampled randomly). `parallelism` indicates the level of parallelism used by the optimizer.

Last but not least, `variables` indicates the domain of each variable that needs to be tuned. In this case, `model` can be either an Ollama Granite model or gpt-oss. `num_demonstration` is a special variable that the user can set to indicate how many demonstrations to consider. In this case, zero-shot is also included. Finally, the domain of variable `verify` can be `true` or `false`.

Notice that variable `input` in the PDL program is not given a domain. This is because it will hold the different instances that will be evaluated (it was included in the `instance_columns` field).

For a complete list of available fields in the configuration file is given in the configuration parser [file](https://github.com/IBM/prompt-declaration-language/blob/main/src/pdl/optimize/config_parser.py).


We are ready to run the optimizer!

## Running AutoPDL

To run the optimizer, execute the following command:

```
pdl-optimize -c grammar_correction_example.yml
```

After a while, AutoPDL creates a new file `optimized_grammar_correction.pdl` with definitions for all the free variables. It determined that gtp-oss is the better model for the task at hand, and that `verify` is best set to False. The optimized program contains the selection of demonstrations. To run this program add a definition for `input`:

```
defs:
  ...
  input: This sentence have an error.
```

To run the optimized program, execute the command:
```
pdl optimized_grammar_correction.pdl
```

A log of the optimization process is written to `experiments/` by default.
