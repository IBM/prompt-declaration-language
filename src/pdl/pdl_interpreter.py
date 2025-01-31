import json
import logging
import re
import shlex
import subprocess  # nosec
import sys
import time
import types

# TODO: temporarily disabling warnings to mute a pydantic warning from liteLLM
import warnings

warnings.filterwarnings("ignore", "Valid config keys have changed in V2")

# from itertools import batched
from pathlib import Path  # noqa: E402
from typing import Any, Generator, Optional, Sequence, TypeVar  # noqa: E402

import httpx  # noqa: E402
import litellm  # noqa: E402
import yaml  # noqa: E402
from jinja2 import (  # noqa: E402
    Environment,
    StrictUndefined,
    Template,
    TemplateSyntaxError,
    UndefinedError,
)
from jinja2.nodes import TemplateData  # noqa: E402
from jinja2.runtime import Undefined  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from .pdl_ast import (  # noqa: E402
    AdvancedBlockType,
    AnyPattern,
    ArrayBlock,
    ArrayPattern,
    Block,
    BlockKind,
    BlockType,
    CallBlock,
    CodeBlock,
    ContributeTarget,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    IterationType,
    LastOfBlock,
    LitellmModelBlock,
    LitellmParameters,
    LocalizedExpression,
    LocationType,
    MatchBlock,
    Message,
    MessageBlock,
    Messages,
    ModelBlock,
    ObjectBlock,
    ObjectPattern,
    OrPattern,
    ParserType,
    Pattern,
    PatternType,
    PDLException,
    PdlParser,
    Program,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    RoleType,
    ScopeType,
    TextBlock,
    empty_block_location,
)
from .pdl_dumper import block_to_dict  # noqa: E402
from .pdl_llms import LitellmModel  # noqa: E402
from .pdl_location_utils import append, get_loc_string  # noqa: E402
from .pdl_parser import PDLParseError, parse_file, parse_str  # noqa: E402
from .pdl_scheduler import yield_background, yield_result  # noqa: E402
from .pdl_schema_validator import type_check_args, type_check_spec  # noqa: E402
from .pdl_utils import (  # noqa: E402
    GeneratorWrapper,
    apply_defaults,
    get_contribute_value,
    messages_concat,
    replace_contribute_value,
    stringify,
)

logger = logging.getLogger(__name__)


class PDLRuntimeError(PDLException):
    def __init__(
        self,
        message: str,
        loc: Optional[LocationType] = None,
        trace: Optional[BlockType] = None,
        fallback: Optional[Any] = None,
    ):
        super().__init__(message)
        self.loc = loc
        self.trace = trace
        self.fallback = fallback
        self.message = message


class PDLRuntimeExpressionError(PDLRuntimeError):
    pass


class PDLRuntimeParserError(PDLRuntimeError):
    pass


class PDLRuntimeProcessBlocksError(PDLException):
    def __init__(
        self,
        message: str,
        blocks: list[BlockType],
        loc: Optional[LocationType] = None,
        fallback: Optional[Any] = None,
    ):
        super().__init__(message)
        self.loc = loc
        self.blocks = blocks
        self.fallback = fallback
        self.message = message


empty_scope: ScopeType = {"pdl_context": []}


