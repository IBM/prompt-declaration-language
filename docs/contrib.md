# Contributing to PDL

You can report issues or open a pull request (PR) to suggest changes.

## Reporting an issue

To report an issue, or to suggest an idea for a change that you haven't had time to write-up yet:

1. [Review existing issues](https://github.com/IBM/prompt-declaration-language/issues) to see if a similar issue has been opened or discussed.

2. [Open an
issue](https://github.com/IBM/prompt-declaration-language/issues/new). Be sure to include any helpful information, such as version used, error messages, or logs that you might have.


To report vulnerabilities privately, you can contact the authors by email (see [pyproject.toml](https://github.com/IBM/prompt-declaration-language/blob/main/pyproject.toml)).

## Suggesting a change

To suggest a change to this repository, [submit a pull request](https://github.com/IBM/prompt-declaration-language/pulls) with the complete set of changes that you want to suggest. Before creating a PR, make sure that your changes pass all of the tests and add tests for new features.

The test suite can be executed with the following command in the top-level folder:
```
pytest tests
```

Also, please make sure that your changes pass static checks such as code styles by executing the following command:
```
pre-commit run --all-files
```

## Development environment

### PDL development

Follow the following instructions to set up a dev environment to get started with contributing to PDL.

1. Create a fork of https://github.com/IBM/prompt-declaration-language
2. Clone your fork
3. Set up a Python virtual environment and install dependencies

    ```
    cd prompt-declaration-language
    python -m venv .venv
    source .venv/bin/activate
    pip install -e .
    ```

4. Test that you can run an editable version of PDL

    ```
    pdl examples/hello/hello.pdl

    Hello
    Hello! How can I help you today?
    ```

### Documentation updates

When you make changes to PDL, ensure to document any new features in the docs section. You can serve the docs locally to preview changes.

Install the required dependencies for documentation.

```
pip install -e .[docs]
```

Then serve the docs to load a preview.

```
mkdocs serve
```

You are all set!

### Run examples

PDL executes nightly runs for Run Examples, which searches for all the `.pdl` programs in the repo and runs the interpreter against each file. The [config file for Run Examples](../tests/test_examples_run.yaml) describes how to handle with each file. There are four conditions:

1. `skip`: a list of PDL files that are skipped in Run Examples
2. `with_inputs`: PDL files that require user input. Each file name is mapped to two fields that describe how inputs are patched
   1. `stdin`: separated by a newline, each line represents the user input
   2. `scope`: scope for the PDL program
3. `expected_parse_error`: a list of PDL files that expect parse errors 
4. `expected_runtime_error`: a list of PDL files that expect runtime errors
   
If you wish to make a contribution to PDL and modify or add any PDL program to the repo, it is important that you provide the new expected results for those files so that the Run Examples nightly test does not break. 

#### Local dev

Under `check`, you can provide a list of files that you want to run Pytest against. If you leave it empty (`check: ` or `check: []`), then by default, Pytest will be executed against all files in the repo, except for those under `skip`. For local development, it is useful to only test against a subset of files so that Pytest executes faster.

If you expect the files to produce a different result, setting `update_results: true` will automatically create a new file under `tests/examples/results` capturing the new output for each of the file in `check`. It is useful to set this field to `true` before opening a PR. 

Run this Pytest command for Run Examples, which is the same command for the nightly test.

```
pytest --capture=tee-sys -rfE -s tests/test_examples_run.py --disable-pytest-warnings
```

#### Opening a pull request

A slight variation in the Python version and OS environment can cause a different LLM response, thus Run Examples might fail because it uses exact string matching for PDL outputs. You can utilize the `update_results` when opening a PR to capture the expected results in the GH Actions environment. 

When you open a pull request (PR) against the `main` branch, a series of status checks will be executed. Specificially, three Run Examples test will be initiated against the files you have added and modified. 

- If in the PR, `update_results: false`, 
  - If Pytest fails, you can manually examine the failures and add the results to your PR
- If in the PR, `update_results: true`,
  - If Pytest fails, a GH-Actions bot will push a commit with the new results produced in the GH environment to your PR
  - Additionally, another commit will push `update_results: false`. This is to ensure that for the nightly test, different results are not committed
  - If you need to make other changes to your PR, make sure to pull the new changes first

Your PR should always set `update_results: false` before merging. 

Here's a preview of the current configuration file for Run Examples:

```yaml
--8<-- "../tests/test_examples_run.yaml"
```
