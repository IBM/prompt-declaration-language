import argparse
from pathlib import Path
from typing import Any, Literal, Optional, TypedDict

import yaml
from matplotlib import pyplot as plt

from ._version import version
from .pdl import InterpreterConfig
from .pdl_ast import (
    PdlLocationType,
    PdlUsage,
    Program,
    get_default_model_parameters,
)
from .pdl_distributions import Categorical, viz
from .pdl_inference import (
    infer_importance_sampling,
    infer_importance_sampling_parallel,
    infer_majority_voting,
    infer_majority_voting_parallel,
    infer_rejection_sampling,
    infer_rejection_sampling_parallel,
    infer_smc,
    infer_smc_parallel,
)
from .pdl_interpreter_state import ScopeType
from .pdl_parser import parse_dict, parse_file, parse_str
from .pdl_scheduler import create_event_loop_thread
from .pdl_utils import validate_scope


class PpdlConfig(TypedDict, total=False):
    """Configuration parameters of the PDL interpreter."""

    algo: Literal[
        "is",
        "parallel-is",
        "smc",
        "parallel-smc",
        "rejection",
        "parallel-rejection",
        "maj",
        "parallel-maj",
    ]
    num_particles: int
    max_workers: int


_LOOP = create_event_loop_thread()


def exec_program(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    prog: Program,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
    output: Literal["result", "all"] = "result",
) -> Categorical[Any] | dict:
    ppdl_config = ppdl_config or PpdlConfig()

    algo = ppdl_config.get("algo", "parallel-smc")
    num_particles = ppdl_config.get("num_particles", 5)
    max_workers = ppdl_config.get("max_workers")

    config = config or InterpreterConfig()
    config["yield_result"] = False
    config["yield_background"] = False
    config["batch"] = 1
    config["event_loop"] = config.get("event_loop", _LOOP)
    config["llm_usage"] = config.get("llm_usage", PdlUsage())

    dist: Categorical[Any]
    match algo:
        case "is":
            dist = infer_importance_sampling(
                prog, config, scope, loc, num_particles=num_particles
            )
        case "parallel-is":
            dist = infer_importance_sampling_parallel(
                prog,
                config,
                scope,
                loc,
                num_particles=num_particles,
                max_workers=max_workers,
            )
        case "smc":
            dist = infer_smc(prog, config, scope, loc, num_particles=num_particles)
        case "parallel-smc":
            dist = infer_smc_parallel(
                prog,
                config,
                scope,
                loc,
                num_particles=num_particles,
                max_workers=max_workers,
            )
        case "rejection":
            dist = infer_rejection_sampling(
                prog, config, scope, loc, num_samples=num_particles
            )
        case "parallel-rejection":
            dist = infer_rejection_sampling_parallel(
                prog,
                config,
                scope,
                loc,
                num_samples=num_particles,
                max_workers=max_workers,
            )
        case "maj":
            dist = infer_majority_voting(
                prog, config, scope, loc, num_particles=num_particles
            )
        case "parallel-maj":
            dist = infer_majority_voting_parallel(
                prog,
                config,
                scope,
                loc,
                num_particles=num_particles,
                max_workers=max_workers,
            )

        case _:
            assert False, f"Unexpected algo: {algo}"
    match output:
        case "result":
            return dist
        case "all":
            result_all = {
                "result": dist,
                # "scope": future_scope.result(),
                # "trace": trace,
                # "replay": state.replay,
                # "score": state.score.ref,
                "usage": config["llm_usage"],
            }
            return result_all
        case _:
            assert False, 'The `output` variable should be "result" or "all"'


def exec_dict(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    prog: dict[str, Any],
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
    output: Literal["result", "all"] = "result",
) -> Categorical[Any] | dict:
    program = parse_dict(prog)
    result = exec_program(program, config, ppdl_config, scope, loc, output)
    return result


def exec_str(
    prog: str,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    output: Literal["result", "all"] = "result",
) -> Categorical[Any] | dict:
    program, loc = parse_str(prog)
    result = exec_program(program, config, ppdl_config, scope, loc, output)
    return result


def exec_file(
    prog: str | Path,
    config: Optional[InterpreterConfig] = None,
    ppdl_config: Optional[PpdlConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    output: Literal["result", "all"] = "result",
) -> Categorical[Any] | dict:
    program, loc = parse_file(prog)
    if config is None:
        config = InterpreterConfig()
    if config.get("cwd") is None:
        config["cwd"] = Path(prog).parent
    result = exec_program(program, config, ppdl_config, scope, loc, output)
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
        choices=[
            "is",
            "parallel-is",
            "smc",
            "parallel-smc",
            "rejection",
            "parallel-rejection",
            "maj",
            "parallel-maj",
        ],
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

    dist = exec_file(args.pdl, config, ppdl_config, initial_scope, output="result")

    assert isinstance(dist, Categorical)
    if args.viz:
        viz(dist)
        plt.show()
    print(dist.sample())
    return 0


if __name__ == "__main__":
    main()
