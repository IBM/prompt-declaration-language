# OpenAI Platform Examples

These examples demonstrate how to use the OpenAI platform in PDL.

## Basic Usage

See `openai_basic.pdl` for a simple example using the OpenAI-compatible API.

## Structured Output

See `openai_structured.pdl` for an example using structured output with JSON schema.

## Configuration

### Using OpenAI API

Set your OpenAI API key:
```bash
export OPENAI_API_KEY=your-api-key-here
```

Then modify the examples to use OpenAI models:
```pdl
model: gpt-4
# Remove base_url and api_key parameters
```

### Using Ollama (Local)

The examples are configured to use Ollama by default. Make sure Ollama is running:
```bash
ollama serve
```
