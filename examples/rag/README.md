## pdf_query example 

This example uses [Ollama](../../tutorial/#using-ollama-models).  Fetch the models used in this example with

```bash
ollama pull mxbai-embed-large
ollama pull granite-code:8b
```

This example requires you to install pypdf, langchain, langchain-community, and milvus.

```bash
pip install pypdf milvus langchain langchain-community
```

To run the demo, first load a PDF document into the vector database:

```bash
pdl examples/rag/pdf_index.pdl
```

After the data has loaded, the program prints "Success!"

Next, query the vector database for relevant text and use that text in a query to an LLM:

```bash
pdl examples/rag/pdf_query.pdl
```

This PDL program computes a data structure containing all questions and answers.  It is printed at the end.

To cleanup, run `rm pdl-rag-demo.db`.

## tdidf_rag example

This example requires you to install:
```
pip install scikit-learn
```