class InterpreterState(BaseModel):
    yield_result: bool = False
    yield_background: bool = False
    batch: int = 1
    # batch=0: streaming
    # batch=1: call to generate with `input`
    role: RoleType = "user"
    cwd: Path = Path.cwd()

    def with_yield_result(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_result": b})

    def with_yield_background(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_background": b})

    def with_role(self: "InterpreterState", role: RoleType) -> "InterpreterState":
        return self.model_copy(update={"role": role})


def generate(
    pdl_file: str | Path,
    log_file: Optional[str | Path],
    state: Optional[InterpreterState],
    initial_scope: ScopeType,
    trace_file: Optional[str | Path],
):
    """Execute the PDL program defined in `pdl_file`.

    Args:
        pdl_file: Program to execute.
        log_file: File where the log is written. If `None`, use `log.txt`.
        initial_scope: Environment defining the variables in scope to execute the program.
        state: Initial state of the interpreter.
        trace_file: Indicate if the execution trace must be produced and the file to save it.
    """
    if log_file is None:
        log_file = "log.txt"
    logging.basicConfig(filename=log_file, encoding="utf-8", format="", filemode="w")
    try:
        prog, loc = parse_file(pdl_file)
        if state is None:
            state = InterpreterState(cwd=Path(pdl_file).parent)
        result, _, _, trace = process_prog(state, initial_scope, prog, loc)
        if not state.yield_result:
            if state.yield_background:
                print("\n----------------")
            if result is None:
                print()
            else:
                print(stringify(result))
        else:
            print()
        if trace_file:
            write_trace(trace_file, trace)
    except PDLParseError as exc:
        print("\n".join(exc.message), file=sys.stderr)
    except PDLRuntimeError as exc:
        if exc.loc is None:
            message = exc.message
        else:
            message = get_loc_string(exc.loc) + exc.message
        print(message, file=sys.stderr)
        if trace_file and exc.trace is not None:
            write_trace(trace_file, exc.trace)


def write_trace(
    trace_file: str | Path,
    trace: BlockType,
):
    """Write the execution trace into a file.

    Args:
        trace_file:  File to save the execution trace.
        trace: Execution trace.
    """
    try:
        with open(trace_file, "w", encoding="utf-8") as fp:
            json.dump(block_to_dict(trace, json_compatible=True), fp)
    except Exception:
        print("Fail to generate the trace", file=sys.stderr)


def process_prog(
    state: InterpreterState,
    scope: ScopeType,
    prog: Program,
    loc: LocationType = empty_block_location,
) -> tuple[Any, Messages, ScopeType, BlockType]:
    """Execute a PDL program.

    Args:
        state: Initial state of the interpreter.
        scope: Environment defining the variables in scope to execute the program.
        prog: Program to execute.
        loc: Source code location mapping. Defaults to empty_block_location.

    Returns:
        Return the final result, the background messages, the final variable mapping, and the execution trace.

    Raises:
        PDLRuntimeError: If the program raises an error.
    """
    scope = empty_scope | scope
    result, document, final_scope, trace = process_block(
        state, scope, block=prog.root, loc=loc
    )
    return result, document, final_scope, trace


def process_block(
    state: InterpreterState, scope: ScopeType, block: BlockType, loc: LocationType
) -> tuple[Any, Messages, ScopeType, BlockType]:
    result: Any
    background: Messages
    trace: BlockType
    try:
        if not isinstance(block, Block):
            try:
                result = process_expr(scope, block, loc)
            except PDLRuntimeExpressionError as exc:
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or loc,
                    trace=ErrorBlock(msg=exc.message, location=loc, program=block),
                ) from exc
            background = [{"role": state.role, "content": stringify(result)}]
            trace = stringify(result)
            if state.yield_background:
                yield_background(background)
            if state.yield_result:
                yield_result(result, BlockKind.DATA)
            append_log(state, "pdl_context", background)
        else:
            result, background, scope, trace = process_advanced_block_timed(
                state, scope, block, loc
            )
    except EOFError as exc:
        raise PDLRuntimeError(
            "EOF",
            loc=loc,
            trace=ErrorBlock(msg="EOF", location=loc, program=block),
        ) from exc
    except KeyboardInterrupt as exc:
        raise PDLRuntimeError(
            "Keyboard Interrupt",
            loc=loc,
            trace=ErrorBlock(msg="Keyboard Interrupt", location=loc, program=block),
        ) from exc
    scope = scope | {"pdl_context": background}
    return result, background, scope, trace


def context_in_contribute(block: AdvancedBlockType) -> bool:
    if ContributeTarget.CONTEXT.value in block.contribute:
        return True
    if get_contribute_value(block.contribute) is not None:
        return True
    return False


# A start-end time wrapper around `process_advanced_block`
def process_advanced_block_timed(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> tuple[Any, Messages, ScopeType, BlockType]:
    block.start_nanos = time.time_ns()
    result, background, scope, trace = process_advanced_block(state, scope, block, loc)
    end_nanos = time.time_ns()
    match trace:
        case LitellmModelBlock():
            trace = trace.model_copy(
                update={
                    "end_nanos": end_nanos,
                    "context": scope["pdl_context"],
                }
            )
        case Block():
            trace = trace.model_copy(update={"end_nanos": end_nanos})
    return result, background, scope, trace


def process_advanced_block(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> tuple[Any, Messages, ScopeType, BlockType]:
    if block.role is not None:
        state = state.with_role(block.role)
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(state, scope, block.defs, loc)
        block = block.model_copy(update={"defs": defs_trace})
    state = state.with_yield_result(
        state.yield_result and ContributeTarget.RESULT in block.contribute
    )
    state = state.with_yield_background(
        state.yield_background and context_in_contribute(block)
    )
    try:
        result, background, scope, trace = process_block_body(state, scope, block, loc)
        trace = trace.model_copy(update={"result": result})
        if block.parser is not None:
            result = parse_result(block.parser, result)
        if block.spec is not None and not isinstance(block, FunctionBlock):
            errors = type_check_spec(result, block.spec, block.location)
            if len(errors) > 0:
                message = "Type errors during spec checking:\n" + "\n".join(errors)
                raise PDLRuntimeError(
                    message,
                    loc=loc,
                    trace=ErrorBlock(msg=message, program=trace),
                    fallback=result,
                )
    except Exception as exc:
        if block.fallback is None:
            raise exc from exc
        (
            result,
            background,
            scope,
            trace,
        ) = process_block_of(
            block,
            "fallback",
            state,
            scope,
            loc=loc,
        )
        if block.spec is not None and not isinstance(block, FunctionBlock):
            errors = type_check_spec(result, block.spec, block.location)
            if len(errors) > 0:
                message = "Type errors during spec checking:\n" + "\n".join(errors)
                raise PDLRuntimeError(  # pylint: disable=raise-missing-from
                    message,
                    loc=append(loc, "fallback"),
                    trace=ErrorBlock(msg=message, program=trace),
                    fallback=result,
                )
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: result}
    if ContributeTarget.RESULT not in block.contribute:
        result = ""
    if ContributeTarget.CONTEXT not in block.contribute:
        background = []
    contribute_value, trace = process_contribute(trace, scope, loc)
    if contribute_value is not None:
        background = contribute_value

    return result, background, scope, trace


def process_block_body(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> tuple[Any, Messages, ScopeType, AdvancedBlockType]:
    scope_init = scope
    result: Any
    background: Messages
    trace: AdvancedBlockType
    block.location = loc
    match block:
        case ModelBlock():
            result, background, scope, trace = process_call_model(
                state, scope, block, loc
            )
        case CodeBlock():
            result, background, scope, trace = process_call_code(
                state, scope, block, loc
            )
            if state.yield_result:
                yield_result(result, block.kind)
            if state.yield_background:
                yield_background(background)
        case GetBlock(get=var):
            block.location = append(loc, "get")
            try:
                result = get_var(var, scope, block.location)
            except PDLRuntimeExpressionError as exc:
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or loc,
                    trace=ErrorBlock(msg=exc.message, location=loc, program=block),
                ) from exc
            background = [{"role": state.role, "content": stringify(result)}]
            trace = block.model_copy()
            if state.yield_result:
                yield_result(result, block.kind)
            if state.yield_background:
                yield_background(background)
        case DataBlock(data=v):
            block.location = append(loc, "data")
            if block.raw:
                result = v
                trace = block.model_copy()
            else:
                result, trace = process_expr_of(block, "data", scope, loc)
            background = [{"role": state.role, "content": stringify(result)}]
            if state.yield_result:
                yield_result(result, block.kind)
            if state.yield_background:
                yield_background(background)
        case TextBlock():
            result, background, scope, trace = process_blocks_of(
                block,
                "text",
                IterationType.TEXT,
                state,
                scope,
                loc,
            )
        case LastOfBlock():
            result, background, scope, trace = process_blocks_of(
                block,
                "lastOf",
                IterationType.LASTOF,
                state,
                scope,
                loc,
            )
        case ArrayBlock():
            result, background, scope, trace = process_blocks_of(
                block,
                "array",
                IterationType.ARRAY,
                state,
                scope,
                loc,
            )
        case ObjectBlock():
            iteration_state = state.with_yield_result(False)
            if isinstance(block.object, dict):
                background = []
                values = []
                values_trace = []
                try:
                    obj_loc = append(loc, "object")
                    for k, value_blocks in block.object.items():
                        value, value_background, scope, value_trace = process_blocks(
                            IterationType.LASTOF,
                            iteration_state,
                            scope,
                            value_blocks,
                            block.kind,
                            append(obj_loc, k),
                        )
                        background = messages_concat(background, value_background)
                        values.append(value)
                        values_trace.append(value_trace)
                except PDLRuntimeProcessBlocksError as exc:
                    obj = dict(zip(block.object.keys(), exc.blocks))
                    trace = block.model_copy(update={"object": obj})
                    raise PDLRuntimeError(
                        exc.message,
                        loc=exc.loc or loc,
                        trace=trace,
                    ) from exc
                result = dict(zip(block.object.keys(), values))
                object_trace = dict(zip(block.object.keys(), values_trace))
                trace = block.model_copy(update={"object": object_trace})
            else:
                results, background, scope, trace = process_blocks_of(
                    block,
                    "object",
                    IterationType.ARRAY,
                    iteration_state,
                    scope,
                    loc,
                )
                result = {}
                for d in results:
                    result = result | d
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result, block.kind)
        case MessageBlock():
            content, background, scope, trace = process_block_of(
                block,
                "content",
                state,
                scope,
                loc,
            )
            result = {"role": state.role, "content": content}
        case IfBlock():
            b = process_condition_of(block, "condition", scope, loc, "if")
            if b:
                result, background, scope, trace = process_block_of(
                    block, "then", state, scope, loc
                )
            elif block.elses is not None:
                result, background, scope, trace = process_block_of(
                    block, "elses", state, scope, loc, "else"
                )
            else:
                result = ""
                background = []
                trace = block
            trace = trace.model_copy(
                update={
                    "if_result": b,
                }
            )
        case MatchBlock():
            match_, block = process_expr_of(block, "match_", scope, loc, "match")
            cases = []
            matched = False
            result = ""
            background = []
            for i, match_case in enumerate(block.with_):
                if matched:
                    cases.append(match_case)
                    continue
                loc_i = append(loc, "[" + str(i) + "]")
                if "case" in match_case.model_fields_set:
                    new_scope = is_matching(match_, match_case.case, scope)
                    if new_scope is None:
                        cases.append(match_case)
                        continue
                else:
                    new_scope = scope
                b = True
                if "if_" in match_case.model_fields_set:
                    loc_if = append(loc_i, "if")
                    try:
                        b = process_expr(new_scope, match_case.if_, loc_if)
                    except PDLRuntimeExpressionError as exc:
                        cases.append(match_case)
                        block.with_ = cases
                        raise PDLRuntimeError(
                            exc.message,
                            loc=exc.loc or loc_if,
                            trace=ErrorBlock(
                                msg=exc.message, location=loc, program=block
                            ),
                        ) from exc
                if not b:
                    cases.append(match_case)
                    continue
                matched = True
                try:
                    result, background, scope, return_trace = process_block(
                        state,
                        new_scope,
                        match_case.then,
                        append(loc_i, "return"),
                    )
                except PDLRuntimeError as exc:
                    match_case_trace = match_case.model_copy(
                        update={"return_": exc.trace}
                    )
                    cases.append(match_case_trace)
                    block.with_ = cases
                    raise PDLRuntimeError(
                        exc.message,
                        loc=exc.loc or loc,
                        trace=block,
                    ) from exc
                match_case_trace = block.model_copy(update={"return_": return_trace})
                cases.append(match_case_trace)
            if not matched:
                append_log(state, "Match", "no match!")
            block.with_ = cases
            trace = block
        case RepeatBlock(num_iterations=n):
            results = []
            background = []
            iterations_trace: list[BlockType] = []
            pdl_context_init = scope_init["pdl_context"]
            iteration_state = state.with_yield_result(
                state.yield_result and block.join.iteration_type == IterationType.TEXT
            )
            repeat_loc = append(loc, "repeat")
            try:
                first = True
                for _ in range(n):
                    if first:
                        first = False
                    elif block.join.iteration_type == IterationType.TEXT:
                        join_string = block.join.join_string
                        results.append(join_string)
                        if iteration_state.yield_result:
                            yield_result(join_string, block.kind)
                        if iteration_state.yield_background:
                            yield_background(
                                [{"role": block.role, "content": join_string}]
                            )
                    scope = scope | {
                        "pdl_context": messages_concat(pdl_context_init, background)
                    }
                    (
                        iteration_result,
                        iteration_background,
                        scope,
                        body_trace,
                    ) = process_block(
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    results.append(iteration_result)
                    background = messages_concat(background, iteration_background)
                    iterations_trace.append(body_trace)
            except PDLRuntimeError as exc:
                iterations_trace.append(exc.trace)
                trace = block.model_copy(update={"trace": iterations_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result, block.kind)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ForBlock():
            results = []
            background = []
            iter_trace: list[BlockType] = []
            pdl_context_init = scope_init["pdl_context"]
            items, block = process_expr_of(block, "fors", scope, loc, "for")
            lengths = []
            for idx, lst in items.items():
                if not isinstance(lst, list):
                    msg = "Values inside the For block must be lists."
                    lst_loc = append(
                        append(block.location or empty_block_location, "for"), idx
                    )
                    raise PDLRuntimeError(
                        message=msg,
                        loc=lst_loc,
                        trace=ErrorBlock(msg=msg, location=lst_loc, program=block),
                        fallback=[],
                    )
                lengths.append(len(lst))
            if len(set(lengths)) != 1:  # Not all the lists are of the same length
                msg = "Lists inside the For block must be of the same length."
                for_loc = append(block.location or empty_block_location, "for")
                raise PDLRuntimeError(
                    msg,
                    loc=for_loc,
                    trace=ErrorBlock(msg=msg, location=for_loc, program=block),
                    fallback=[],
                )
            iteration_state = state.with_yield_result(
                state.yield_result and block.join.iteration_type == IterationType.TEXT
            )
            repeat_loc = append(loc, "repeat")
            try:
                first = True
                for i in range(lengths[0]):
                    if first:
                        first = False
                    elif block.join.iteration_type == IterationType.TEXT:
                        join_string = block.join.join_string
                        results.append(join_string)
                        if iteration_state.yield_result:
                            yield_result(join_string, block.kind)
                        if iteration_state.yield_background:
                            yield_background(
                                [{"role": block.role, "content": join_string}]
                            )
                    scope = scope | {
                        "pdl_context": messages_concat(pdl_context_init, background)
                    }
                    for k in items.keys():
                        scope = scope | {k: items[k][i]}
                    (
                        iteration_result,
                        iteration_background,
                        scope,
                        body_trace,
                    ) = process_block(
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    background = messages_concat(background, iteration_background)
                    results.append(iteration_result)
                    iter_trace.append(body_trace)
            except PDLRuntimeError as exc:
                iter_trace.append(exc.trace)
                trace = block.model_copy(update={"trace": iter_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result, block.kind)
            trace = block.model_copy(update={"trace": iter_trace})
        case RepeatUntilBlock():
            results = []
            stop = False
            background = []
            iterations_trace = []
            pdl_context_init = scope_init["pdl_context"]
            iteration_state = state.with_yield_result(
                state.yield_result and block.join.iteration_type == IterationType.TEXT
            )
            repeat_loc = append(loc, "repeat")
            try:
                first = True
                while not stop:
                    if first:
                        first = False
                    elif block.join.iteration_type == IterationType.TEXT:
                        join_string = block.join.join_string
                        results.append(join_string)
                        if iteration_state.yield_result:
                            yield_result(join_string, block.kind)
                        if iteration_state.yield_background:
                            yield_background(
                                [{"role": block.role, "content": join_string}]
                            )
                    scope = scope | {
                        "pdl_context": messages_concat(pdl_context_init, background)
                    }
                    (
                        iteration_result,
                        iteration_background,
                        scope,
                        body_trace,
                    ) = process_block(
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    results.append(iteration_result)
                    background = messages_concat(background, iteration_background)
                    iterations_trace.append(body_trace)
                    stop = process_condition_of(block, "until", scope, loc)
            except PDLRuntimeError as exc:
                iterations_trace.append(exc.trace)
                trace = block.model_copy(update={"trace": iterations_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result, block.kind)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ReadBlock():
            result, background, scope, trace = process_input(state, scope, block, loc)
            if state.yield_result:
                yield_result(result, block.kind)
            if state.yield_background:
                yield_background(background)

        case IncludeBlock():
            result, background, scope, trace = process_include(state, scope, block, loc)

        case FunctionBlock():
            closure = block.model_copy()
            if block.assign is not None:
                scope = scope | {block.assign: closure}
            closure.scope = scope
            result = closure
            background = []
            trace = closure.model_copy(update={})
        case CallBlock():
            result, background, scope, trace = process_call(state, scope, block, loc)
        case EmptyBlock():
            result = ""
            background = []
            trace = block.model_copy()

        case _:
            assert False, f"Internal error: unsupported type ({type(block)})"
    return result, background, scope, trace


def is_matching(  # pylint: disable=too-many-return-statements
    value: Any, pattern: PatternType, scope: ScopeType
) -> Optional[ScopeType]:
    """The function test if `value` matches the pattern `match` and returns the scope updated with the new variables bound by the matching.

    Args:
        value: Value to match.
        pattern: Pattern to match.
        scope: Current variable binding.

    Returns:
        The function returns `None` if the value is not matched by the pattern and a copy of the updated scope otherwise.
    """
    new_scope: Optional[ScopeType]
    match pattern:
        case OrPattern():
            new_scope = None
            for p in pattern.anyOf:
                new_scope = is_matching(value, p, scope)
                if new_scope:
                    break
        case ArrayPattern():
            if not isinstance(value, Sequence) or len(pattern.array) != len(value):
                return None
            new_scope = scope
            for v, p in zip(value, pattern.array):
                new_scope = is_matching(v, p, new_scope)
                if new_scope is None:
                    return None
        case ObjectPattern():
            if not isinstance(value, dict):
                return None
            new_scope = scope
            for k, p in pattern.object.items():
                if k not in value:
                    return None
                new_scope = is_matching(value[k], p, new_scope)
                if new_scope is None:
                    return None
        case AnyPattern():
            new_scope = scope
        case _:
            assert not isinstance(pattern, Pattern)
            if value != pattern:
                return None
            new_scope = scope
    if new_scope is None:
        return None
    if isinstance(pattern, Pattern) and pattern.assign is not None:
        new_scope = new_scope | {pattern.assign: value}
    return new_scope


def process_defs(
    state: InterpreterState,
    scope: ScopeType,
    defs: dict[str, BlockType],
    loc: LocationType,
) -> tuple[ScopeType, dict[str, BlockType]]:
    defs_trace: dict[str, BlockType] = {}
    defloc = append(loc, "defs")
    for x, block in defs.items():
        newloc = append(defloc, x)
        state = state.with_yield_result(False)
        state = state.with_yield_background(False)
        result, _, _, block_trace = process_block(state, scope, block, newloc)
        scope = scope | {x: result}
        defs_trace[x] = block_trace
    return scope, defs_trace


BlockTypeTVarProcessBlockOf = TypeVar(
    "BlockTypeTVarProcessBlockOf", bound=AdvancedBlockType
)


def process_block_of(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    block: BlockTypeTVarProcessBlockOf,
    field: str,
    state: InterpreterState,
    scope: ScopeType,
    loc: LocationType,
    field_alias: Optional[str] = None,
) -> tuple[Any, Messages, ScopeType, BlockTypeTVarProcessBlockOf]:
    try:
        result, background, scope, child_trace = process_block(
            state,
            scope,
            getattr(block, field),
            append(loc, field_alias or field),
        )
    except PDLRuntimeError as exc:
        trace = block.model_copy(update={field: exc.trace})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc
    trace = block.model_copy(update={field: child_trace})
    return result, background, scope, trace


BlockTypeTVarProcessBlocksOf = TypeVar(
    "BlockTypeTVarProcessBlocksOf", bound=AdvancedBlockType
)


def process_blocks_of(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    block: BlockTypeTVarProcessBlocksOf,
    field: str,
    iteration_type: IterationType,
    state: InterpreterState,
    scope: ScopeType,
    loc: LocationType,
    field_alias: Optional[str] = None,
) -> tuple[Any, Messages, ScopeType, BlockTypeTVarProcessBlocksOf]:
    try:
        result, background, scope, blocks = process_blocks(
            iteration_type,
            state,
            scope,
            getattr(block, field),
            block.kind,
            append(loc, field_alias or field),
        )
    except PDLRuntimeProcessBlocksError as exc:
        trace = block.model_copy(update={field: exc.blocks})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc
    trace = block.model_copy(update={field: blocks})
    return result, background, scope, trace


def process_blocks(  # pylint: disable=too-many-arguments,too-many-positional-arguments
    iteration_type: IterationType,
    state: InterpreterState,
    scope: ScopeType,
    blocks: BlockType | list[BlockType],
    block_kind: BlockKind,
    loc: LocationType,
) -> tuple[Any, Messages, ScopeType, BlockType | list[BlockType]]:
    result: Any
    background: Messages
    trace: BlockType | list[BlockType]
    results = []
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        # Is a list of blocks
        iteration_state = state.with_yield_result(
            state.yield_result and iteration_type != IterationType.ARRAY
        )
        new_loc = None
        background = []
        trace = []
        pdl_context_init = scope["pdl_context"]
        try:
            for i, block in enumerate(blocks):
                scope = scope | {
                    "pdl_context": messages_concat(pdl_context_init, background)
                }
                new_loc = append(loc, "[" + str(i) + "]")
                if iteration_type == IterationType.LASTOF and state.yield_result:
                    iteration_state = state.with_yield_result(i + 1 == len(blocks))
                (
                    iteration_result,
                    iteration_background,
                    scope,
                    t,
                ) = process_block(iteration_state, scope, block, new_loc)
                results.append(iteration_result)
                background = messages_concat(background, iteration_background)
                trace.append(t)  # type: ignore
        except PDLRuntimeError as exc:
            trace.append(exc.trace)  # type: ignore
            raise PDLRuntimeProcessBlocksError(
                message=exc.message, blocks=trace, loc=exc.loc or new_loc
            ) from exc
    else:
        iteration_state = state.with_yield_result(
            state.yield_result and iteration_type != IterationType.ARRAY
        )
        block_result, background, scope, trace = process_block(
            iteration_state, scope, blocks, loc
        )
        results.append(block_result)
    result = combine_results(iteration_type, results)
    if state.yield_result and not iteration_state.yield_result:
        yield_result(result, block_kind)
    return result, background, scope, trace


def combine_results(iteration_type: IterationType, results: list[Any]):
    result: Any
    match iteration_type:
        case IterationType.ARRAY:
            result = results
        case IterationType.LASTOF:
            if len(results) > 0:
                result = results[-1]
            else:
                result = None
        case IterationType.TEXT:
            result = "".join([stringify(r) for r in results])
        case _:
            assert False
    return result


BlockTypeTVarProcessExprOf = TypeVar(
    "BlockTypeTVarProcessExprOf", bound=AdvancedBlockType
)


def process_contribute(
    block: BlockTypeTVarProcessExprOf, scope: ScopeType, loc: LocationType
) -> tuple[Any, BlockTypeTVarProcessExprOf]:
    value = get_contribute_value(block.contribute)
    loc = append(loc, "contribute")
    try:
        result = process_expr(scope, value, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, location=loc, program=block),
        ) from exc
    replace = replace_contribute_value(block.contribute, result)
    trace = block.model_copy(update={"contribute": replace})
    return result, trace


def process_expr_of(
    block: BlockTypeTVarProcessExprOf,
    field: str,
    scope: ScopeType,
    loc: LocationType,
    field_alias: Optional[str] = None,
) -> tuple[Any, BlockTypeTVarProcessExprOf]:
    expr = getattr(block, field)
    loc = append(loc, field_alias or field)
    try:
        result = process_expr(scope, expr, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, location=loc, program=block),
        ) from exc
    trace = block.model_copy(update={field: result})
    return result, trace


def process_condition_of(
    block: AdvancedBlockType,
    field: str,
    scope: ScopeType,
    loc: LocationType,
    field_alias: Optional[str] = None,
) -> bool:
    expr = getattr(block, field)
    loc = append(loc, field_alias or field)
    try:
        result = process_expr(scope, expr, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, location=loc, program=block),
        ) from exc
    return result


EXPR_START_STRING = "${"
EXPR_END_STRING = "}"


def process_expr(  # pylint: disable=too-many-return-statements
    scope: ScopeType, expr: Any, loc: LocationType
) -> Any:
    result: Any
    if isinstance(expr, LocalizedExpression):
        return process_expr(scope, expr.expr, loc)
    if isinstance(expr, str):
        try:
            if expr.startswith(EXPR_START_STRING) and expr.endswith(EXPR_END_STRING):
                # `expr` might be a single expression and should not be stringify
                env = Environment(  # nosec B701
                    # [B701:jinja2_autoescape_false] By default, jinja2 sets autoescape to False. Consider using autoescape=True or use the select_autoescape function to mitigate XSS vulnerabilities.
                    # This is safe because autoescape is not needed since we do not generate HTML
                    block_start_string="{%%%%%PDL%%%%%%%%%%",
                    block_end_string="%%%%%PDL%%%%%%%%%%}",
                    variable_start_string=EXPR_START_STRING,
                    variable_end_string=EXPR_END_STRING,
                    undefined=StrictUndefined,
                )
                expr_ast = env.parse(expr)
                if len(expr_ast.body) == 1:
                    expr_ast_nodes = getattr(expr_ast.body[0], "nodes", [])
                else:
                    expr_ast_nodes = []
                if len(expr_ast_nodes) == 1:
                    if isinstance(expr_ast_nodes[0], TemplateData):
                        # `expr` is a string that do not include jinja expression
                        return expr
                    # `expr` has the shape `${ ... }`: it is a single jinja expression
                    result = env.compile_expression(
                        expr[2:-1], undefined_to_none=False
                    )(scope)
                    if isinstance(result, Undefined):
                        raise UndefinedError(str(result))
                    return result
            # `expr` is not a single jinja expression
            template = Template(
                expr,
                keep_trailing_newline=True,
                block_start_string="{%%%%%PDL%%%%%%%%%%",
                block_end_string="%%%%%PDL%%%%%%%%%%}",
                variable_start_string=EXPR_START_STRING,
                variable_end_string=EXPR_END_STRING,
                # comment_start_string="",
                # comment_end_string="",
                autoescape=False,
                undefined=StrictUndefined,
            )
            result = template.render(scope)
            return result
        except UndefinedError as exc:
            raise PDLRuntimeExpressionError(
                f"Error during the evaluation of {expr}: {exc}", loc
            ) from exc
        except TemplateSyntaxError as exc:
            raise PDLRuntimeExpressionError(
                f"Syntax error in {expr}: {exc}", loc
            ) from exc

    if isinstance(expr, list):
        result = []
        for index, x in enumerate(expr):
            res = process_expr(scope, x, append(loc, "[" + str(index) + "]"))
            result.append(res)
        return result
    if isinstance(expr, dict):
        result_dict: dict[str, Any] = {}
        for k, x in expr.items():
            r = process_expr(scope, x, append(loc, k))
            result_dict[k] = r
        return result_dict
    return expr


def process_call_model(
    state: InterpreterState,
    scope: ScopeType,
    block: LitellmModelBlock,
    loc: LocationType,
) -> tuple[
    Any,
    Messages,
    ScopeType,
    LitellmModelBlock,
]:
    # evaluate model name
    _, concrete_block = process_expr_of(block, "model", scope, loc)
    # evaluate model params
    match concrete_block:
        case LitellmModelBlock():
            if isinstance(concrete_block.parameters, LitellmParameters):
                concrete_block = concrete_block.model_copy(
                    update={"parameters": concrete_block.parameters.model_dump()}
                )

            _, concrete_block = process_expr_of(
                concrete_block, "parameters", scope, loc
            )

            # Apply PDL defaults to model invocation
            if concrete_block.parameters is None or isinstance(
                concrete_block.parameters, dict
            ):
                concrete_block.parameters = apply_defaults(
                    str(concrete_block.model),
                    concrete_block.parameters or {},
                    scope.get("pdl_model_default_parameters", []),
                )
        case _:
            assert False
    # evaluate input
    model_input: Messages
    if concrete_block.input is not None:  # If not implicit, then input must be a block
        model_input_result, _, _, input_trace = process_block_of(
            concrete_block,
            "input",
            state.with_yield_result(False).with_yield_background(False),
            scope,
            loc,
        )
        if isinstance(model_input_result, str):
            model_input = [{"role": state.role, "content": model_input_result}]
        else:
            model_input = model_input_result
    else:
        model_input = scope["pdl_context"]
        input_trace = None
    concrete_block = concrete_block.model_copy(
        update={
            "input": input_trace,
        }
    )
    # Execute model call
    try:
        litellm_params = {}

        def get_transformed_inputs(kwargs):
            params_to_model = kwargs["additional_args"]["complete_input_dict"]
            nonlocal litellm_params
            litellm_params = params_to_model

        litellm.input_callback = [get_transformed_inputs]
        # append_log(state, "Model Input", messages_to_str(model_input))

        msg, raw_result = generate_client_response(state, concrete_block, model_input)
        # if "input" in litellm_params:
        append_log(state, "Model Input", litellm_params)
        # else:
        #    append_log(state, "Model Input", messages_to_str(model_input))
        background: Messages = [msg]
        result = "" if msg["content"] is None else msg["content"]
        append_log(state, "Model Output", result)
        trace = block.model_copy(update={"result": result, "trace": concrete_block})
        if block.modelResponse is not None:
            scope = scope | {block.modelResponse: raw_result}
        return result, background, scope, trace
    except httpx.RequestError as exc:
        message = f"model '{block.model}' encountered {repr(exc)} trying to {exc.request.method} against {exc.request.url}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, location=loc, program=concrete_block),
        ) from exc
    except Exception as exc:
        message = f"Error during '{block.model}' model call: {repr(exc)}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, location=loc, program=concrete_block),
        ) from exc


def generate_client_response(
    state: InterpreterState,
    block: LitellmModelBlock,
    model_input: Messages,
) -> tuple[Message, Any]:
    raw_result = None
    match state.batch:
        case 0:
            model_output, raw_result = generate_client_response_streaming(
                state, block, model_input
            )
        case 1:
            model_output, raw_result = generate_client_response_single(
                state, block, model_input
            )
        case _:
            assert False
    return model_output, raw_result


def generate_client_response_streaming(
    state: InterpreterState,
    block: LitellmModelBlock,
    model_input: Messages,
) -> tuple[Message, Any]:
    msg_stream: Generator[Message, Any, Any]
    assert isinstance(block.model, str)  # block is a "concrete block"
    assert block.parameters is None or isinstance(
        block.parameters, dict
    )  # block is a "concrete block"
    match block:
        case LitellmModelBlock():
            msg_stream = LitellmModel.generate_text_stream(
                model_id=block.model,
                messages=model_input,
                spec=block.spec,
                parameters=litellm_parameters_to_dict(block.parameters),
            )
        case _:
            assert False
    complete_msg: Optional[Message] = None
    role = None
    wrapped_gen = GeneratorWrapper(msg_stream)
    for chunk in wrapped_gen:
        if state.yield_result:
            yield_result(
                "" if chunk["content"] is None else chunk["content"], block.kind
            )
        if state.yield_background:
            yield_background([chunk])
        if complete_msg is None:
            complete_msg = chunk
            role = complete_msg["role"]
        else:
            chunk_role = chunk["role"]
            if (
                chunk_role is None
                or chunk_role == role
                and chunk["content"] is not None
            ):
                complete_msg["content"] += chunk["content"]
    raw_result = None
    if block.modelResponse is not None:
        raw_result = wrapped_gen.value
    if complete_msg is None:
        return Message(role=state.role, content=""), raw_result
    return complete_msg, raw_result


def litellm_parameters_to_dict(
    parameters: Optional[LitellmParameters | dict[str, Any]]
) -> dict[str, Any]:
    if isinstance(parameters, dict):
        return parameters
    if parameters is None:
        parameters = LitellmParameters()
    parameters_dict = parameters.model_dump(exclude={"stream"})
    return parameters_dict


def generate_client_response_single(
    state: InterpreterState,
    block: LitellmModelBlock,
    model_input: Messages,
) -> tuple[Message, Any]:
    assert isinstance(block.model, str)  # block is a "concrete block"
    assert block.parameters is None or isinstance(
        block.parameters, dict
    )  # block is a "concrete block"
    msg: Message
    match block:
        case LitellmModelBlock():
            msg, raw_result = LitellmModel.generate_text(
                model_id=block.model,
                messages=model_input,
                spec=block.spec,
                parameters=litellm_parameters_to_dict(block.parameters),
            )
    if state.yield_result:
        yield_result("" if msg["content"] is None else msg["content"], block.kind)
    if state.yield_background:
        yield_background([msg])
    return msg, raw_result


def process_call_code(
    state: InterpreterState, scope: ScopeType, block: CodeBlock, loc: LocationType
) -> tuple[Any, Messages, ScopeType, CodeBlock]:
    background: Messages
    code_s, _, _, block = process_block_of(
        block,
        "code",
        state.with_yield_result(False).with_yield_background(False),
        scope,
        loc,
    )
    append_log(state, "Code Input", code_s)
    match block.lang:
        case "python":
            try:
                result = call_python(code_s, scope)
                background = [{"role": state.role, "content": str(result)}]
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case "command":
            try:
                result = call_command(code_s)
                background = [{"role": state.role, "content": result}]
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case "jinja":
            try:
                result = call_jinja(code_s, scope)
                background = [{"role": state.role, "content": result}]
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case "pdl":
            try:
                result = call_pdl(code_s, scope)
                background = [{"role": state.role, "content": result}]
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case _:
            message = f"Unsupported language: {block.lang}"
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=block.model_copy(),
            )
    append_log(state, "Code Output", result)
    trace = block.model_copy(update={"result": result})
    return result, background, scope, trace


__PDL_SESSION = types.SimpleNamespace()


def call_python(code: str, scope: dict) -> Any:
    my_namespace = types.SimpleNamespace(PDL_SESSION=__PDL_SESSION, **scope)
    exec(code, my_namespace.__dict__)  # nosec B102
    # [B102:exec_used] Use of exec detected.
    # This is the code that the user asked to execute. It can be executed in a docker container with the option `--sandbox`
    result = my_namespace.result
    return result


def call_command(code: str) -> str:
    args = shlex.split(code)
    p = subprocess.run(
        args, capture_output=True, text=True, check=False, shell=False
    )  # nosec B603
    # [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
    # This is the code that the user asked to execute. It can be executed in a docker container with the option `--sandbox`
    if p.stderr != "":
        print(p.stderr, file=sys.stderr)
    if p.returncode != 0:
        raise ValueError(f"command exited with non zero code: {p.returncode}")
    output = p.stdout
    return output


def call_jinja(code: str, scope: dict) -> Any:
    template = Template(
        code,
    )
    result = template.render(scope)
    return result


def call_pdl(code: str, scope: dict) -> Any:
    program, loc = parse_str(code)
    state = InterpreterState()
    result, _, _, _ = process_prog(state, scope, program, loc)
    return result


def process_call(
    state: InterpreterState, scope: ScopeType, block: CallBlock, loc: LocationType
) -> tuple[Any, Messages, ScopeType, CallBlock]:
    result = None
    background: Messages = []
    args, block = process_expr_of(block, "args", scope, loc)
    closure, _ = process_expr_of(block, "call", scope, loc)
    if not isinstance(closure, FunctionBlock):
        msg = f"Type error: {block.call} is of type {type(closure)} but should be a function."
        if isinstance(closure, str) and isinstance(scope.get(closure), FunctionBlock):
            msg += " You might want to call `${ " + str(block.call) + " }`."
        raise PDLRuntimeError(
            msg,
            loc=append(loc, "call"),
            trace=block.model_copy(),
        )
    args_loc = append(loc, "args")
    type_errors = type_check_args(args, closure.function, args_loc)
    if len(type_errors) > 0:
        raise PDLRuntimeError(
            f"Type errors during function call to {block.call}:\n"
            + "\n".join(type_errors),
            loc=args_loc,
            trace=block.model_copy(),
        )
    f_body = closure.returns
    f_scope = (
        (closure.scope or {}) | {"pdl_context": scope["pdl_context"]} | (args or {})
    )
    if closure.location is not None:
        fun_loc = LocationType(
            file=closure.location.file,
            path=closure.location.path + ["return"],
            table=loc.table,
        )
    else:
        fun_loc = empty_block_location
    try:
        result, background, _, f_trace = process_block(state, f_scope, f_body, fun_loc)
    except PDLRuntimeError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or fun_loc,
            trace=block.model_copy(update={"trace": exc.trace}),
        ) from exc
    trace = block.model_copy(update={"trace": f_trace})
    if closure.spec is not None:
        errors = type_check_spec(result, closure.spec, fun_loc)
        if len(errors) > 0:
            raise PDLRuntimeError(
                f"Type errors in result of function call to {block.call}:\n"
                + "\n".join(errors),
                loc=loc,
                trace=trace,
            )
    return result, background, scope, trace


