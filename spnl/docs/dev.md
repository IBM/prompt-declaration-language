# For Developers

## A Quick Overview of this Repository

This repository consists of the following Rust workspaces:

- **spnl**: The core Span Query support, including a `spnl!` Rust macro that produces a runnable query, and `run::run` which can then be used to execute the query.
- **spnl_cli**: A demonstration CLI that includes a handful of demo queries.
- **spnl_wasm**: Wraps `spnl` into a WASM build.
- **spnl_web**: A simple web UI that runs queries directly in a browser via [WebLLM](https://github.com/mlc-ai/web-llm).

