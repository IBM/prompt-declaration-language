# AGENTS.md

Guidance for coding agents working in the Prompt Declaration Language (PDL) repository.

## What this project is

PDL is a declarative YAML-based language for writing LLM prompts and programs. The repo contains:

- A **Python interpreter** (`src/pdl/`) — the reference implementation, published to PyPI as `prompt-declaration-language`.
- A **Rust/Tauri + React viewer** (`pdl-live-react/`) — the desktop GUI, plus a partial Rust interpreter and a `compile` subcommand.
- **Examples**, **docs**, and a test suite that runs the examples end to end.

The upstream project is `IBM/prompt-declaration-language`; documentation is published at
<https://ibm.github.io/prompt-declaration-language/>.

## Repository layout

| Path | What lives there |
| --- | --- |
| `src/pdl/pdl_ast.py` | The Pydantic model of the language. Every block type (`text`, `model`, `if`, `repeat`, `call`, …) is a class here. Start here to understand or extend the language. |
| `src/pdl/pdl_interpreter.py` | The evaluator. `process_block` dispatches to `process_leaf_block` / `process_structured_block`. Largest file in the repo. |
| `src/pdl/pdl.py` | CLI entry point (`pdl`) and the Python API: `exec_program`, `exec_file`, `exec_str`, `exec_dict`. |
| `src/pdl/pdl_parser.py` | YAML → AST parsing, raises `PDLParseError`. |
| `src/pdl/pdl_dumper.py` | AST → YAML/JSON, used for traces. |
| `src/pdl/pdl_linter.py` | `pdl-lint` CLI; configured via `[tool.pdl-lint]` in `pyproject.toml`. |
| `src/pdl/pdl_llms.py`, `pdl_openai.py`, `pdl_granite_io.py` | Model backends (LiteLLM, OpenAI, granite-io). |
| `src/pdl/optimize/` | AutoPDL prompt optimizer (`pdl-optimize`). |
| `src/pdl/pdl_compilers/` | Compilation targets (e.g. `to_regex`). |
| `src/pdl/pdl-schema.json` | **Generated** JSON Schema — see "Generated files" below. |
| `src/pdl/pdl_stdlib.pdl`, `pdl_stdlib.py` | PDL standard library. |
| `tests/` | Pytest suite. `tests/data/` holds fixtures, `tests/results/` holds expected example outputs. |
| `examples/` | ~130 `.pdl` programs, all exercised by CI. |
| `docs/` | MkDocs site (`docs/tutorial.md` is the main language reference). |
| `pdl-live-react/` | Viewer: React/TypeScript front end, `src-tauri/` Rust back end. |
| `contrib/prompt_library/` | Community PDL snippets. |

## Setup

Python 3.11+ is required (CI matrix: 3.11, 3.12, 3.14; mypy targets 3.12).

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[all]"     # or ".[dev]" for just the test/lint tooling
pre-commit install
```

Verify the install:

```bash
pdl examples/demo/1-hello.pdl
```

## Common commands

```bash
# Unit tests (fast; excludes the example-running suite)
pytest tests --ignore=tests/test_examples_run.py

# All static checks: isort, black, flake8, pylint, bandit, mypy, pyright
pre-commit run --all-files

# Run a PDL program, with a trace for the viewer
pdl --trace out.json path/to/program.pdl

# Docs preview
mkdocs serve

