# Prompt Declaration Language

LLMs will continue to change the way we build software systems. They are not only useful as coding assistants, providing snipets of code, explanations, and code transformations, but they can also help replace components that could only previously be achieved with rule-based systems. Whether LLMs are used as coding assistants or software components, reliability remains an important concern. LLMs have a textual interface and the structure of useful prompts is not captured formally. Programming frameworks do not enforce or validate such structures since they are not specified in a machine-consumable way. The purpose of the Prompt Declaration Language (PDL) is to allow developers to specify the structure of prompts and to enforce it, while providing a unified programming framework for composing LLMs with rule-based systems. 

PDL is based on the premise that interactions between users, LLMs and rule-based systems form a *document*. Consider for example the interactions between a user and a chatbot. At each interaction, the exchanges form a document that gets longer and longer. Similarly, chaining models together or using tools for specific tasks result in outputs that together form a document. PDL allows users to specify the shape and contents of such documents in a declarative way (in YAML or JSON), and is agnostic of any programming language. Because of its document-oriented nature, it can be used to easily express a variety of data generation tasks (inference, data synthesis, data generation for model training, etc...). Moreover, PDL programs themselves are structured data (YAML) as opposed to traditional code, so they make good targets for LLM generation as well.


PDL provides the following features:
- Ability to use any LLM locally or remotely via [IBM's Watsonx](https://www.ibm.com/watsonx) and [LiteLLM](https://www.litellm.ai/)
- Ability to templatize not only prompts for one LLM call, but also composition of LLMs with tools (code and APIs). Templates can encompass tasks of larger granularity than a single LLM call (unlike many prompt programming languages)
- Control structures: variable definitions and use, conditionals, loops, functions
- Ability to read from files, including JSON data
- Ability to call out to code. At the moment only Python is supported, but this could be any other programming language in principle
- Ability to call out to REST APIs
- Type checking input and output of model calls
- Python SDK
- Live Document visualization: a UI that allows the user to see 


The PDL interpreter (`pdl/pdl.py`) takes a PDL program as input and renders it into a document by execution its instructions (calling out to models, code, apis, etc...). 

See below for installation notes, followed by an [overview](#overview) of the language. A more detailed description of the language features can be found in this [tutorial](https://ibm.github.io/prompt-declaration-language/tutorial).

## Demo Video 
 
https://github.com/user-attachments/assets/2629bf1e-bc54-4c45-b598-47914ab05a45


## Interpreter Installation

The interpreter has been tested with Python version **3.12**.

To install the requirements for `pdl`, execute the command:

```
pip3 install .
```

To install the dependencies for development of PDL and execute all the example, execute the command:
```
pip3 install '.[all]'
```



In order to run the examples that use foundation models hosted on [Watsonx](https://www.ibm.com/watsonx), you need an account (a free plan is available) and set up the following environment variables:
- `WATSONX_API`, the API url (set to `https://{region}.ml.cloud.ibm.com`)
- `WATSONX_KEY`, the API key (see information on [key creation](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key))
- `WATSONX_PROJECT_ID`, the project hosting the resources (see information about [project creation](https://www.ibm.com/docs/en/watsonx/saas?topic=projects-creating-project) and [finding project ID](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-project-id.html?context=wx)).

To reach these models via LiteLLM, follow instructions on this [documentation](https://docs.litellm.ai/docs/providers/watsonx).

To run the interpreter:

```
pdl <path/to/example.yaml>
```

The folder `examples` contains many examples of PDL programs. Several of these examples have been adapted from the LMQL [paper](https://arxiv.org/abs/2212.06094) by Beurer-Kellner et al. They cover a variety of prompting patterns, see [prompt-library](https://github.com/IBM/prompt-declaration-language/blob/main/examples/prompt_library) for a library of ready-to-use prompting patterns. 

We highly recommend using VSCode to edit PDL YAML files. This project has been configured so that every YAML file is associated with the PDL grammar JSONSchema (see [settings](https://github.com/IBM/prompt-declaration-language/blob/main/.vscode/settings.json) and [schema](https://github.com/IBM/prompt-declaration-language/blob/main/pdl-schema.json)). This enables the editor to display error messages when the yaml deviates from the PDL syntax and grammar. It also provides code completion. You can set up your own VSCode PDL projects similarly using this settings and schema files. The PDL interpreter also provides similar error messages.

The interpreter prints out a log by default in the file `log.txt`. This log contains the details of inputs and outputs to every block in the program. It is useful to examine this file when the program is behaving differently than expected.

To change the log filename, you can pass it to the interpreter as follows:

```
pdl --log <my-logfile> <my-example>
```

We can also pass initial data to the interpreter to populate variables used in a PDL program, as follows:

```
pdl --data <JSON-or-YAML-data> <my-example>
```

This can also be done by passing a JSON or YAML file:

```
pdl --data-file <JSON-or-YAML-file> <my-example>
```

The interpreter can also output a trace file that is used by the Live Document visualization tool (see [Live Document](#live_document)):

```
pdl <my-example> --trace
```

For more information:
```
pdl --help
```

## Overview

In PDL, we can write some YAML to create a prompt and call an LLM:

```yaml
description: Hello world
document:
- Hello,
- model: ibm/granite-34b-code-instruct
  params:
    stop_sequences:
    - '!'
    include_stop_sequence: true
- "\n"
```

The `description` field is a description for the program. Field `document` contains a list of either strings or *block*s which together form the document to be produced. In this example, the document starts with the string `"Hello"` followed by a block that calls out to a model. In this case, it is model with id `ibm/granite-34b-code-instruct` from [watsonx](https://www.ibm.com/watsonx), with the indicated parameters: the stop sequence is `!`, which is to be included in the output. The input to the model call is everything that has been produced so far in the document (here `Hello`).

When we execute this program using the PDL interpreter:

```
pdl examples/hello/hello.pdl
```

we obtain the following document:

```
Hello, World!
```

where the portion `, World!` was produced by granite. In general, PDL provides blocks for calling to models, Python code, as well as APIs and makes it easy to compose them together with control structures (sequencing, conditions, loops).


Consider now an example from AI for code, where we want to build a prompt template for code explanation. We have a JSON file as input
containing the source code and some information regarding the repository where it came from.

For example, given the data in this JSON [file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/code/data.yaml):
```yaml
source_code: 
  |
  @SuppressWarnings("unchecked")
  public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
    Map<String, String> offsetMap;
    if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {    
      offsetMap = new HashMap<>();  
    } else {
      offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);  
    }
    return offsetMap;
  }
repo_info: 
  repo: streamsets/datacollector
  path: stagesupport/src/main/java/com/.../OffsetUtil.java
  function_name: OffsetUtil.deserializeOffsetMap
```

we would like to express the following prompt and submit it to an LLM:

```
Here is some info about the location of the function in the repo.
repo: 
streamsets/datacollector
path: stagesupport/src/main/java/com/.../OffsetUtil.java
Function_name: OffsetUtil.deserializeOffsetMap


Explain the following code:

@SuppressWarnings("unchecked")
public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
  Map<String, String> offsetMap;
  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {
    offsetMap = new HashMap<>();
  } else {
    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);
  }
  return offsetMap;
}
```

In PDL, this would be expressed as follows (see [file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/code/code.pdl)):

```yaml
description: Code explanation example
document:
- read: examples/code/data.yaml
  parser: yaml
  def: CODE
  show_result: False
- "\n{{ CODE.source_code }}\n"
- model: meta-llama/llama-3-70b-instruct
  input:
      - |
        Here is some info about the location of the function in the repo.
        repo: {{ CODE.repo_info.repo }}
        path: {{ CODE.repo_info.path }}
        Function_name: {{ CODE.repo_info.function_name }}


        Explain the following code:
        ```
        {{ CODE.source_code }}```
- "\n"
```

The first block of the document is an *input* block. It reads the indicated filename (`examples/code/data.yaml`) and loads its contents into a variable named `CODE`. In PDL, any block can have a `def` field, which means the output of that block is assigned to that variable. Since the field `parser` is set to `yaml`, variable `CODE` contains that data in YAML format. The final field in the input block says that `show_result` is set to `false`, which means that the output of this block (the content that was read) is not included in the document. This feature allows the user to obtain intermediate results that are not necessarily included in the final output.

The second block is simply a string and writes out the source code. This is done by accessing the variable `CODE`. The syntax `{{ var }}` means accessing the value of a variable in the scope. Since `CODE` contains YAML data, we can also access fields such as `CODE.source_code`.

The third block calls a granite model. Here we explicitly provide an `input` field which means that we do not pass the entire document produced so far to the model, but only what is specified in this field. In this case, we specify our template by using the variable `CODE` as shown above.

When we execute this program with the PDL interpreter, we obtain the following document:

```

@SuppressWarnings("unchecked")
public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
  Map<String, String> offsetMap;
  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {    
    offsetMap = new HashMap<>();  
  } else {
    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);  
  }
  return offsetMap;
}


The code is used to deserialize a string into a map. The string is expected to be a JSON representation of a map. If the string is null or empty, an empty map is returned. Otherwise, the string is deserialized using the Jackson library and the resulting map is returned.

The code uses the `@SuppressWarnings("unchecked")` annotation to suppress the warning that the `JSON_MAPPER.readValue()` method returns an `Object` and not a `Map`. This is safe because the Jackson library is used to deserialize the string into a map, and it will throw an exception if the string is not a valid JSON representation of a map.

The code also handles the case where the string is not a valid JSON representation of a map by throwing an `IOException`. This can happen if the string contains invalid JSON syntax or if it does not represent a map.
```

Notice that in PDL variables are used to templatize any entity in the document, not just textual prompts to LLMs. We can add a block to this document to evaluate the quality of the output using a similarity metric with respect to our [ground truth](https://github.com/IBM/prompt-declaration-language/blob/main/examples/code/ground_truth.txt). See [file](https://github.com/IBM/prompt-declaration-language/blob/main/examples/code/code-eval.yaml):

```yaml
description: Code explanation example
document:
- read: ./data.yaml
  parser: yaml
  def: CODE
  show_result: False
- "\n{{ CODE.source_code }}\n"
- model: ibm/granite-34b-code-instruct
  def: EXPLANATION
  input: |
      Here is some info about the location of the function in the repo.
      repo: 
      {{ CODE.repo_info.repo }}
      path: {{ CODE.repo_info.path }}
      Function_name: {{ CODE.repo_info.function_name }}


      Explain the following code:
      ```
      {{ CODE.source_code }}```
- read: ./ground_truth.txt
  def: TRUTH
  show_result: False
- |


  EVALUATION:
  The similarity (Levenshtein) between this answer and the ground truth is:
- def: EVAL
  lan: python
  code: |
    import textdistance
    expl = """
    {{ EXPLANATION }}
    """
    truth = """
    {{ TRUTH }}
    """
    result = textdistance.levenshtein.normalized_similarity(expl, truth)
- "\n"
```

This program has an input block that reads the ground truth from filename `examples/code/ground_truth.txt` and assigns its contents to variable `TRUTH`. It also assigns the output of the model to the variable `EXPLANATION`. The last block is a call to Python code, which is included after the `code` field. Notice how code is included here simply as data. We collate fragments of Python with outputs obtained from previous blocks. This is one of the powerful features of PDL: the ability to specify the execution of code that is not known ahead of time. We can use LLMs to generate code that is later executed in the same programming model. This is made possible because PDL treats code as data, like any another part of the document.

When we execute this new program, we obtain the following:

```

@SuppressWarnings("unchecked")
public static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {
  Map<String, String> offsetMap;
  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {    
    offsetMap = new HashMap<>();  
  } else {
    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);  
  }
  return offsetMap;
}


The function `deserializeOffsetMap` takes a string as input and returns a map. It first checks if the input string is null or empty. If it is, it creates a new empty map and returns it. Otherwise, it uses the Jackson library to parse the input string into a map and returns it.

The `@SuppressWarnings("unchecked")` annotation is used to suppress the warning that the type of the parsed map is not checked. This is because the Jackson library is used to parse the input string into a map, but the specific type of the map is not known at compile time. Therefore, the warning is suppressed to avoid potential issues.

EVALUATION:
The similarity (Levenshtein) between this answer and the ground truth is:
0.9967637540453075
```

PDL allows rapid prototyping of prompts by allowing the user to change prompts and see their immediate effects on metrics. Try it!

Finally, we can output JSON data as a result of this program, as follows:

```yaml
description: Code explanation example
document:
- read: ./data.yaml
  parser: yaml
  def: CODE
  show_result: False
- read: ./ground_truth.txt
  def: TRUTH
  show_result: False
- model: ibm/granite-34b-code-instruct
  def: EXPLANATION
  show_result: False
  input:
     |
      Here is some info about the location of the function in the repo.
      repo: 
      {{ CODE.repo_info.repo }}
      path: {{ CODE.repo_info.path }}
      Function_name: {{ CODE.repo_info.function_name }}


      Explain the following code:
      ```
      {{ CODE.source_code }}```
- def: EVAL
  show_result: False
  lan: python
  code:
    |
    import textdistance
    expl = """
    {{ EXPLANATION }}
    """
    truth = """
    {{ TRUTH }}
    """
    result = textdistance.levenshtein.normalized_similarity(expl, truth)
- data: 
    input: "{{ CODE }}"
    output: "{{ EXPLANATION }}"
    metric: "{{ EVAL }}"
- "\n\n"
```

The data block takes various variables and combines their values into a JSON object with fields `input`, `output`, and `metric`. We mute the output of all the other blocks with `show_result` set to `false`. The output of this program is the corresponding serialized JSON object, with the appropriate treatment of quotation marks. Such PDL programs can be bootstrapped in a bash or Python script to create data en masse.

## PDL Language Tutorial

See [PDL Language Tutorial](https://ibm.github.io/prompt-declaration-language/tutorial)


## Live Document Visualizer

PDL has a Live Document visualizer to help in program understanding given an execution trace.
To produce an execution trace consumable by the Live Document, you can run the interpreter with the `--trace` argument:

```
pdl <my-example> --trace
```

This produces an additional file named `my-example_trace.json` that can be uploaded to the [Live Document](https://ibm.github.io/prompt-declaration-language/viewer/) visualizer tool. Clicking on different parts of the Live Document will show the PDL code that produced that part 
in the right pane. 

This is similar to a spreadsheet for tabular data, where data is in the forefront and the user can inspect the formula that generates the data in each cell. In the Live Document, cells are not uniform but can take arbitrary extents. Clicking on them similarly reveals the part of the code that produced them.


## Additional Notes and Future Work

When using Granite models on Watsonx, we use the following defaults for model parameters:
  - `decoding_method`: `greedy`
  - `max_new_tokens`: 1024
  - `min_new_tokens`: 1
  - `repetition_penalty`: 1.05
  
  Also if the `decoding_method` is `sample`, then the following defaults are used:
  - `temperature`: 0.7
  - `top_p`: 0.85
  - `top_k`: 50

- Only simple GETs are supported for API calls currently (see example: `examples/hello/weather.json`). We plan to more fully support API calls in the future.

For a complete list of issues see [here](https://github.com/IBM/prompt-declaration-language/issues).


## Contributing to the Project

See [Contributing to PDL](https://ibm.github.io/prompt-declaration-language/contrib)





