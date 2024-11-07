import json
import logging
import re
import shlex
import subprocess  # nosec
import sys
import types

# from itertools import batched
from pathlib import Path
from typing import Any, Generator, Optional, Sequence, TypeVar

import litellm
import yaml
from jinja2 import (
    Environment,
    StrictUndefined,
    Template,
    TemplateSyntaxError,
    UndefinedError,
)
from jinja2.nodes import TemplateData
from jinja2.runtime import Undefined
from pydantic import BaseModel

from .pdl_ast import (
    AdvancedBlockType,
    ArrayBlock,
    BamModelBlock,
    BamTextGenerationParameters,
    Block,
    BlocksType,
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
    LocationType,
    Message,
    MessageBlock,
    Messages,
    ModelBlock,
    ObjectBlock,
    ParserType,
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
from .pdl_dumper import blocks_to_dict
from .pdl_llms import BamModel, LitellmModel
from .pdl_location_utils import append, get_loc_string
from .pdl_parser import PDLParseError, parse_file
from .pdl_scheduler import (
    CodeYieldResultMessage,
    GeneratorWrapper,
    ModelCallMessage,
    ModelYieldResultMessage,
    YieldBackgroundMessage,
    YieldMessage,
    YieldResultMessage,
    schedule,
)
from .pdl_schema_validator import type_check_args, type_check_spec
from .pdl_utils import messages_concat, messages_to_str, stringify

logger = logging.getLogger(__name__)


class PDLRuntimeError(PDLException):
    def __init__(
        self,
        message: str,
        loc: Optional[LocationType] = None,
        trace: Optional[BlocksType] = None,
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


class PDLRuntimeStepBlocksError(PDLException):
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
    trace: BlocksType,
):
    """Write the execution trace into a file.

    Args:
        trace_file:  File to save the execution trace.
        trace: Execution trace.
    """
    try:
        with open(trace_file, "w", encoding="utf-8") as fp:
            json.dump(blocks_to_dict(trace, json_compatible=True), fp)
    except Exception:
        print("Fail to generate the trace", file=sys.stderr)


def process_prog(
    state: InterpreterState,
    scope: ScopeType,
    prog: Program,
    loc: LocationType = empty_block_location,
) -> tuple[Any, Messages, ScopeType, BlocksType]:
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
    doc_generator = step_blocks(
        IterationType.LASTOF, state, scope, blocks=prog.root, loc=loc
    )
    for result, document, final_scope, trace in schedule([doc_generator]):
        return result, document, final_scope, trace
    assert False
    # doc_generator = GeneratorWrapper(step_block(state, scope, block=prog.root, loc=loc))
    # # result, document, scope, trace = schedule(doc_generator)
    # incremental_document = ""
    # for output in doc_generator:
    #     print(output, end="")
    #     assert output is not None
    #     incremental_document += output
    # print()
    # result, document, scope, trace = doc_generator.value
    # assert document == incremental_document or not state.yield_background
    # return result, document, scope, trace


# def process_progs(
#     state: InterpreterState,
#     initial_scopes: Iterable[ScopeType],
#     prog: Program,
#     loc=empty_block_location,
# ) -> Iterable[tuple[Any, Messages, ScopeType, BlockType]]:
#     if state.batch > 1:
#         batch_size = state.batch
#     else:
#         batch_size = 1
#     for batch in batched(initial_scopes, batch_size):
#         doc_generators = [
#             step_block(state, empty_scope | initial_scope, block=prog.root, loc=loc)
#             for initial_scope in batch
#         ]
#         for result, document, scope, trace in schedule(doc_generators):
#             yield result, document, scope, trace


def step_block(
    state: InterpreterState, scope: ScopeType, block: BlockType, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, BlockType]]:
    result: Any
    background: Messages
    trace: BlockType
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
            yield YieldBackgroundMessage(background)
        if state.yield_result:
            yield YieldResultMessage(result)
        append_log(state, "pdl_context", background)
    else:
        result, background, scope, trace = yield from step_advanced_block(
            state, scope, block, loc
        )
    scope = scope | {"pdl_context": background}
    return result, background, scope, trace


