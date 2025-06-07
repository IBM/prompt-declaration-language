# Span Queries: the SQL for GenAI

:rocket: [Playground](https://pages.github.ibm.com/cloud-computer/spnl/?qv=false) **|** [Poster](./docs/poster-20250529.pdf) **|** [About Span Queries](./docs/about.md) **|** [Contribute](./docs/dev.md)

What if we had a **SQL for GenAI**? Span Queries provide a declarative
query foundation for writing scale-up and scale-out interactions with
large language models (LLMs).  A span query allows messages to be
arranged into a [map/reduce](https://en.wikipedia.org/wiki/MapReduce)
tree of generation calls. When LLM calls are arranged in this way into
bulk (multi-generation) queries, they can be *planned* so as to:

- improve the quality of generated output, because map/reduce is an inference scaling technique
- increase the efficacy of attention mechanisms and KV cache locality, because the query expresses data dependencies
- allow for lightweight clients with server-managed data, because the queries express data access in a declarative way that can be managed server-side

[Learn more](./docs/about.md) about span queries.

**Examples** [Judge/generator](https://pages.github.ibm.com/cloud-computer/spnl/?demo=email&qv=true) **|** [Judge/generator (optimized)](https://pages.github.ibm.com/cloud-computer/spnl/?demo=email2&qv=true) **|** [Policy-driven email generation](https://pages.github.ibm.com/cloud-computer/spnl/?demo=email3&qv=true)

## Getting Started

The span query system is written in
[Rust](https://www.rust-lang.org/). Thus, step 1 is to [configure your
environment](./https://www.rust-lang.org/tools/install) for Rust, if
you haven't already. Step 2 is to clone this repository. 

Using these pre-requisities, we have a quick and dirty CLI on top of
the core capabilities to help with tire kicking. Using it, you can run
a quick demo with:

```shell
cargo run
```

The full usage is provided via `cargo run -- --help`, which also
specifies the available demos.

```
Usage: spnl [OPTIONS] [FILE]

Arguments:
  [FILE]  File to process

Options:
  -d, --demo <DEMO>
          Demo to run [possible values: chat, email, email2, email3, sweagent, gsm8k, rag]
  -m, --model <MODEL>
          Generative Model [default: ollama/granite3.2:2b]
  -e, --embedding-model <EMBEDDING_MODEL>
          Embedding Model [default: ollama/mxbai-embed-large:335m]
  -t, --temperature <TEMPERATURE>
          Temperature [default: 0.5]
  -l, --max-tokens <MAX_TOKENS>
          Max Completion/Generated Tokens [default: 100]
  -n, --n <N>
          Number of candidates to consider [default: 5]
  -k, --chunk-size <CHUNK_SIZE>
          Chunk size [default: 1]
      --vecdb-uri <VECDB_URI>
          Vector DB Url [default: data/spnl]
  -s, --show-query
          Re-emit the compiled query
  -v, --verbose
          Verbose output
  -h, --help
          Print help
  -V, --version
          Print version
```
