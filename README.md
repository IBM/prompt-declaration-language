# Prompt Description Language

The Prompt Decription Language (PDL) is a language to specify interactions between a user (prompts) and LLMs, and to compose their use with other tools. It is a declarative language to describe the shape of interactions and provide a way to specify constraints that must be satisfied. PDL scripts can be used for inference, LLM chaining, as well as composition with other tools such as code and APIs. PDL has an interpreter (`pdl/pdl.py`) that can be used for inference and to render programs into documents that capture the result of LLMs and tools interactions.



In the future, we plan to provide checking and validation, as well as code generation (e.g., data synthesis, data processing pipelines) since PDL scripts can serve as a single-source of truth. The specified constraints can further be used for constrained decoding when using an LLM.

You can find a demo video of PDL [here](https://ibm.box.com/s/g3x5zbd7b56o223mtqte3sr5e0xkttnl).

## Overview

## Interpreter Installation

The interpreter has been tested with Python version 3.11.6.

To install the requirements for `pdl.py`, execute the command:

```
pip3 install -r requirements.txt
```

In order to run the examples that use BAM models, you need to set up 2 environment variables:
- `GENAI_API` set to `https://bam-api.res.ibm.com/`
- `GENAI_KEY` set to your BAM API key. To obtain your key, go to the [BAM](https://bam.res.ibm.com/) main page. On the right and under the "Documentation" section, you will see a button to copy your API key.

To run the interpreter:

```
python3 -m pdl.pdl <path/to/example.yaml>
```

The folder `examples` contains some examples of PDL scripts. Several of these examples have been adapted from the LMQL [paper](https://arxiv.org/abs/2212.06094) by Beurer-Kellner et al. 

We highly recommend to use VSCode to edit PDL YAML files. This project has been configured so that every YAML file is associated with the PDL grammar JSONSchema. This enables the editor to give errors when the yaml deviates from the schema and provides code completion. *Notice that the error messages given in the VS Code editor are more precise than the output of the interpreter when a YAML is ill-formed.*

The following section is an introduction to PDL.

## Introduction to PDL

PDL scipts are specified in YAML, which reflects their declarative nature. YAML is also easy to write and to consume by other tools, unlike DSLs that require a suite of tools. Unlike other LLM programming frameworks, PDL is agnostic of any programming language. The user describes the shape of a document, elements of which capture interactions with LLMs and other tools. 

The following is a simple `hello, world` script:

```
description: Hello world!
document:
  - |
    Hello, world!
    This is your first prompt descriptor!
```

This script has a `description` and specifies the `document` of the document. In this case, there are no calls to an LLM or other tools.
To render the script into an actual document, we have a PDL interpreter that can be invoked as follows:

```
python3 -m pdl.pdl ./examples/hello/hello.yaml
```

This results in the following output:

```
Hello, world!
This is your first prompt descriptor!
```

### Prompt Blocks

PDL scripts can have nested `block`s of document. A block of document can have various properties including `repeats`, `repeats_until`, and `condition`.

The following example shows a block of document that is repeated 3 times.

```
description: Hello world with a nested block
document:
- |
  Hello, world!
  This is your first prompt descriptor!
- document:
  - |
    This sentence repeats!
  repeats: 3
```

It results in the following document, when ran through the interpreter:

```
Hello, world!
This is your first prompt descriptor!
This sentence repeats!
This sentence repeats!
This sentence repeats!
```

The property `repeats_until` indicates repetition of the block until a condition is satisfied, and `condition` specifies that the block is executed only if the condition is true. Currently, the only supported conditions are `ends_with` and `contains`. See examples of these properties in [`examples/arith/Arith.yaml`](examples/arith/Arith.yaml).

### LLM Call

In the next example, a `model` block is used to call into an LLM. The `model` section requests a call to the `ibm/granite-20b-code-instruct-v1` model on BAM with `greedy` decoding scheme. The input to the model is the entire context, meaning all the text generated from the start of the script (this can be changed using the `input` field). The field `stop_sequences` indicates strings that cause generation to stop and `include_stop_sequence` if the string the stopped the generation should be part of the output.

```
description: Hello world with a call into a model
document:
- Hello,
- model: ibm/granite-20b-code-instruct-v1
  parameters:
    decoding_method: greedy
    stop_sequences:
    - '!'
    include_stop_sequence: true
- "\n"
```

This results in the following document, where the text `world` has been generated by granite. 

```
Hello, world!
```

### Variable Definition and Value

In the following example, we store the result of the LLM call in a variable `NAME` using the `def` field. Then value of variable is recalled using a `get` block:

```
description: Hello world with variable use
document:
- Hello,
- model: ibm/granite-20b-code-instruct-v1
  parameters:
    decoding_method: greedy
    stop_sequences:
    - '!'
    include_stop_sequence: true
  def: NAME
- "\n"
- Who is
- get: NAME
- "?\n"
```

This results in the following document:
```
Hello, world!
Who is world?
```

### Model Chaining

PDL also allows multiple models to be chained together as in the following example, where 2 different models are called.

```
description: Hello world showing model chaining
document:
- Hello,
- model: ibm/granite-20b-code-instruct-v1
  parameters:
    decoding_method: greedy
    stop_sequences:
    - '!'
    include_stop_sequence: true
  def: NAME
- "\n"
- Who is
- get: NAME
- "?\n"
- model: google/flan-t5-xl
  parameters:
    decoding_method: greedy
    stop_sequences:
    - '!'
    include_stop_sequence: false
- "\n"
```

This results in the following document:

```
Hello, world!
Who is world?
Hello, world
```

where the last line is the output of the second model `google/flan-t5-xl`, when given the first 2 lines as input.

### Python Code

The following script shows how to execute python code. Currently, the python code is executed locally. In the future, we plan to use a serverless cloud engine to execute snippets of code. So in principle, PDL is agnostic of any specific programming language. The result of the code must be assigned to the variable `result` internally to be propagated to the result of the block.

```
description: Hello world showing call out to python code
document:
- 'Hello, '
- lan: python
  code:
  - |
    import random
    import string
    result = random.choice(string.ascii_lowercase)
- "!\n"
```

This results in the following output:
```
Hello, r!
```

### API Calls

PDL variables can also be fulfilled by making API calls. Consider a simple weather app (`examples/hello/weather.json`), where the user asks a question about the weather in some location. Then we make one call to an LLM to extract the location entity, use it to make an API call to get real-time weather information for that location, and then make a final call to an LLM to interpret the JSON output and return an English text to the user with the weather information. In this example, the call to the API is made with the following block:

```
- api: https
  url: https://api.weatherapi.com/v1/current.json?key=XXXXXX
  input:
    get: LOCATION
  def: WEATHER
  show_result: false
```

Notice that by setting `show_result` to `false`, we exclude the text resulting from this interaction from the final output document. This can be handy to compute intermediate results that can be passed to other calls.

See a [demo](https://ibm.box.com/s/g3x5zbd7b56o223mtqte3sr5e0xkttnl) video of this example.

### Input Blocks

PDL can accept textual input from a file or stdin. In the following example, the contents of the file `examples/input/data.txt` are read by PDL and incorporated as a prompt. In this case, the result is assigned to a variable `HELLO`, which is immediately used.

```
description: PDL code with input block
document:
- filename: examples/input/data.txt
  def: HELLO
  show_result: False
- get: HELLO
```

In the next example, document are obtained from stdin.
```
description: PDL code with input block
document:
- "The following will prompt the user on stdin.\n"
- stdin: True
  message: "Please provide an input: "
  def: STDIN
```

Notice that when executing this program, the stdin input is obtained first and then the entire document is printed. The document is not printed as it gets produced since there may be portions that are intermediate results and must be hidden (see `show_result` feature above). If the `message` field is omitted then one is provided for you.

The following example shows a multiline stdin input. When executing this code and to exit from the multiline input simply press control D (macos).
```
description: PDL code with input block
document:
- "A multiline stdin input.\n"
- stdin: True
  multiline: True
```

Finally, the following example shows reading content in JSON format. In this case the block's `assign` field must be defined since the block adds the JSON content in that format to the scope, assigning this content to the named variable.

Consider the JSON content in file `tests/data/input.json`:
```
{
    "name": "Bob",
    "address": {
        "number": 87,
        "street": "Smith Road",
        "town": "Armonk", 
        "state": "NY",
        "zip": 10504
    }
}
```

The following PDL program reads this content and assigns it to variable `PERSON` in JSON format. The reference `PERSON.address.street` then refers
to that field inside the JSON object.

```
{
    "description": "Input block example with json input",
    "document": [
        {
            "filename": "tests/data/input.json", 
            "json_content": true, 
            "def": "PERSON",
            "show_result": false
        }, 
        {
            "get": "PERSON.name"
        },
        " lives at the following address:\n",
        {
            "get": "PERSON.address.number"
        },
        " ",
        {
            "get": "PERSON.address.street"
        },
        " in the town of ",
        {
            "get": "PERSON.address.town"
        },
        " ",
        {
            "get": "PERSON.address.state"
        }
    ]
}
```




## Additional Notes and Future Work

- Currently, model blocks support the [text generation](https://bam.res.ibm.com/docs/api-reference#text-generation) interface of BAM, with the exception
that we provide some default values when the following parameters are missing:
  - `decoding_method`: `greedy`
  - `max_new_tokens`: 1024
  - `min_new_tokens`: 1
  - `repetition_penalty`: 1.07

- Only simple GETs are supported for API calls currently (see example: `examples/hello/weather.json`). We plan to more fully support API calls in the future.

- The example `examples/react/React.json` is work-in-progress.

- PDL scripts can also contain constraints for the output of an LLM. This can be used for constrained decoding and is part of future work (not currently supported).
In the following example, the variable `NAME` is constrained to consist of a single word.

```
{
    "description": "Hello world with a constraint",
    "document": [
        "Hello,",
        {
            "var": "NAME",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "input": "context",
                parameters: {
                  "decoding_method": "greedy",
                  "stop_sequences": [
                      "!"
                  ],
                }
                "constraints": [
                    {
                        "words_len": 1
                    }
                ]
            }
        },
        "!\n"
    ]
}
```

## Contributing to the Project

See [Contributing to PDL](docs/contrib.md)
