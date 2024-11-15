import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any, Literal, Optional, TypedDict

import yaml
from pydantic.json_schema import models_json_schema

from . import pdl_interpreter
from ._version import version
from .pdl_ast import (
    LocationType,
    PdlBlock,
    PdlBlocks,
    Program,
    RoleType,
    ScopeType,
    empty_block_location,
)
from .pdl_interpreter import InterpreterState, process_prog
from .pdl_parser import parse_file, parse_str
from .pdl_runner import exec_docker

logger = logging.getLogger(__name__)


class InterpreterConfig(TypedDict, total=False):
    """Configuration parameters of the PDL interpreter."""

    yield_result: bool
    """Print incrementally result of the execution.
    """
    yield_background: bool
    """Print the program background messages during the execution.
    """
    batch: int
    """Model inference mode:
         - 0: streaming
         - 1: non-streaming
    """
    role: RoleType
    """Default role.
    """
    cwd: Path
    """Path considered as the current working directory for file reading."""


def exec_program(
    prog: Program,
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType] = None,
    loc: Optional[LocationType] = None,
    output: Literal["result", "all"] = "result",
) -> Any:
    """Execute a PDL program given as a value of type `pdl.pdl_ast.Program`.

    Args:
        prog: Program to execute.
        config: Interpreter configuration. Defaults to None.
        scope: Environment defining the initial variables in scope to execute the program. Defaults to None.
        loc: Source code location mapping. Defaults to None.
        output: Configure the output of the returned value of this function. Defaults to `"result"`

    Returns:
        Return the final result if `output` is set to `"result"`. If set of `all`, it returns a dictionary containing, `result`, `scope`, and `trace`.
    """
    logging.basicConfig(filename="log.txt", encoding="utf-8", format="", filemode="w")
    config = config or {}
    state = InterpreterState(**config)
    scope = scope or {}
    loc = loc or empty_block_location
    result, _, scope, trace = process_prog(state, scope, prog, loc)
    match output:
        case "result":
            return result
        case "all":
            return {"result": result, "scope": scope, "trace": trace}
        case _:
            assert False, 'The `output` variable should be "result" or "all"'


def exec_dict(
    prog: dict[str, Any],
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType] = None,
    loc: Optional[LocationType] = None,
    output: Literal["result", "all"] = "result",
) -> Any:
    """Execute a PDL program given as a dictionary.

    Args:
        prog: Program to execute.
        config: Interpreter configuration. Defaults to None.
        scope: Environment defining the initial variables in scope to execute the program. Defaults to None.
        loc: Source code location mapping. Defaults to None.
        output: Configure the output of the returned value of this function. Defaults to `"result"`

    Returns:
        Return the final result.
    """
    program = Program.model_validate(prog)
    result = exec_program(program, config, scope, loc, output)
    return result


def exec_str(
    prog: str,
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType] = None,
    output: Literal["result", "all"] = "result",
) -> Any:
    """Execute a PDL program given as YAML string.

    Args:
        prog: Program to execute.
        config: Interpreter configuration. Defaults to None.
        scope: Environment defining the initial variables in scope to execute the program. Defaults to None.
        output: Configure the output of the returned value of this function. Defaults to `"result"`

    Returns:
        Return the final result.
    """
    program, loc = parse_str(prog)
    result = exec_program(program, config, scope, loc, output)
    return result


def exec_file(
    prog: str | Path,
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType] = None,
    output: Literal["result", "all"] = "result",
) -> Any:
    """Execute a PDL program given as YAML file.

    Args:
        prog: Program to execute.
        config: Interpreter configuration. Defaults to None.
        scope: Environment defining the initial variables in scope to execute the program. Defaults to None.
        output: Configure the output of the returned value of this function. Defaults to `"result"`

    Returns:
        Return the final result.
    """
    program, loc = parse_file(prog)
    if config is None:
        config = InterpreterConfig()
    if config.get("cwd") is None:
        config["cwd"] = Path(prog).parent
    result = exec_program(program, config, scope, loc, output)
    return result


def main():
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--sandbox",
        action=argparse.BooleanOptionalAction,
        help="run the interpreter in a container, a docker daemon must be running",
    )
    parser.add_argument(
        "-f",
        "--data-file",
        dest="data_file",
        help="file containing initial values to add to the scope",
    )
    parser.add_argument(
        "-d",
        "--data",
        help="initial values to add to the scope",
    )
    parser.add_argument(
        "--stream",
        choices=["result", "background", "none"],
        default="result",
        help="stream the result, the background messages, or nothing on the standard output",
    )
    parser.add_argument(
        "-t",
        "--trace",
        nargs="?",
        const="*_trace.json",
        help="output trace for live document and optionally specify the file name",
    )
    parser.add_argument(
        "-l",
        "--log",
        help="specify a name for the log file",
    )
    parser.add_argument(
        "--schema",
        action="store_true",
        help="generate PDL Json Schema and exit",
        default=False,
    )
    parser.add_argument(
        "--version",
        action="store_true",
        help="print the version number and exit",
        default=False,
    )

    parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    args = parser.parse_args()

    # This case must be before `if args.pdl is None:`
    if args.version:
        print(f"PDL {version}")
        return

    # This case must be before `if args.pdl is None:`
    if args.schema:
        schema, top_level_schema = models_json_schema(
            [
                (Program, "validation"),
                (PdlBlock, "validation"),
                (PdlBlocks, "validation"),
            ],
            title="PDL Schemas",
        )
        top_level_schema["anyOf"] = list(schema.values())
        print(json.dumps(top_level_schema, indent=2))
        return

    if args.pdl is None:
        parser.print_help()
        return

    if args.sandbox:
        args = sys.argv[1:]
        args.remove("--sandbox")
        exec_docker(*args)
        assert False  # unreachable: exec_docker terminate the execution

    initial_scope = {}
    if args.data_file is not None:
        with open(args.data_file, "r", encoding="utf-8") as scope_fp:
            initial_scope = yaml.safe_load(scope_fp)
    if args.data is not None:
        initial_scope = initial_scope | yaml.safe_load(args.data)

    match args.stream:
        case "result":
            stream_result = True
            stream_background = False
        case "background":
            stream_result = False
            stream_background = True
        case "none":
            stream_result = False
            stream_background = False
        case _:
            assert False

    if stream_result:
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
    pdl_interpreter.generate(
        pdl_file,
        args.log,
        InterpreterState(**config),
        initial_scope,
        trace_file,
    )


if __name__ == "__main__":
    main()
