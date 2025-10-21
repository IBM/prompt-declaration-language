import argparse
from pathlib import Path
from typing import Any, Literal, Optional, TypedDict

import yaml
from matplotlib import pyplot as plt
from mu_ppl import viz
from mu_ppl.distributions import Categorical

from ._version import version
from .pdl import InterpreterConfig
from .pdl import exec_program as pdl_exec_program
from .pdl_ast import PdlLocationType, Program, ScopeType, get_default_model_parameters
from .pdl_parser import parse_dict, parse_file, parse_str
from .pdl_scheduler import create_event_loop_thread
from .pdl_smc import (
    infer_importance_sampling,
    infer_importance_sampling_parallel,
    infer_smc,
    infer_smc_parallel,
)
from .pdl_utils import validate_scope


class PpdlConfig(TypedDict, total=False):
    """Configuration parameters of the PDL interpreter."""

    algo: Literal["is", "parallel-is", "smc", "parallel-smc"]
    num_particles: int
    max_workers: int


_LOOP = create_event_loop_thread()


def exec_program(
    prog: Program,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
    # output: Literal["result", "all"] = "result",
) -> Categorical[Any]:
    ppdl_config = ppdl_config or PpdlConfig()

    algo = ppdl_config.get("algo", "parallel-smc")
    num_particles = ppdl_config.get("num_particles", 5)
    max_workers = ppdl_config.get("max_workers")

    config = config or InterpreterConfig()
    config["yield_result"] = False
    config["yield_background"] = False
    config["batch"] = 1
    config["event_loop"] = _LOOP

    match algo:
        case "is":
            config["with_resample"] = False
        case "smc" | "parallel-smc" | "parallel-is":
            config["with_resample"] = True
        case _:
            assert False, f"Unexpected algo: {algo}"

    def model(replay):
        assert config is not None
        config["replay"] = replay
        result = pdl_exec_program(prog, config, scope, loc, "all")
        state = result["replay"]
        score = result["score"]
        return result["result"], state, score

    match algo:
        case "is":
            dist = infer_importance_sampling(num_particles, model)
        case "parallel-is":
            dist = infer_importance_sampling_parallel(num_particles, model, max_workers)
        case "smc":
            dist = infer_smc(num_particles, model)
        case "parallel-smc":
            dist = infer_smc_parallel(num_particles, model, max_workers)
        case _:
            assert False, f"Unexpected algo: {algo}"
    return dist


def exec_dict(
    prog: dict[str, Any],
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
    # output: Literal["result", "all"] = "result",
) -> Any:
    program = parse_dict(prog)
    result = exec_program(program, config, ppdl_config, scope, loc)
    return result


def exec_str(
    prog: str,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    # output: Literal["result", "all"] = "result",
) -> Any:
    program, loc = parse_str(prog)
    result = exec_program(program, config, ppdl_config, scope, loc)
    return result


def exec_file(
    prog: str | Path,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    # output: Literal["result", "all"] = "result",
) -> Any:
    program, loc = parse_file(prog)
    if config is None:
        config = InterpreterConfig()
    if config.get("cwd") is None:
        config["cwd"] = Path(prog).parent
    result = exec_program(program, config, ppdl_config, scope, loc)
    return result


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
        "--algo",
        choices=["is", "parallel-is", "smc", "parallel-smc"],
        help="Choose inference algorithm.",
        default="smc",
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
        "-v",
        "--viz",
        help="Display the distribution of results",
        default=False,
        action="store_true",
    )
    parser.add_argument(
        "-w",
        "--workers",
        type=int,
        help="Maximal number of workers for parallel execution of the inference algorithms",
        default=None,
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
        cwd=Path(args.pdl).parent,
    )
    ppdl_config = PpdlConfig(
        algo=args.algo, num_particles=args.num_particles, max_workers=args.workers
    )

    dist = exec_file(args.pdl, config, ppdl_config, initial_scope)

    if args.viz:
        viz(dist)
        plt.show()
    print(dist.sample())
    return 0


if __name__ == "__main__":
    main()
