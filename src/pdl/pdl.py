import argparse
import json
import sys
from pathlib import Path

import yaml
from pydantic.json_schema import models_json_schema

from . import pdl_interpreter
from ._version import version
from .pdl_ast import (
    PdlBlock,
    Program,
    get_default_model_parameters,
)
from .pdl_exec import InterpreterConfig
from .pdl_interpreter import InterpreterState
from .pdl_lazy import PdlDict
from .pdl_runner import exec_docker
from .pdl_utils import (  # pylint: disable=unused-import # noqa: F401
    validate_scope,
    write_trace,
)


def main():
    parser = argparse.ArgumentParser("")

    parser.add_argument(
        "--schema",
        action="store_true",
        help="generate PDL JSON Schema and exit",
        default=False,
    )

    parser.add_argument(
        "--version",
        action="store_true",
        help="print the version number and exit",
        default=False,
    )

    parser.add_argument(
        "--sandbox",
        action=argparse.BooleanOptionalAction,
        help="run the interpreter in a container, a Docker-compatible daemon must be running",
    )
    parser.add_argument(
        "-f",
        "--data-file",
        dest="data_file",
        help="YAML file containing initial values to add to the scope",
    )
    parser.add_argument(
        "-d",
        "--data",
        help="initial values to add to the scope",
    )
    parser.add_argument(
        "--stream",
        choices=["result", "context", "none"],
        default="result",
        help="stream the background context, or nothing on the standard output",
    )
    parser.add_argument(
        "-t",
        "--trace",
        nargs="?",
        const="*_trace.json",
        help="output trace for live document and optionally specify the file name",
    )

    parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    args = parser.parse_args()

    # This case must be before `if args.pdl is None:`
    if args.version:
        print(f"PDL {version}")
        return 0

    # This case must be before `if args.pdl is None:`
    if args.schema:
        schema, top_level_schema = models_json_schema(
            [
                (Program, "validation"),
                (PdlBlock, "validation"),
            ],
            title="PDL Schemas",
        )
        top_level_schema["anyOf"] = list(schema.values())
        print(json.dumps(top_level_schema, indent=2))
        return 0

    if args.pdl is None:
        parser.print_help()
        return 0

    if args.sandbox:
        args = sys.argv[1:]
        args.remove("--sandbox")
        exec_docker(*args)
        assert False  # unreachable: exec_docker terminate the execution

    initial_scope = {"pdl_model_default_parameters": get_default_model_parameters()}
    if args.data_file is not None:
        with open(args.data_file, "r", encoding="utf-8") as scope_fp:
            initial_scope = initial_scope | yaml.safe_load(scope_fp)
    if args.data is not None:
        initial_scope = initial_scope | yaml.safe_load(args.data)
    validate_scope(initial_scope)

    match args.stream:
        case "result":
            stream_result = True
            stream_background = False
        case "context":
            stream_result = False
            stream_background = True
        case "none":
            stream_result = False
            stream_background = False
        case _:
            assert False

    if stream_result or stream_background:
        batch = 0
    else:
        batch = 1

    pdl_file = Path(args.pdl)
    if args.trace == "*_trace.json":
        trace_file = str(pdl_file.with_suffix("")) + "_trace.json"
    else:
        trace_file = args.trace
    config = InterpreterConfig(
        yield_result=stream_result,
        yield_background=stream_background,
        batch=batch,
        cwd=pdl_file.parent,
    )
    exit_code = pdl_interpreter.generate(
        pdl_file,
        InterpreterState(**config),
        PdlDict(initial_scope),
        trace_file,
    )
    return exit_code


if __name__ == "__main__":
    main()
