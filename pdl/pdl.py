import argparse
import json

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
        _, top_level_schema = models_json_schema(
            [
                (Program, "validation"),
                (PdlBlock, "validation"),
                (PdlBlocks, "validation"),
            ],
            title="PDL Schemas",
        )
        print(json.dumps(top_level_schema, indent=2))
    if args.pdl is None:
        return
    pdl_interpreter.generate(
        args.pdl,
        args.log,
        args.mode,
        args.output,
        scope_file=args.data_file,
        scope_data=args.data,
    )


if __name__ == "__main__":
    main()
