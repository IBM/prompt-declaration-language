<!-- ---
hide:
  - navigation
  - toc
--- -->
# Prompt Declaration Language

LLMs will continue to change the way we build software systems. They are not only useful as coding assistants, providing snipets of code, explanations, and code transformations, but they can also help replace components that could only previously be achieved with rule-based systems. Whether LLMs are used as coding assistants or software components, reliability remains an important concern. LLMs have a textual interface and the structure of useful prompts is not captured formally. Programming frameworks do not enforce or validate such structures since they are not specified in a machine-consumable way. The purpose of the Prompt Declaration Language (PDL) is to allow developers to specify the structure of prompts and to enforce it, while providing a unified programming framework for composing LLMs with rule-based systems. 

PDL is based on the premise that interactions between users, LLMs and rule-based systems form a *document*. Consider for example the interactions between a user and a chatbot. At each interaction, the exchanges form a document that gets longer and longer. Similarly, chaining models together or using tools for specific tasks result in outputs that together form a document. PDL allows users to specify the shape and contents of such documents in a declarative way (in YAML or JSON), and is agnostic of any programming language. Because of its document-oriented nature, it can be used to easily express a variety of data generation tasks (inference, data synthesis, data generation for model training, etc...). Moreover, PDL programs themselves are structured data (YAML) as opposed to traditional code, so they make good targets for LLM generation as well.


PDL provides the following features:
- Ability to templatize not only prompts for one LLM call, but also composition of LLMs with tools (code and APIs). Templates can encompass tasks of larger granularity than a single LLM call (unlike many prompt programming languages).
- Control structures: variable definitions and use, conditionals, loops, functions
- Ability to read from files, including JSON data.
- Ability to call out to code. At the moment only Python is supported, but this could be any other programming language in principle.
- Ability to call out to REST APIS.


The PDL interpreter (`pdl/pdl.py`) takes a PDL program as input and renders it into a document by execution its instructions (calling out to models, code, apis, etc...). 

