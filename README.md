# PDL (Prompt Declaration Language)

[![tests](https://github.com/IBM/prompt-declaration-language/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/IBM/prompt-declaration-language/actions?query=workflow%3Abuild+branch%3Amain)
[![night tests](https://github.com/IBM/prompt-declaration-language/actions/workflows/run-examples.yml/badge.svg?branch=main)](https://github.com/IBM/prompt-declaration-language/actions?query=workflow%3Arun-examples+branch%3Amain)
[![documentation](https://github.com/IBM/prompt-declaration-language/actions/workflows/mkdocs-gh-pages.yml/badge.svg?branch=main)](https://github.com/IBM/prompt-declaration-language/actions?query=workflow%3Amkdocs-gh-pages+branch%3Amain)
[![PyPI version shields.io](https://img.shields.io/pypi/v/prompt-declaration-language?color=success)](https://pypi.python.org/pypi/prompt-declaration-language/)
[![Quay Publish](https://github.com/IBM/prompt-declaration-language/actions/workflows/publish-quay.yaml/badge.svg)](https://github.com/IBM/prompt-declaration-language/actions/workflows/publish-quay.yaml)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=ef8336)](https://pycqa.github.io/isort/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![linting: pylint](https://img.shields.io/badge/linting-pylint-yellowgreen)](https://github.com/PyCQA/pylint)
[![security: bandit](https://img.shields.io/badge/security-bandit-yellow.svg)](https://github.com/PyCQA/bandit)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/9672/badge)](https://bestpractices.coreinfrastructure.org/projects/9672)

## Overview

PDL is a declarative language designed for developers to create reliable, composable LLM prompts and integrate them into software systems. It provides a structured way to specify prompt templates, enforce validation, and compose LLM calls with traditional rule-based systems.

<img src="docs/assets/animated_chatbot.gif" width=750px alt="Animated GIF of PDL chatbot."/>

### Basic LLM Call

Minimum installation.

```bash
pip install prompt-declaration-language
```
See [here](https://ibm.github.io/prompt-declaration-language/tutorial/#using-ollama-models) for 
instructions on how to install an Ollama model locally.

You can create a PDL file (YAML format):

```yaml
description: Simple LLM interaction
text:
- "write a hello world example\n"
- model: ollama/granite-code:8b
  parameters:
    stop_sequences: '!'
    temperature: 0
```

and run it:

```bash
pdl <path/to/example.pdl>
```

## Key Features

- **LLM Integration**: Compatible with any LLM, including IBM watsonx
- **Prompt Engineering**: 
  - Template system for single/multi-shot prompting
  - Composition of multiple LLM calls
  - Integration with tools (code execution & APIs)
- **Development Tools**:
  - Type checking for model I/O
  - Python SDK
  - Chat API support
  - Live document visualization for debugging
- **Control Flow**: Variables, conditionals, loops, and functions
- **I/O Operations**: File/stdin reading, JSON parsing
- **API Integration**: Native REST API support (Python)

## Documentation

- [Documentation](https://ibm.github.io/prompt-declaration-language/)
- [API References](https://ibm.github.io/prompt-declaration-language/api_reference/)
- [Tutorial](https://ibm.github.io/prompt-declaration-language/tutorial/)

### Quick Reference

<img src="docs/assets/pdl_quick_reference.png" alt="PDL Quick Reference"/>


## Quick Start Guide

### Installation

Requires Python 3.11+ (Windows users should use WSL)

```bash
# Basic installation
pip install prompt-declaration-language

# Development installation with examples
pip install 'prompt-declaration-language[examples]'
```

### Environment Setup

You can run PDL with LLM models in local using [Ollama](https://ollama.com), or other cloud service.

If you use watsonx:
```bash
export WATSONX_URL="https://{region}.ml.cloud.ibm.com"
export WATSONX_APIKEY="your-api-key"
export WATSONX_PROJECT_ID="your-project-id"
```

If you use [Replicate](https://replicate.com/):
```bash
export REPLICATE_API_TOKEN="your-token"
```

### IDE Configuration 

VSCode setup for syntax highlighting and validation:

```json
// .vscode/settings.json
{
    "yaml.schemas": {
        "https://ibm.github.io/prompt-declaration-language/dist/pdl-schema.json": "*.pdl"
    },
    "files.associations": {
        "*.pdl": "yaml",
    }
}
```

## Code Examples

### Variable Definition & Template Usage

In this example we use external content _data.yaml_ and watsonx as an LLM provider.

```yaml
description: Template with variables
defs:
  USER_INPUT:
    read: ../examples/code/data.yaml
    parser: yaml
text:
- model: watsonx/ibm/granite-34b-code-instruct
  input: |
    Process this input: ${USER_INPUT}
    Format the output as JSON.
```

### Python Code Integration

```yaml
description: Code execution example
text:
- "\nFind a random number between 1 and 20\n"
- def: N
  lang: python
  code: |
    import random
    # (In PDL, set `result` to the output you wish for your code block.)
    result = random.randint(1, 20)
- "\nthe result is (${ N })\n"
```

### Chat

chat interactions:

```yaml
description: chatbot
text:
- read:
  def: user_input
  message: "hi? [/bye to exit]\n"
  contribute: [context]
- repeat:
    text:
    - model: ollama/granite-code:8b
    - read:
      def: user_input
      message: "> "
      contribute: [context]
  until: ${ user_input == '/bye'}
```

## Debugging Tools

### Log Inspection
```bash
pdl --log <my-logfile> <my-example.pdl>
```

### Trace Generation and Live Document Visualization

```bash
pdl --trace <file.json> <my-example.pdl> 
```

Upload trace files to the [Live Document Viewer](https://ibm.github.io/prompt-declaration-language/viewer/) for visual debugging.


## Contributing

See the [contribution guidelines](https://ibm.github.io/prompt-declaration-language/contrib) for details on:
- Code style
- Testing requirements
- PR process
- Issue reporting

## References

- [PDL Schema](https://github.com/IBM/prompt-declaration-language/blob/main/src/pdl/pdl-schema.json)
- [arXiv Paper](http://arxiv.org/abs/2410.19135)

