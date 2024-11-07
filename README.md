# PDL (Prompt Declaration Language)

## Overview

PDL is a declarative language designed for developers to create reliable, composable LLM prompts and integrate them into software systems. It provides a structured way to specify prompt templates, enforce validation, and compose LLM calls with traditional rule-based systems.

### Basic LLM Call

you can create a yaml file:

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

- [Documenation](https://ibm.github.io/prompt-declaration-language/)
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

If you use WatsonX:
```bash
export WATSONX_URL="https://{region}.ml.cloud.ibm.com"
export WATSONX_APIKEY="your-api-key"
export WATSONX_PROJECT_ID="your-project-id"
```

If you use Replicate:
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

In this example we use external content imput.yaml and watonsx as a LLM provider. 

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
  message: "hi? [/bye ti exit]\n"
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

### Trace Generation
```bash
pdl --trace <file.json> <my-example.pdl> 
```

### Log Inspection
```bash
pdl --log <my-logfile> <my-example.pdl>
```

### Live Document Visualization
Upload trace files to the [Live Document Viewer](https://ibm.github.io/prompt-declaration-language/viewer/) for visual debugging.

## Best Practices

1. **Template Organization**:
   - Keep templates modular and reusable
   - Use variables for dynamic content
   - Document template purpose and requirements

2. **Error Handling**:
   - Validate model inputs/outputs
   - Include fallback logic
   - Log intermediate results

3. **Performance**:
   - Cache frequent LLM calls
   - Use appropriate temperature settings
   - Implement retry logic for API calls

4. **Security**:
   - Enabling sandbox mode for untrusted code
   - Validate all inputs
   - Follow API key best practices

## Contributing

See the [contribution guidelines](https://ibm.github.io/prompt-declaration-language/contrib) for details on:
- Code style
- Testing requirements
- PR process
- Issue reporting

## References

- [PDL Schema](https://github.com/IBM/prompt-declaration-language/blob/main/src/pdl/pdl-schema.json)
- [arXiv Paper](http://arxiv.org/abs/2410.19135)