def process_input(
    state: InterpreterState, scope: ScopeType, block: ReadBlock, loc: LocationType
) -> tuple[str, Messages, ScopeType, ReadBlock]:
    read, block = process_expr_of(block, "read", scope, loc)
    if read is not None:
        file = state.cwd / read
        try:
            with open(file, encoding="utf-8") as f:
                s = f.read()
                append_log(state, "Input from File: " + str(file), s)
        except Exception as exc:
            if isinstance(exc, FileNotFoundError):
                msg = f"file {str(file)} not found"
            else:
                msg = f"Fail to open file {str(file)}"
            raise PDLRuntimeError(
                message=msg,
                loc=loc,
                trace=ErrorBlock(msg=msg, location=loc, program=block),
                fallback="",
            ) from exc
    else:
        message = ""
        if block.message is not None:
            message = block.message
        elif block.multiline is False:
            message = "How can I help you?: "
        else:
            message = "Enter/Paste your content. Ctrl-D to save it."
        if block.multiline is False:
            s = input(message)
            append_log(state, "Input from stdin: ", s)
        else:  # multiline
            print(message)
            contents = []
            while True:
                try:
                    line = input()
                except EOFError:
                    break
                contents.append(line + "\n")
            s = "".join(contents)
            append_log(state, "Input from stdin: ", s)
    trace = block.model_copy(update={"result": s})
    background: Messages = [{"role": state.role, "content": s}]
    return s, background, scope, trace


