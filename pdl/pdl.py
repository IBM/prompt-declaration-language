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
        "-m",
        "--html",
        help="html file",
    )
    parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    args = parser.parse_args()
    if args.schema:
        print(json.dumps(Program.model_json_schema(), indent=2))
    if args.pdl is None:
        return
    pdl_interpreter.generate(args.pdl, args.log, args.html)


if __name__ == "__main__":
    main()
