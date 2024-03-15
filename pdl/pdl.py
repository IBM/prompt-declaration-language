import argparse
import json

from . import pdl_interpreter
from .pdl_ast import Program


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
        "--scope_file",
        help="initial scope data file",
    )

    parser.add_argument(
        "-s",
        "--scope_data",
        help="scope data",
    )

    parser.add_argument("-o", "--output", help="output file")
    parser.add_argument(
        "-m", "--mode", help="output mode", choices=["html", "json", "yaml"]
    )
    parser.add_argument("--json", help="json file")
    parser.add_argument("--yaml", help="yaml file")
    parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    args = parser.parse_args()
    if args.schema:
        print(json.dumps(Program.model_json_schema(), indent=2))
    if args.pdl is None:
        return
    pdl_interpreter.generate(
        args.pdl, args.log, args.mode, args.output, args.scope_file, args.scope_data
    )


if __name__ == "__main__":
    main()