def process_include(
    state: InterpreterState,
    scope: ScopeType,
    block: IncludeBlock,
    loc: LocationType,
) -> tuple[Any, Messages, ScopeType, IncludeBlock]:
    file = state.cwd / block.include
    try:
        prog, new_loc = parse_file(file)
        result, background, scope, trace = process_block(
            state, scope, prog.root, new_loc
        )
        include_trace = block.model_copy(update={"trace": trace})
        return result, background, scope, include_trace
    except PDLParseError as exc:
        message = f"Attempting to include invalid yaml: {str(file)}\n{exc.message}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, program=block.model_copy()),
        ) from exc
    except PDLRuntimeProcessBlocksError as exc:
        trace = block.model_copy(update={"trace": exc.blocks})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc


def parse_result(parser: ParserType, text: str) -> Optional[dict[str, Any] | list[Any]]:
    result: Optional[dict[str, Any] | list[Any]]
    match parser:
        case "json":
            try:
                result = json.loads(text)
            except Exception as exc:
                raise PDLRuntimeParserError(
                    f"Attempted to parse ill-formed JSON: {repr(exc)}"
                ) from exc
        case "jsonl":
            result = []
            try:
                for line in text.split("\n"):
                    if line == "":
                        continue
                    result.append(json.loads(line))
            except Exception as exc:
                raise PDLRuntimeParserError(
                    f"Attempted to parse ill-formed JSON: {repr(exc)}"
                ) from exc
        case "yaml":
            try:
                result = yaml.safe_load(text)
            except Exception as exc:
                raise PDLRuntimeParserError(
                    f"Attempted to parse ill-formed YAML: {repr(exc)}"
                ) from exc
        case PdlParser():
            assert False, "TODO"
        case RegexParser(mode="search" | "match" | "fullmatch"):
            regex = parser.regex
            match parser.mode:
                case "search":
                    matcher = re.search
                case "match":
                    matcher = re.match
                case "fullmatch":
                    matcher = re.fullmatch
                case _:
                    assert False
            try:
                m = matcher(regex, text, flags=re.M)
            except Exception as exc:
                msg = f"Fail to parse with regex {regex}: {repr(exc)}"
                raise PDLRuntimeParserError(msg) from exc
            if m is None:
                return None
            if parser.spec is None:
                result = list(m.groups())
            else:
                current_group_name = ""
                try:
                    result = {}
                    for x in parser.spec.keys():
                        current_group_name = x
                        result[x] = m.group(x)
                    return result
                except IndexError as exc:
                    msg = f"No group named {current_group_name} found by {regex} in {text}"
                    raise PDLRuntimeParserError(msg) from exc
        case RegexParser(mode="split" | "findall"):
            regex = parser.regex
            match parser.mode:
                case "split":
                    result = re.split(regex, text, flags=re.M)
                case "findall":
                    result = re.findall(regex, text, flags=re.M)
                case _:
                    assert False
        case _:
            assert False
    return result


def get_var(var: str, scope: ScopeType, loc: LocationType) -> Any:
    return process_expr(scope, f"{EXPR_START_STRING} {var} {EXPR_END_STRING}", loc)


def append_log(state: InterpreterState, title, somestring):
    logger.warning("**********  %s  **********", title)
    logger.warning(str(somestring))
