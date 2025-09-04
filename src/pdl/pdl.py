import argparse
import json
import sys
from pathlib import Path
from typing import Any

import yaml
from datasets import load_dataset
from pydantic.json_schema import models_json_schema

from . import pdl_interpreter
from ._version import version
from .optimize.config_parser import JsonlDataset, OptimizationConfig
from .optimize.pdl_optimizer import PDLOptimizer
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

    subparsers = parser.add_subparsers(
        dest="command",
        help="Command to execute",
        required=False,
    )

    run_parser = subparsers.add_parser("run", help="PDL interpreter")
    optimizer_parser = subparsers.add_parser("optimize", help="AutoPDL")

    run_parser.add_argument(
        "--sandbox",
        action=argparse.BooleanOptionalAction,
        help="run the interpreter in a container, a Docker-compatible daemon must be running",
    )
    run_parser.add_argument(
        "-f",
        "--data-file",
        dest="data_file",
        help="YAML file containing initial values to add to the scope",
    )
    run_parser.add_argument(
        "-d",
        "--data",
        help="initial values to add to the scope",
    )
    run_parser.add_argument(
        "--stream",
        choices=["result", "context", "none"],
        default="result",
        help="stream the background context, or nothing on the standard output",
    )
    run_parser.add_argument(
        "-t",
        "--trace",
        nargs="?",
        const="*_trace.json",
        help="output trace for live document and optionally specify the file name",
    )

    run_parser.add_argument("pdl", nargs="?", help="pdl file", type=str)

    optimizer_parser.add_argument(
        "--config",
        "-c",
        help="Optimizer config file",
        type=Path,
        required=True,
    )

    optimizer_parser.add_argument(
        "--experiments-path",
        help="Path where experiment results will be saved",
        type=Path,
        default=Path("experiments"),
    )

    optimizer_parser.add_argument(
        "--yield_output",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

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

    if args.command == "run":

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

    if args.command == "optimize":
        if not args.config.exists():
            print("Config file doesn't exist:", args.config)
            sys.exit(1)

        config_text = args.config.read_text()

        try:
            config_dict = yaml.safe_load(config_text)
            config = OptimizationConfig(**config_dict)
        except Exception:
            print("Couldn't load config:", args.config)
            sys.exit(1)

        if not Path(config.pdl_path).exists():
            print("PDL file doesn't exist:", config.pdl_path)
            sys.exit(1)

        # Set up dataset and trial thread based on benchmark
        dataset: Any

        if isinstance(config.dataset, (dict, JsonlDataset)):
            dataset = load_dataset(
                "json",
                data_files={
                    "train": config.dataset.train,
                    "validation": config.dataset.validation,
                    "test": config.dataset.test,
                },
            )
        else:
            print(f"Unknown dataset: {config.dataset}")
            sys.exit(1)

        # Create optimizer instance
        optimizer = PDLOptimizer(
            dataset=dataset,
            trial_thread=None,
            yield_output=args.yield_output,
            experiment_path=args.experiments_path,
            config=config,
        )
        optimizer.run()
        return 0

    return 0


if __name__ == "__main__":
    main()