See below for installation notes, followed by an [overview](#overview) of the language. A more detailed description of the language features can be found in this [tutorial](https://pages.github.ibm.com/ml4code/pdl/tutorial/).

## Demo Video

<iframe src="https://ibm.ent.box.com/embed/s/9ko71cfbybhtn08z29bbkw74unl5faki?sortColumn=date" width="800" height="550" frameborder="0" allowfullscreen webkitallowfullscreen msallowfullscreen></iframe>

## Interpreter Installation

The interpreter has been tested with Python version 3.12.

To install the requirements for `pdl`, execute the command:

```
pip3 install .
```

To install the dependencies for development of PDL and execute all the example, execute the command:
```
pip3 install '.[all]'
```

In order to run the examples that use foundation models hosted on [watsonx](https://www.ibm.com/watsonx), you need an account (a free plan is available) and set up the following environment variables:
- `WATSONX_API`, the API url (set to `https://{region}.ml.cloud.ibm.com`)
- `WATSONX_KEY`, the API key (see information on [key creation](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui#create_user_key))
- `WATSONX_PROJECT_ID`, the project hosting the resources (see information about [project creation](https://www.ibm.com/docs/en/watsonx/saas?topic=projects-creating-project) and [finding project ID](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-project-id.html?context=wx)).

Internal IBM users can use models hosted on [BAM](https://bam.res.ibm.com/). You need to set up 2 environment variables:
- `GENAI_API` set to `https://bam-api.res.ibm.com/`
- `GENAI_KEY` set to your BAM API key. To obtain your key, go to the [BAM](https://bam.res.ibm.com/) main page. On the right and under the "Documentation" section, you will see a button to copy your API key.

To run the interpreter:

```
python3 -m pdl.pdl <path/to/example.pdl>
```

The folder `examples` contains some examples of PDL programs. Several of these examples have been adapted from the LMQL [paper](https://arxiv.org/abs/2212.06094) by Beurer-Kellner et al. 

We highly recommend to use VSCode to edit PDL YAML files. This project has been configured so that every YAML file is associated with the PDL grammar JSONSchema (see [settings](https://github.ibm.com/ml4code/pdl/blob/main/.vscode/settings.json) and [schema](https://github.ibm.com/ml4code/pdl/blob/main/pdl-schema.json)). This enables the editor to display error messages when the yaml deviates from the PDL syntax and grammar. It also provides code completion. You can set up your own VSCode PDL projects similarly using this settings and schema files. The PDL interpreter also provides similar error messages.

The interpreter prints out a log by default in the file `log.txt`. This log contains the details of inputs and outputs to every block in the program. It is useful to examine this file when the program is behaving differently than expected.

To change the log filename, you can pass it to the interpreter as follows:

```
python3 -m pdl.pdl --log <my-logfile> <my-example>
```

We can also pass initial data to the interpreter to populate variables used in a PDL program, as follows:

```
python3 -m pdl.pdl --data <JSON-or-YAML-data> <my-example>
```

This can also be done by passing a JSON or YAML file:

```
python3 -m pdl.pdl --data_file <JSON-or-YAML-file> <my-example>
```

## Overview

In PDL, we can write some YAML to create a prompt and call an LLM:

```yaml
description: Hello world with watsonx
document:
- Hello
- model: ibm/granite-3b-code-instruct
  params:
    STOP_SEQUENCES:
    - '!'
```

The `description` field is a description for the program. Field `document` contains a list of either strings or *block*s which together form the document to be produced. In this example, the document starts with the string `"Hello"` followed by a block that calls out to a model. In this case, it is model with id `ibm/granite-3b-code-instruct` from [watsonx](https://www.ibm.com/watsonx), with the indicated parameter: the stop sequence is `!`. The input to the model call is everything that has been produced so far in the document (here `Hello`).

When we execute this program using the PDL interpreter:

```
python3 -m pdl.pdl examples/hello/hello.pdl
```

we obtain the following document:

```
Hello, world!
```

where the portion `, world!` was produced by granite. In general, PDL provides blocks for calling to models, Python code, as well as APIs and makes it easy to compose them together with control structures (sequencing, conditions, loops).

The equivalent program using a model hosted on BAM can be written as follows:

```yaml
description: Hello world with BAM
document:
- Hello
- model: ibm/granite-3b-code-instruct
  parameters:
    decoding_method: greedy
    stop_sequences:
    - '!'
    include_stop_sequence: true
```

The only difference is that the parameters of the model now follows the [BAM calling convention](https://bam.res.ibm.com/docs/api-reference#text-generation). The `decoding_method` is `greedy` and there is a stop sequence `!` which must be included in the output.


Consider now an example from AI for code, where we want to build a prompt template for code explanation. We have a JSON file as input
containing the source code and some information regarding the repository where it came from.

For example, given the data in this JSON [file](https://github.ibm.com/ml4code/pdl/blob/main/examples/code/data.json):
```json
{
    "source_code": "@SuppressWarnings(\"unchecked\")\npublic static Map<String, String> deserializeOffsetMap(String lastSourceOffset) throws IOException {\n  Map<String, String> offsetMap;\n  if (lastSourceOffset == null || lastSourceOffset.isEmpty()) {\n    offsetMap = new HashMap<>();\n  } else {\n    offsetMap = JSON_MAPPER.readValue(lastSourceOffset, Map.class);\n  }\n  return offsetMap;\n}",
    "repo_info": {
        "repo": "streamsets/datacollector",
        "path": "stagesupport/src/main/java/com/.../OffsetUtil.java",
        "function_name": "OffsetUtil.deserializeOffsetMap"
    }
}
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

In PDL, this would be expressed as follows (see [file](https://github.ibm.com/ml4code/pdl/blob/main/examples/code/code.pdl)):

```yaml
description: Code explanation example
document:
- read: examples/code/data.json
  parser: json
  def: CODE
  show_result: False
- "\n{{ CODE.source_code }}\n"
- model: ibm/granite-20b-code-instruct-v2
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
```

The first block of the document is an *input* block. It reads the indicated filename (`examples/code/data.json`) and loads its contents into a variable named `CODE`. In PDL, any block can have a `def` field, which means the output of that block is assigned to that variable. Since the field `parser` is set to `json`, variable `CODE` contains that data in JSON format. The final field in the input block says that `show_result` is set to `false`, which means that the output of this block (the content that was read) is not included in the document. This feature allows the user to obtain intermediate results that are not necessarily included in the final output.

The second block is simply a string and writes out the source code. This is done by accessing the variable `CODE`. The syntax `{{ var }}` means accessing the value of a variable in the scope. Since `CODE` contains JSON data, we can also access fields such as `CODE.source_code`.

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

Answer:
The above code is a part of the StreamSets Data Collector that deserializes an offset map from a string. The function takes in a string representing the last source offset and returns a map containing the deserialized offsets.

The @SuppressWarnings annotation is used to suppress warnings related to unchecked operations performed by the Jackson library. This is necessary because the deserializeOffsetMap function uses generics to handle different types of maps, but the Jackson library does not support generic types.

The deserializeOffsetMap function first checks if the lastSourceOffset parameter is null or empty. If it is, then a new empty map is created and returned. Otherwise, the lastSourceOffset parameter is deserialized using the Jackson library's ObjectMapper class and returned as a map.

```

Notice that in PDL variables are used to templatize any entity in the document, not just textual prompts to LLMs. We can add a block to this document to evaluate the quality of the output using a similarity metric with respect to our [ground truth](https://github.ibm.com/ml4code/pdl/blob/main/examples/code/ground_truth.txt). See [file](https://github.ibm.com/ml4code/pdl/blob/main/examples/code/code-eval.pdl):

```yaml
description: Code explanation example
document:
- read: examples/code/data.json
  parser: json
  def: CODE
  show_result: False
- read: examples/code/ground_truth.txt
  def: TRUTH
  show_result: False
- "\n{{ CODE.source_code }}\n"
- model: ibm/granite-20b-code-instruct-v2
  def: EXPLANATION
  parameters:
    decoding_method: greedy
    max_new_tokens: 1024
  input:
    document:
    - |
      Here is some info about the location of the function in the repo.
      repo: 
      {{ CODE.repo_info.repo }}
      path: {{ CODE.repo_info.path }}
      Function_name: {{ CODE.repo_info.function_name }}


      Explain the following code:
      ```
      {{ CODE.source_code }}```
- |


  EVALUATION:
  The similarity (Levenshtein) between this answer and the ground truth is:
- def: EVAL
  lan: python
  code:
  - |
    import textdistance
    expl = """
    {{ EXPLANATION }}
    """
    truth = """
    {{ TRUTH }}
    """
    result = textdistance.levenshtein.normalized_similarity(expl, truth)
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

Answer:
The above code is a part of the StreamSets Data Collector that deserializes an offset map from a string. The function takes in a string representing the last source offset and returns a map containing the deserialized offsets.

The @SuppressWarnings annotation is used to suppress warnings related to unchecked operations performed by the Jackson library. This is necessary because the deserializeOffsetMap function uses generics to handle different types of maps, but the Jackson library does not support generic types.

The deserializeOffsetMap function first checks if the lastSourceOffset parameter is null or empty. If it is, then a new empty map is created and returned. Otherwise, the lastSourceOffset parameter is deserialized using the Jackson library's ObjectMapper class and returned as a map.

EVALUATION:
The similarity (Levenshtein) between this answer and the ground truth is:
0.9987730061349693
```

PDL allows rapid prototyping of prompts by allowing the user to change prompts and see the effects on metrics. Try it!

Finally, we can output JSON data as a result of this program, as follows:

```yaml
description: Code explanation example
document:
- read: examples/code/data.json
  parser: json
  def: CODE
  show_result: False
- read: examples/code/ground_truth.txt
  def: TRUTH
  show_result: False
- model: ibm/granite-20b-code-instruct-v2
  def: EXPLANATION
  show_result: False
  parameters:
    decoding_method: greedy
    max_new_tokens: 1024
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
```

The data block takes various variables and combines their values into a JSON object with fields `input`, `output`, and `metric`. We mute the output of all the other blocks with `show_result` set to `false`. The output of this program is the corresponding serialized JSON object, with the appropriate treatment of quotation marks. Such PDL programs can be bootstrapped in a bash or Python script to create data en masse.

## PDL Language Tutorial

See [PDL Language Tutorial](tutorial.md)



## Additional Notes and Future Work

- Currently, model blocks support the [text generation](https://bam.res.ibm.com/docs/api-reference#text-generation) interface of BAM, with the exception
that we provide some default values when the following parameters are missing:
  - `decoding_method`: `greedy`
  - `max_new_tokens`: 1024
  - `min_new_tokens`: 1
  - `repetition_penalty`: 1.05
  
  Also if the `decoding_method` is `sample`, then the following defaults are used:
  - `temperature`: 0.7
  - `top_p`: 0.85
  - `top_k`: 50

- Only simple GETs are supported for API calls currently (see example: `examples/hello/weather.json`). We plan to more fully support API calls in the future.


For a complete list of issues see [here](https://github.ibm.com/ml4code/pdl/issues).


## Contributing to the Project

See [Contributing to PDL](https://github.ibm.com/ml4code/pdl/blob/main/docsource/contrib.md)





