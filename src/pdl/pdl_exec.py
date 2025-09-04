from pathlib import Path
from typing import Any, Literal, Optional, TypedDict

from .pdl_ast import (
    PdlLocationType,
    Program,
    RoleType,
    ScopeType,
    empty_block_location,
    get_default_model_parameters,
)
from .pdl_interpreter import InterpreterState, process_prog
from .pdl_lazy import PdlDict
from .pdl_parser import parse_dict, parse_file, parse_str


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
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
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
    config = config or {}
    state = InterpreterState(**config)
    if not isinstance(scope, PdlDict):
        scope = PdlDict(scope or {})
    loc = loc or empty_block_location
    initial_scope = {"pdl_model_default_parameters": get_default_model_parameters()}
    future_result, _, future_scope, trace = process_prog(
        state, scope | initial_scope, prog, loc
    )
    result = future_result.result()
    match output:
        case "result":
            return result
        case "all":
            scope = future_scope.result()
            return {"result": result, "scope": scope, "trace": trace}
        case _:
            assert False, 'The `output` variable should be "result" or "all"'


def exec_dict(
    prog: dict[str, Any],
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
    loc: Optional[PdlLocationType] = None,
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
    program = parse_dict(prog)
    result = exec_program(program, config, scope, loc, output)
    return result


def exec_str(
    prog: str,
    config: Optional[InterpreterConfig] = None,
    scope: Optional[ScopeType | dict[str, Any]] = None,
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
    scope: Optional[ScopeType | dict[str, Any]] = None,
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
