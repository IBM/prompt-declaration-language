import argparse
import json

import yaml
from pydantic.json_schema import models_json_schema

from . import pdl_interpreter
from .pdl_ast import PdlBlock, PdlBlocks, Program


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
