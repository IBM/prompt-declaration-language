import argparse
import json
from typing import Any

import yaml
from pydantic.json_schema import models_json_schema

from . import pdl_interpreter
from .pdl_ast import CallBlock, LocationType, PdlBlock, PdlBlocks, Program, ScopeType
from .pdl_interpreter import InterpreterState, process_prog, step_call
from .pdl_parser import parse_program


class PDL:
    state: InterpreterState
    result: Any
    document: str
    scope: ScopeType
    trace: Program

    def __init__(self, pdl_file: str) -> None:
        prog, line_table = parse_program(pdl_file)
        state = InterpreterState(yield_output=False)
        loc = LocationType(path=[], file=pdl_file, table=line_table)
        result, document, scope, trace = process_prog(state, {}, prog, loc)
        self.state = state
        self.result = result
        self.document = document
        self.scope = scope
        self.trace = trace

    def call(self, f: str, args: dict[str, Any]):
        block = CallBlock(call=f, args=args)
        result, document, scope, trace = yield from step_call(self.state, self.scope, block)
        self.scope = scope
        return result, document, scope, trace


def main():
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--schema",
        action=argparse.BooleanOptionalAction,
        help="generate PDL Json Schema",
    )
    parser.add_argument(
        "-l",
        "--log",
        help="log file",
    )

    parser.add_argument(
        "-f",
        "--data_file",
        help="initial scope data file",
    )

    parser.add_argument(
        "-d",
        "--data",
        help="scope data",
    )

    parser.add_argument("-o", "--output", help="output file")
    parser.add_argument("-m", "--mode", help="output mode", choices=["json", "yaml"])
    parser.add_argument("--json", help="json file")
    parser.add_argument("--yaml", help="yaml file")
    parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    args = parser.parse_args()
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
    if args.pdl is None:
        return

    initial_scope = {}
    if args.data_file is not None:
        with open(args.data_file, "r", encoding="utf-8") as scope_fp:
            initial_scope = yaml.safe_load(scope_fp)
    if args.data is not None:
        initial_scope = initial_scope | yaml.safe_load(args.data)

    pdl_interpreter.generate(
        args.pdl,
        args.log,
        initial_scope,
        args.mode,
        args.output,
    )


if __name__ == "__main__":
    main()