def step_advanced_block(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, BlockType]]:
    if block.role is not None:
        state = state.with_role(block.role)
    if len(block.defs) > 0:
        scope, defs_trace = yield from step_defs(state, scope, block.defs, loc)
        block = block.model_copy(update={"defs": defs_trace})
    state = state.with_yield_result(
        state.yield_result and ContributeTarget.RESULT in block.contribute
    )
    state = state.with_yield_background(
        state.yield_background and ContributeTarget.CONTEXT in block.contribute
    )
    try:
        result, background, scope, trace = yield from step_block_body(
            state, scope, block, loc
        )
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
        ) = yield from step_blocks_of(
            block,
            "fallback",
            IterationType.LASTOF,
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
    return result, background, scope, trace


def step_block_body(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, AdvancedBlockType]]:
    scope_init = scope
    result: Any
    background: Messages
    trace: AdvancedBlockType
    block.location = loc
    match block:
        case ModelBlock():
            result, background, scope, trace = yield from step_call_model(
                state, scope, block, loc
            )
        case CodeBlock():
            result, background, scope, trace = yield from step_call_code(
                state, scope, block, loc
            )
            if state.yield_result:
                yield CodeYieldResultMessage(result)
            if state.yield_background:
                yield YieldBackgroundMessage(background)
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
                yield YieldResultMessage(result)
            if state.yield_background:
                yield YieldBackgroundMessage(background)
        case DataBlock(data=v):
            block.location = append(loc, "data")
            if block.raw:
                result = v
                trace = block.model_copy()
            else:
                result, trace = process_expr_of(block, "data", scope, loc)
            background = [{"role": state.role, "content": stringify(result)}]
            if state.yield_result:
                yield YieldResultMessage(result)
            if state.yield_background:
                yield YieldBackgroundMessage(background)
        case TextBlock():
            result, background, scope, trace = yield from step_blocks_of(
                block,
                "text",
                IterationType.TEXT,
                state,
                scope,
                loc,
            )
        case LastOfBlock():
            result, background, scope, trace = yield from step_blocks_of(
                block,
                "lastOf",
                IterationType.LASTOF,
                state,
                scope,
                loc,
            )
        case ArrayBlock():
            result, background, scope, trace = yield from step_blocks_of(
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
                        value, value_background, scope, value_trace = (
                            yield from step_blocks(
                                IterationType.LASTOF,
                                iteration_state,
                                scope,
                                value_blocks,
                                append(obj_loc, k),
                            )
                        )
                        background = messages_concat(background, value_background)
                        values.append(value)
                        values_trace.append(value_trace)
                except PDLRuntimeStepBlocksError as exc:
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
                results, background, scope, trace = yield from step_blocks_of(
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
                yield YieldResultMessage(result)
        case MessageBlock():
            content, background, scope, trace = yield from step_blocks_of(
                block,
                "content",
                IterationType.LASTOF,
                state,
                scope,
                loc,
            )
            result = {"role": state.role, "content": content}
        case IfBlock():
            b = process_condition_of(block, "condition", scope, loc, "if")
            if b:
                result, background, scope, trace = yield from step_blocks_of(
                    block, "then", IterationType.LASTOF, state, scope, loc
                )
            elif block.elses is not None:
                result, background, scope, trace = yield from step_blocks_of(
                    block, "elses", IterationType.LASTOF, state, scope, loc, "else"
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
        case RepeatBlock(num_iterations=n):
            results = []
            background = []
            iterations_trace: list[BlocksType] = []
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
                            yield YieldResultMessage(join_string)
                        if iteration_state.yield_background:
                            yield YieldBackgroundMessage(
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
                    ) = yield from step_blocks(
                        IterationType.LASTOF,
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    results.append(iteration_result)
                    background = messages_concat(background, iteration_background)
                    iterations_trace.append(body_trace)
            except PDLRuntimeStepBlocksError as exc:
                iterations_trace.append(exc.blocks)
                trace = block.model_copy(update={"trace": iterations_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield YieldResultMessage(result)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ForBlock():
            results = []
            background = []
            iter_trace: list[BlocksType] = []
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
                            yield YieldResultMessage(join_string)
                        if iteration_state.yield_background:
                            yield YieldBackgroundMessage(
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
                    ) = yield from step_blocks(
                        IterationType.LASTOF,
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    background = messages_concat(background, iteration_background)
                    results.append(iteration_result)
                    iter_trace.append(body_trace)
            except PDLRuntimeStepBlocksError as exc:
                iter_trace.append(exc.blocks)
                trace = block.model_copy(update={"trace": iter_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield YieldResultMessage(result)
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
                            yield YieldResultMessage(join_string)
                        if iteration_state.yield_background:
                            yield YieldBackgroundMessage(
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
                    ) = yield from step_blocks(
                        IterationType.LASTOF,
                        iteration_state,
                        scope,
                        block.repeat,
                        repeat_loc,
                    )
                    results.append(iteration_result)
                    background = messages_concat(background, iteration_background)
                    iterations_trace.append(body_trace)
                    stop = process_condition_of(block, "until", scope, loc)
            except PDLRuntimeStepBlocksError as exc:
                iterations_trace.append(exc.blocks)
                trace = block.model_copy(update={"trace": iterations_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.iteration_type, results)
            if state.yield_result and not iteration_state.yield_result:
                yield YieldResultMessage(result)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ReadBlock():
            result, background, scope, trace = process_input(state, scope, block, loc)
            if state.yield_result:
                yield YieldResultMessage(result)
            if state.yield_background:
                yield YieldBackgroundMessage(background)

        case IncludeBlock():
            result, background, scope, trace = yield from step_include(
                state, scope, block, loc
            )

        case FunctionBlock():
            closure = block.model_copy()
            if block.assign is not None:
                scope = scope | {block.assign: closure}
            closure.scope = scope
            result = closure
            background = []
            trace = closure.model_copy(update={})
        case CallBlock():
            result, background, scope, trace = yield from step_call(
                state, scope, block, loc
            )
        case EmptyBlock():
            result = ""
            background = []
            trace = block.model_copy()

        case _:
            assert False, f"Internal error: unsupported type ({type(block)})"
    return result, background, scope, trace


def step_defs(
    state: InterpreterState,
    scope: ScopeType,
    defs: dict[str, BlocksType],
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[ScopeType, dict[str, BlocksType]]]:
    defs_trace: dict[str, BlocksType] = {}
    defloc = append(loc, "defs")
    for x, blocks in defs.items():
        newloc = append(defloc, x)
        state = state.with_yield_result(False)
        state = state.with_yield_background(False)
        result, _, _, blocks_trace = yield from step_blocks(
            IterationType.LASTOF, state, scope, blocks, newloc
        )
        scope = scope | {x: result}
        defs_trace[x] = blocks_trace
    return scope, defs_trace


BlockTypeTVarStepBlocksOf = TypeVar(
    "BlockTypeTVarStepBlocksOf", bound=AdvancedBlockType
)


def step_blocks_of(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    block: BlockTypeTVarStepBlocksOf,
    field: str,
    iteration_type: IterationType,
    state: InterpreterState,
    scope: ScopeType,
    loc: LocationType,
    field_alias: Optional[str] = None,
) -> Generator[
    YieldMessage, Any, tuple[Any, Messages, ScopeType, BlockTypeTVarStepBlocksOf]
]:
    try:
        result, background, scope, blocks = yield from step_blocks(
            iteration_type,
            state,
            scope,
            getattr(block, field),
            append(loc, field_alias or field),
        )
    except PDLRuntimeStepBlocksError as exc:
        trace = block.model_copy(update={field: exc.blocks})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc
    trace = block.model_copy(update={field: blocks})
    return result, background, scope, trace


def step_blocks(
    iteration_type: IterationType,
    state: InterpreterState,
    scope: ScopeType,
    blocks: BlocksType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, BlocksType]]:
    result: Any
    background: Messages
    trace: BlocksType
    results = []
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
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
                ) = yield from step_block(iteration_state, scope, block, new_loc)
                results.append(iteration_result)
                background = messages_concat(background, iteration_background)
                trace.append(t)  # type: ignore
        except PDLRuntimeError as exc:
            trace.append(exc.trace)  # type: ignore
            raise PDLRuntimeStepBlocksError(
                message=exc.message, blocks=trace, loc=exc.loc or new_loc
            ) from exc
    else:
        iteration_state = state.with_yield_result(
            state.yield_result and iteration_type != IterationType.ARRAY
        )
        block_result, background, scope, trace = yield from step_block(
            iteration_state, scope, blocks, loc
        )
        results.append(block_result)
    result = combine_results(iteration_type, results)
    if state.yield_result and not iteration_state.yield_result:
        yield YieldResultMessage(result)
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


def process_expr(scope: ScopeType, expr: Any, loc: LocationType) -> Any:
    result: Any
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


def step_call_model(
    state: InterpreterState,
    scope: ScopeType,
    block: BamModelBlock | LitellmModelBlock,
    loc: LocationType,
) -> Generator[
    YieldMessage,
    Any,
    tuple[
        Any,
        Messages,
        ScopeType,
        BamModelBlock | LitellmModelBlock,
    ],
]:
    # evaluate model name
    _, concrete_block = process_expr_of(block, "model", scope, loc)
    # evaluate model params
    match concrete_block:
        case BamModelBlock():
            if isinstance(concrete_block.parameters, BamTextGenerationParameters):
                concrete_block = concrete_block.model_copy(
                    update={"parameters": concrete_block.parameters.model_dump()}
                )
            _, concrete_block = process_expr_of(
                concrete_block, "parameters", scope, loc
            )
        case LitellmModelBlock():
            if isinstance(concrete_block.parameters, LitellmParameters):
                concrete_block = concrete_block.model_copy(
                    update={"parameters": concrete_block.parameters.model_dump()}
                )
            _, concrete_block = process_expr_of(
                concrete_block, "parameters", scope, loc
            )
        case _:
            assert False
    # evaluate input
    model_input: Messages
    if concrete_block.input is not None:  # If not implicit, then input must be a block
        model_input_result, _, _, input_trace = yield from step_blocks_of(
            concrete_block,
            "input",
            IterationType.LASTOF,
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
        msg, raw_result = yield from generate_client_response(
            state, concrete_block, model_input
        )
        if "input" in litellm_params:
            append_log(state, "Model Input", litellm_params["input"])
        else:
            append_log(
                state, "Model Input", messages_to_str(concrete_block.model, model_input)
            )
        background: Messages = [msg]
        result = msg["content"]
        append_log(state, "Model Output", result)
        trace = block.model_copy(update={"result": result, "trace": concrete_block})
        if block.modelResponse is not None:
            scope = scope | {block.modelResponse: raw_result}
        return result, background, scope, trace
    except Exception as exc:
        message = f"Error during model call: {repr(exc)}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, location=loc, program=concrete_block),
        ) from exc


def generate_client_response(  # pylint: disable=too-many-arguments
    state: InterpreterState,
    block: BamModelBlock | LitellmModelBlock,
    model_input: Messages,
) -> Generator[YieldMessage, Any, tuple[Message, Any]]:
    raw_result = None
    match state.batch:
        case 0:
            model_output, raw_result = yield from generate_client_response_streaming(
                state, block, model_input
            )
        case 1:
            model_output, raw_result = yield from generate_client_response_single(
                state, block, model_input
            )
        case _:
            model_output = yield from generate_client_response_batching(
                state, block, model_input
            )
    return model_output, raw_result


def generate_client_response_streaming(
    state: InterpreterState,
    block: BamModelBlock | LitellmModelBlock,
    model_input: Messages,
) -> Generator[YieldMessage, Any, tuple[Message, Any]]:
    msg_stream: Generator[Message, Any, Any]
    match block:
        case BamModelBlock():
            model_input_str = messages_to_str(block.model, model_input)
            msg_stream = BamModel.generate_text_stream(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=model_input_str,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
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
            yield ModelYieldResultMessage(chunk["content"])
        if state.yield_background:
            yield YieldBackgroundMessage([chunk])
        if complete_msg is None:
            complete_msg = chunk
            role = complete_msg["role"]
        else:
            chunk_role = chunk["role"]
            if chunk_role is None or chunk_role == role:
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
    block: BamModelBlock | LitellmModelBlock,
    model_input: Messages,
) -> Generator[YieldMessage, Any, tuple[Message, Any]]:
    msg: Message
    match block:
        case BamModelBlock():
            model_input_str = messages_to_str(block.model, model_input)
            msg, raw_result = BamModel.generate_text(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=model_input_str,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
        case LitellmModelBlock():
            msg, raw_result = LitellmModel.generate_text(
                model_id=block.model,
                messages=model_input,
                spec=block.spec,
                parameters=litellm_parameters_to_dict(block.parameters),
            )
    if state.yield_result:
        yield YieldResultMessage(msg["content"])
    if state.yield_background:
        yield YieldBackgroundMessage([msg])
    return msg, raw_result


def generate_client_response_batching(  # pylint: disable=too-many-arguments
    state: InterpreterState,
    block: BamModelBlock | LitellmModelBlock,
    # model: str,
    model_input: Messages,
) -> Generator[YieldMessage, Any, Message]:
    match block:
        case BamModelBlock():
            model_input_str = messages_to_str(block.model, model_input)
            msg = yield ModelCallMessage(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=model_input_str,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
            if state.yield_result:
                yield YieldResultMessage(msg)
            if state.yield_background:
                yield YieldBackgroundMessage(msg)
        case LitellmModelBlock():
            assert False  # XXX TODO
        case _:
            assert False
    return msg


def step_call_code(
    state: InterpreterState, scope: ScopeType, block: CodeBlock, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, CodeBlock]]:
    background: Messages
    code_s, _, _, block = yield from step_blocks_of(
        block,
        "code",
        IterationType.LASTOF,
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
        case _:
            message = f"Unsupported language: {block.lan}"
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


def step_call(
    state: InterpreterState, scope: ScopeType, block: CallBlock, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, CallBlock]]:
    result = None
    background: Messages = []
    args, block = process_expr_of(block, "args", scope, loc)
    closure_expr, block = process_expr_of(block, "call", scope, loc)
    try:
        closure = get_var(closure_expr, scope, append(loc, "call"))
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, location=loc, program=block),
        ) from exc
    args_loc = append(loc, "args")
    type_errors = type_check_args(args, closure.function, args_loc)
    if len(type_errors) > 0:
        raise PDLRuntimeError(
            f"Type errors during function call to {closure_expr}:\n"
            + "\n".join(type_errors),
            loc=args_loc,
            trace=block.model_copy(),
        )
    f_body = closure.returns
    f_scope = closure.scope | {"pdl_context": scope["pdl_context"]} | args
    fun_loc = LocationType(
        file=closure.location.file,
        path=closure.location.path + ["return"],
        table=loc.table,
    )
    try:
        result, background, _, f_trace = yield from step_blocks(
            IterationType.LASTOF, state, f_scope, f_body, fun_loc
        )
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
                f"Type errors in result of function call to {closure_expr}:\n"
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


def step_include(
    state: InterpreterState,
    scope: ScopeType,
    block: IncludeBlock,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, Messages, ScopeType, IncludeBlock]]:
    file = state.cwd / block.include
    try:
        prog, new_loc = parse_file(file)
        result, background, scope, trace = yield from step_blocks(
            IterationType.LASTOF, state, scope, prog.root, new_loc
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
    except PDLRuntimeStepBlocksError as exc:
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
