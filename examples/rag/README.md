This example requires you to install langchain, langchain-community, and milvus.

```bash
pip install milvus langchain langchain-community
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