# Viewer (from pdl-live-react/)
npm ci
npm test            # lint + typecheck + prettier + playwright
npm start           # Tauri dev window
npm run test:interpreter   # cargo test for the Rust interpreter
```

Style is enforced by tooling, not by hand: black formatting, isort with the black profile,
flake8 (`max-line-length = 89`, E203/E501 ignored), pylint with `pylintrc`, mypy, and pyright
over `src`, `tests`, `examples`, `docs`. Run `pre-commit run --all-files` before committing —
CI runs exactly this.

## Generated files — keep them in sync

- **`src/pdl/pdl-schema.json`** is derived from `pdl_ast.py`. `tests/test_schema.py` asserts they
  match, so **any change to the AST models requires regenerating it**:

  ```bash
  python -m src.pdl.pdl --schema > src/pdl/pdl-schema.json
  ```

  **Regenerate with Python > 3.11** (3.12 or later). Python 3.11 emits a different schema, so a
  file generated there will not match. CI reflects this: `build.yml` passes
  `--ignore=tests/test_schema.py` on the 3.11 matrix entry and only checks the committed schema on
  the newer versions.

- **`pdl-live-react/src/pdl_ast.d.ts`** is generated from that schema. Regenerate with
  `npm run types` in `pdl-live-react/` when the AST changes.

- **`src/pdl/_version.py`** is written by setuptools-scm. Never edit it.

## Tests and examples

The suite has two halves:

1. **Unit tests** (`tests/test_*.py`) — no network, run everywhere. Most build a program as a YAML
   string or dict and assert on `exec_str(...)` / `exec_dict(...)`. Follow that pattern for new
   language features.

2. **Example runs** (`tests/test_examples_run.py`) — executes every `.pdl` file in the repo against
   real models and string-matches the output. This is the nightly job and is skipped by the fast
   `build.yml` run, so run it deliberately:

   ```bash
   pytest --capture=tee-sys -rfE -s tests/test_examples_run.py --disable-pytest-warnings
   ```

`tests/test_examples_run.yaml` drives it:

- `check:` — restrict the run to a subset of files (leave `[]` for everything). Useful locally.
- `skip:` — files never run.
- `with_inputs:` — files needing `stdin` lines and/or an initial `scope`.
- `expected_parse_error:` / `expected_runtime_error:` — files that are supposed to fail.
- `unstable_result:` — files whose output is not compared, only required to run without error.
- `update_results: true` — regenerate expected outputs into `tests/results/`. **Always set it back
  to `false` before opening a PR.**

Expected outputs live at `tests/results/<path/to/file>.<i>.result`. Because model output varies with
Python version and OS, multiple `<i>` variants may be accepted; when CI reports a mismatch that
looks reasonable, add a new file with the next `<i>`.

Programs that end with a free-form model response are **not** result-checked — the model rewords its
answer on every run even at `temperature: 0` with a fixed `seed`, so no set of variants converges.
List those under `unstable_result:` and give them no `.result` file. Keep exact matching for
deterministic outputs (code, data, control flow, parsers, short constrained model answers). A file
that needs a new variant on every run belongs in `unstable_result:`.

Adding or moving any `.pdl` file affects two tests: `test_examples_parse.py` globs `**/*.pdl` and
requires every one of them to parse (exceptions are listed in `EXPECTED_INVALID`), and
`test_examples_run.py` will try to execute it. Update `tests/test_examples_run.yaml` and
`tests/results/` accordingly.

## Conventions

- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `ci:`,
  with an optional scope (`fix(deps):`, `fix(ci):`).
- **Every new language feature ships with an example.** A feature is not complete until there is a
  runnable `.pdl` program demonstrating it. In the same PR:
  1. Add the program under `examples/tutorial/` (named after the feature, e.g. `for_with.pdl`).
  2. Embed it in `docs/tutorial.md` with an MkDocs snippet include —
     `--8<-- "./examples/tutorial/<name>.pdl"` — alongside prose explaining the feature.
  3. Add its expected output to `tests/results/`, and an entry in `tests/test_examples_run.yaml`
     if it needs `stdin`/`scope` or must be skipped.

  Features that don't fit the tutorial (optimizer, viewer, integrations) get their example in the
  matching `examples/` subdirectory instead, but the example is still required.
- Model calls in examples generally target `ollama/granite-*`; keep new examples runnable with a
  local Ollama unless there is a reason not to.
- Blocks are Pydantic models — adding a field means updating `pdl_ast.py`, the interpreter, the
  dumper, the schema, and usually the viewer's TypeScript types.

## Things that commonly go wrong

- Editing `pdl_ast.py` without regenerating `pdl-schema.json` → `test_schema.py` fails.
- Implementing a language feature without adding an example → the feature is undocumented and
  untested end to end; reviewers will ask for it.
- Adding an example without a `tests/results/` entry → nightly Run Examples fails.
- Leaving `update_results: true` in `tests/test_examples_run.yaml` → the PR ships a live-updating
  test config.
- Assuming `pytest tests` is cheap — it isn't unless you pass `--ignore=tests/test_examples_run.py`.
