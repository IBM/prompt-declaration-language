import argparse
from pathlib import Path

import yaml
from mu_ppl import ImportanceSampling, infer, viz

from ._version import version
from .pdl import InterpreterConfig, exec_program
from .pdl_ast import get_default_model_parameters
from .pdl_parser import parse_file
from .pdl_utils import validate_scope


def main():
    parser = argparse.ArgumentParser("")
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
        "-n",
        "--num-particles",
        dest="num_particles",
        type=int,
        help="Number of particles used during inference",
        default=5,
    )
    parser.add_argument(
        "-v", "--viz", help="Display the distribution of results", default=False
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
        return 0

    if args.pdl is None:
        parser.print_help()
        return 0

    initial_scope = {"pdl_model_default_parameters": get_default_model_parameters()}
    if args.data_file is not None:
        with open(args.data_file, "r", encoding="utf-8") as scope_fp:
            initial_scope = initial_scope | yaml.safe_load(scope_fp)
    if args.data is not None:
        initial_scope = initial_scope | yaml.safe_load(args.data)
    validate_scope(initial_scope)

    config = InterpreterConfig(
        yield_result=False, yield_background=False, batch=1, cwd=Path(args.pdl).parent
    )
    program, loc = parse_file(args.pdl)
    with ImportanceSampling(num_particles=args.num_particles):
        dist = infer(
            lambda: exec_program(program, config, initial_scope, loc, "result")
        )
    if args.viz:
        viz(dist)
    print(dist.sample())
    return 0


if __name__ == "__main__":
    main()
