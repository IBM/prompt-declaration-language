# Contributing to PDL

You can report issues or open a pull request (PR) to suggest changes. 

## Reporting an issue

To report an issue, or to suggest an idea for a change that you haven't
had time to write-up yet:
1.  [Review existing issues](https://github.com/IBM/prompt-declaration-language/issues) to see if a similar issue has been opened or discussed.
2.  [Open an
issue](https://github.com/IBM/prompt-declaration-language/issues/new). Be sure to include any helpful information, such as your Kubernetes environment details, error messages, or logs that you might have.


## Suggesting a change

To suggest a change to this repository, [submit a pull request](https://github.com/IBM/prompt-declaration-language/pulls) with the complete set of changes that you want to suggest. Before creating a PR, make sure that your changes pass all of the tests.

The test suite can be executed with the following command in the top-level folder:
```
pytest tests
```

Also, please make sure that your changes pass static checks such as code styles by executing the following command:
```
pre-commit run --all-files
```
