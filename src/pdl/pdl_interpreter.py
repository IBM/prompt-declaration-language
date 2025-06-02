# pylint: disable=import-outside-toplevel
import json
import re
import shlex
import subprocess  # nosec
import sys
import time
import traceback
import types

# TODO: temporarily disabling warnings to mute a pydantic warning from liteLLM
import warnings
from os import getenv

warnings.filterwarnings("ignore", "Valid config keys have changed in V2")

# from itertools import batched
from pathlib import Path  # noqa: E402
from typing import Any, Generator, Optional, Sequence, TypeVar  # noqa: E402

import httpx  # noqa: E402
import json_repair  # noqa: E402
import yaml  # noqa: E402
from jinja2 import (  # noqa: E402
    Environment,
    StrictUndefined,
    Template,
    TemplateSyntaxError,
    UndefinedError,
    meta,
)
from jinja2.nodes import TemplateData  # noqa: E402
from jinja2.runtime import Undefined  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from .pdl_ast import (  # noqa: E402
    AdvancedBlockType,
    AnyPattern,
    ArgsBlock,
    ArrayBlock,
    ArrayPattern,
    Block,
    BlockKind,
    BlockType,
    CallBlock,
    CodeBlock,
    ContributeTarget,
    ContributeValue,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ExpressionType,
    FunctionBlock,
    GetBlock,
    GraniteioModelBlock,
    IfBlock,
    ImportBlock,
    IncludeBlock,
    IterationType,
    LastOfBlock,
    LazyMessage,
    LazyMessages,
    LitellmModelBlock,
    LitellmParameters,
    LocalizedExpression,
    MatchBlock,
    MessageBlock,
    ModelBlock,
    ModelInput,
    ObjectBlock,
    ObjectPattern,
    ObjPdlType,
    OrPattern,
    ParserType,
    Pattern,
    PatternType,
    PdlLocationType,
    PdlParser,
    PDLRuntimeError,
    PDLRuntimeExpressionError,
    PDLRuntimeParserError,
    PDLRuntimeProcessBlocksError,
    PdlTiming,
    PdlUsage,
    Program,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RoleType,
    ScopeType,
    TextBlock,
    empty_block_location,
)
from .pdl_dumper import as_json, block_to_dict  # noqa: E402
from .pdl_lazy import PdlConst, PdlDict, PdlLazy, PdlList, lazy_apply  # noqa: E402
from .pdl_llms import LitellmModel  # noqa: E402
from .pdl_location_utils import append, get_loc_string  # noqa: E402
from .pdl_parser import PDLParseError, parse_file, parse_str  # noqa: E402
from .pdl_scheduler import yield_background, yield_result  # noqa: E402
from .pdl_schema_validator import type_check_args, type_check_spec  # noqa: E402
from .pdl_utils import (  # noqa: E402
    GeneratorWrapper,
    apply_defaults,
    get_contribute_value,
    lazy_messages_concat,
    replace_contribute_value,
    stringify,
    value_of_expr,
)

empty_scope: ScopeType = PdlDict({"pdl_context": PdlList([])})


class InterpreterState(BaseModel):
    yield_result: bool = False
    yield_background: bool = False
    batch: int = 1
    # batch=0: streaming
    # batch=1: call to generate with `input`
    role: RoleType = "user"
    cwd: Path = Path.cwd()
    # background_tasks = {}
    id_stack: list[str] = []

    def with_yield_result(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_result": b})

    def with_yield_background(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_background": b})

    def with_role(self: "InterpreterState", role: RoleType) -> "InterpreterState":
        return self.model_copy(update={"role": role})

    def with_id(self: "InterpreterState", n: str) -> "InterpreterState":
        stack = self.id_stack.copy() if self.id_stack is not None else []
        stack.append(n)
        return self.model_copy(update={"id_stack": stack})

    def with_iter(self: "InterpreterState", i: int) -> "InterpreterState":
        return self.with_id(str(i))

    def with_pop(self: "InterpreterState") -> "InterpreterState":
        stack = self.id_stack.copy() if self.id_stack is not None else []
        stack.pop()
        return self.model_copy(update={"id_stack": stack})


def generate(
    pdl_file: str | Path,
    state: Optional[InterpreterState],
    initial_scope: ScopeType,
    trace_file: Optional[str | Path],
) -> int:
    """Execute the PDL program defined in `pdl_file`.

    Args:
        pdl_file: Program to execute.
        initial_scope: Environment defining the variables in scope to execute the program.
        state: Initial state of the interpreter.
        trace_file: Indicate if the execution trace must be produced and the file to save it.

    Returns:
        Returns the exit code: `0` for success, `1` for failure
    """
    try:
        prog, loc = parse_file(pdl_file)
        if state is None:
            state = InterpreterState(cwd=Path(pdl_file).parent)
        future_result, _, _, trace = process_prog(state, initial_scope, prog, loc)
        result = future_result.result()
        if not state.yield_background and not state.yield_result:
            print(stringify(result))
        else:
            print()
        if trace_file:
            write_trace(trace_file, trace)
    except PDLParseError as exc:
        print("\n".join(exc.message), file=sys.stderr)
        return 1
    except PDLRuntimeError as exc:
        if exc.loc is None:
            message = exc.message
        else:
            message = get_loc_string(exc.loc) + exc.message
        print(message, file=sys.stderr)
        if trace_file and exc.pdl__trace is not None:
            write_trace(trace_file, exc.pdl__trace)
        return 1
    return 0


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
        d: Any = block_to_dict(trace, json_compatible=True)
        d = as_json(d)
        with open(trace_file, "w", encoding="utf-8") as fp:
            json.dump(d, fp)
    except Exception as e:
        print(f"Failure generating the trace: {str(e)}", file=sys.stderr)


def process_prog(
    state: InterpreterState,
    scope: ScopeType,
    prog: Program,
    loc: PdlLocationType = empty_block_location,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockType]:
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
    state: InterpreterState, scope: ScopeType, block: BlockType, loc: PdlLocationType
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockType]:
    result: PdlLazy[Any]
    background: LazyMessages
    trace: BlockType
    try:
        if not isinstance(block, Block):
            start = time.time_ns()
            try:
                v, expr = process_expr(scope, block, loc)
            except PDLRuntimeExpressionError as exc:
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or loc,
                    trace=ErrorBlock(msg=exc.message, pdl__location=loc, program=block),
                ) from exc
            result = PdlConst(v)
            background = PdlList(
                [
                    PdlDict(  # type: ignore
                        {
                            "role": state.role,
                            "content": result,
                            "defsite": ".".join(
                                state.id_stack
                            ),  # Warning: defsite for a literal value
                        }
                    )
                ]
            )
            trace = DataBlock(
                data=expr,
                pdl__result=result,
                pdl__timing=PdlTiming(start_nanos=start, end_nanos=time.time_ns()),
                pdl__id=".".join(state.id_stack),
            )
            if state.yield_background:
                yield_background(background)
            if state.yield_result:
                yield_result(result.result(), BlockKind.DATA)
        else:
            result, background, scope, trace = process_advanced_block_timed(
                state, scope, block, loc
            )
    except EOFError as exc:
        raise PDLRuntimeError(
            "EOF",
            loc=loc,
            trace=ErrorBlock(msg="EOF", pdl__location=loc, program=block),
        ) from exc
    except KeyboardInterrupt as exc:
        raise PDLRuntimeError(
            "Keyboard Interrupt",
            loc=loc,
            trace=ErrorBlock(
                msg="Keyboard Interrupt", pdl__location=loc, program=block
            ),
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
    loc: PdlLocationType,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockType]:
    state = state.with_id(str(block.kind))
    if state.id_stack is not None:
        block.pdl__id = ".".join(state.id_stack)
    block.pdl__timing = PdlTiming()
    block.pdl__timing.start_nanos = time.time_ns()
    result, background, scope, trace = process_advanced_block(state, scope, block, loc)
    block.pdl__timing.end_nanos = time.time_ns()
    match trace:
        case ModelBlock():
            trace = trace.model_copy(
                update={
                    "context": lazy_apply(lambda s: s["pdl_context"], scope),
                }
            )
    return result, background, scope, trace


def id_with_set_first_use_nanos(timing):
    def identity(result):
        if timing.first_use_nanos is None:
            timing.first_use_nanos = time.time_ns()
        return result

    return identity


def process_advanced_block(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: PdlLocationType,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockType]:
    if block.role is not None:
        state = state.with_role(block.role)
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(state, scope, block.defs, loc)
        block = block.model_copy(update={"defs": defs_trace})
    init_state = state
    state = state.with_yield_result(
        state.yield_result
        and ContributeTarget.RESULT in block.contribute
        and block.parser is None
    )
    state = state.with_yield_background(
        state.yield_background and context_in_contribute(block)
    )
    try:
        result, background, new_scope, trace = process_block_body(
            state, scope, block, loc
        )
        result = lazy_apply(id_with_set_first_use_nanos(block.pdl__timing), result)
        background = lazy_apply(
            id_with_set_first_use_nanos(block.pdl__timing), background
        )
        trace = trace.model_copy(update={"pdl__result": result})
        if block.parser is not None:
            parser = block.parser
            result = lazy_apply(lambda r: parse_result(parser, r), result)
            if init_state.yield_result and ContributeTarget.RESULT:
                yield_result(result, block.kind)
        if block.spec is not None and not isinstance(block, FunctionBlock):
            result = lazy_apply(
                lambda r: result_with_type_checking(
                    r, block.spec, "Type errors during spec checking:", loc, trace
                ),
                result,
            )
        if block.fallback is not None:
            result.result()
    except Exception as exc:
        if block.fallback is None:
            raise exc from exc
        (
            result,
            background,
            new_scope,
            trace,
        ) = process_block_of(
            block,
            "fallback",
            state,
            scope,
            loc=loc,
        )
        if block.spec is not None and not isinstance(block, FunctionBlock):
            loc = append(loc, "fallback")
            result = lazy_apply(
                lambda r: result_with_type_checking(
                    r, block.spec, "Type errors during spec checking:", loc, trace
                ),
                result,
            )
    if block.def_ is not None:
        var = block.def_
        new_scope = new_scope | PdlDict({var: result})
    if ContributeTarget.RESULT not in block.contribute:
        result = PdlConst("")
    if ContributeTarget.CONTEXT not in block.contribute:
        background = PdlList([])
    contribute_value, trace = process_contribute(trace, new_scope, loc)
    if contribute_value is not None:
        background = contribute_value

    return result, background, new_scope, trace


ResultWithTypeCheckingT = TypeVar("ResultWithTypeCheckingT")


def result_with_type_checking(
    result: ResultWithTypeCheckingT,
    spec,
    msg: str,
    loc: PdlLocationType,
    trace: BlockType,
) -> ResultWithTypeCheckingT:
    errors = type_check_spec(result, spec, loc)
    if len(errors) > 0:
        message = msg + "\n" + "\n".join(errors)
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, program=trace),
            fallback=result,
        )
    return result


def process_block_body(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: PdlLocationType,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, AdvancedBlockType]:
    scope_init = scope
    result: Any
    background: LazyMessages
    trace: AdvancedBlockType
    block.pdl__location = loc
    match block:
        case ModelBlock():
            result, background, scope, trace = process_call_model(
                state, scope, block, loc
            )
        case ArgsBlock() | CodeBlock():
            result, background, scope, trace = process_call_code(
                state, scope, block, loc
            )
            if state.yield_result:
                yield_result(result.result(), block.kind)
            if state.yield_background:
                yield_background(background)
        case GetBlock(get=var):
            block.pdl__location = append(loc, "get")
            try:
                result = PdlConst(get_var(var, scope, block.pdl__location))
            except PDLRuntimeExpressionError as exc:
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or loc,
                    trace=ErrorBlock(msg=exc.message, pdl__location=loc, program=block),
                ) from exc
            background = PdlList(
                [PdlDict({"role": state.role, "content": result})]  # type: ignore
            )
            trace = block.model_copy()
            if state.yield_result:
                yield_result(result.result(), block.kind)
            if state.yield_background:
                yield_background(background)
        case DataBlock(data=v):
            block.pdl__location = append(loc, "data")
            if block.raw:
                result = PdlConst(v)
                trace = block.model_copy()
            else:
                v, trace = process_expr_of(block, "data", scope, loc)
                result = PdlConst(v)
            background = PdlList(
                [PdlDict({"role": state.role, "content": result})]  # type: ignore
            )
            if state.yield_result:
                yield_result(result.result(), block.kind)
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
                background = PdlList([])
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
                        background = lazy_messages_concat(background, value_background)
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
                result = PdlDict(dict(zip(block.object.keys(), values)))
                object_trace = dict(zip(block.object.keys(), values_trace))
                trace = block.model_copy(update={"object": object_trace})
            else:
                result, background, scope, trace = process_blocks_of(
                    block,
                    "object",
                    IterationType.OBJECT,
                    iteration_state,
                    scope,
                    loc,
                )
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result, block.kind)
        case MessageBlock():
            content, _, scope, trace = process_block_of(
                block,
                "content",
                state,
                scope,
                loc,
            )
            message = {
                "role": state.role,
                "content": content,
                "defsite": block.pdl__id,
            }
            if block.name is not None:
                name, block = process_expr_of(block, "name", scope, loc)
                message["name"] = name
            if block.tool_call_id is not None:
                tool_call_id, block = process_expr_of(block, "tool_call_id", scope, loc)
                message["tool_call_id"] = tool_call_id
            result = PdlDict(message)
            background = PdlList([result])
        case IfBlock():
            b, if_trace = process_condition_of(block, "condition", scope, loc, "if")
            if b:
                state = state.with_iter(0)
                result, background, scope, trace = process_block_of(
                    block, "then", state, scope, loc
                )
                state = state.with_pop()
            elif block.else_ is not None:
                state = state.with_iter(0)
                result, background, scope, trace = process_block_of(
                    block, "else_", state, scope, loc, "else"
                )
                state = state.with_pop()
            else:
                result = PdlConst("")
                background = PdlList([])
                trace = block
            trace = trace.model_copy(
                update={
                    "condition": if_trace,
                    "if_result": b,
                }
            )
        case MatchBlock():
            match_v, block = process_expr_of(block, "match_", scope, loc, "match")
            cases = []
            matched = False
            result = PdlConst("")
            background = PdlList([])
            for i, match_case in enumerate(block.with_):
                if matched:
                    cases.append(match_case)
                    continue
                loc_i = append(loc, "[" + str(i) + "]")
                if "case" in match_case.model_fields_set:
                    new_scope = is_matching(match_v, match_case.case, scope)
                    if new_scope is None:
                        match_case = match_case.model_copy(
                            update={"pdl__case_result": False, "pdl__matched": False}
                        )
                        cases.append(match_case)
                        continue
                    match_case = match_case.model_copy(
                        update={"pdl__case_result": True}
                    )
                else:
                    new_scope = scope
                b = True
                if "if_" in match_case.model_fields_set and match_case.if_ is not None:
                    loc_if = append(loc_i, "if")
                    try:
                        b, if_trace = process_expr(new_scope, match_case.if_, loc_if)
                        match_case = match_case.model_copy(update={"if_": if_trace})
                    except PDLRuntimeExpressionError as exc:
                        cases.append(match_case)
                        block.with_ = cases
                        raise PDLRuntimeError(
                            exc.message,
                            loc=exc.loc or loc_if,
                            trace=ErrorBlock(
                                msg=exc.message, pdl__location=loc, program=block
                            ),
                        ) from exc
                if not b:
                    match_case.pdl__if_result = False
                    match_case.pdl__matched = False
                    cases.append(match_case)
                    continue
                match_case.pdl__if_result = True
                match_case.pdl__matched = True
                matched = True
                try:
                    result, background, scope, then_trace = process_block(
                        state,
                        new_scope,
                        match_case.then,
                        append(loc_i, "then"),
                    )
                except PDLRuntimeError as exc:
                    match_case_trace = match_case.model_copy(
                        update={"then": exc.pdl__trace}
                    )
                    cases.append(match_case_trace)
                    block.with_ = cases
                    raise PDLRuntimeError(
                        exc.message,
                        loc=exc.loc or loc,
                        trace=block,
                    ) from exc
                match_case_trace = match_case.model_copy(update={"then": then_trace})
                cases.append(match_case_trace)
            block.with_ = cases
            trace = block
        case RepeatBlock():
            results: list[PdlLazy[Any]] = []
            background = PdlList([])
            iter_trace: list[BlockType] = []
            pdl_context_init = scope_init.data["pdl_context"]
            if block.for_ is None:
                items = None
                lengths = None
            else:
                items, block = process_expr_of(block, "for_", scope, loc, "for")
                lengths = []
                for idx, lst in items.items():
                    if not isinstance(lst, list):
                        msg = "Values inside the For block must be lists."
                        lst_loc = append(
                            append(block.pdl__location or empty_block_location, "for"),
                            idx,
                        )
                        raise PDLRuntimeError(
                            message=msg,
                            loc=lst_loc,
                            trace=ErrorBlock(
                                msg=msg, pdl__location=lst_loc, program=block
                            ),
                            fallback=[],
                        )
                    lengths.append(len(lst))
                if len(set(lengths)) != 1:  # Not all the lists are of the same length
                    msg = "Lists inside the For block must be of the same length."
                    for_loc = append(block.pdl__location or empty_block_location, "for")
                    raise PDLRuntimeError(
                        msg,
                        loc=for_loc,
                        trace=ErrorBlock(msg=msg, pdl__location=for_loc, program=block),
                        fallback=[],
                    )
            iteration_state = state.with_yield_result(
                state.yield_result and block.join.as_ == IterationType.TEXT
            )
            if block.max_iterations is None:
                max_iterations = None
            else:
                max_iterations, block = process_expr_of(
                    block, "max_iterations", scope, loc
                )
            repeat_loc = append(loc, "repeat")
            iidx = 0
            try:
                first = True
                while True:
                    if max_iterations is not None and iidx >= max_iterations:
                        break
                    if lengths is not None and iidx >= lengths[0]:
                        break
                    stay, _ = process_condition_of(block, "while_", scope, loc, "while")
                    if not stay:
                        break
                    iteration_state = iteration_state.with_iter(iidx)
                    if first:
                        first = False
                    elif block.join.as_ == IterationType.TEXT:
                        join_string = block.join.with_
                        results.append(PdlConst(join_string))
                        if iteration_state.yield_result:
                            yield_result(join_string, block.kind)
                        if iteration_state.yield_background:
                            yield_background(
                                [
                                    {
                                        "role": block.role,
                                        "content": join_string,
                                        "defsite": block.pdl__id,
                                    }
                                ]
                            )
                    scope = scope | {
                        "pdl_context": lazy_messages_concat(
                            pdl_context_init, background
                        )
                    }
                    if items is not None:
                        for k in items.keys():
                            scope = scope | {k: items[k][iidx]}
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
                    background = lazy_messages_concat(background, iteration_background)
                    results.append(iteration_result)
                    iter_trace.append(body_trace)
                    iteration_state = iteration_state.with_pop()
                    iidx = iidx + 1
                    stop, _ = process_condition_of(block, "until", scope, loc)
                    if stop:
                        break
            except PDLRuntimeError as exc:
                iter_trace.append(exc.pdl__trace)
                trace = block.model_copy(update={"pdl__trace": iter_trace})
                raise PDLRuntimeError(
                    exc.message,
                    loc=exc.loc or repeat_loc,
                    trace=trace,
                ) from exc
            result = combine_results(block.join.as_, results)
            if state.yield_result and not iteration_state.yield_result:
                yield_result(result.result(), block.kind)
            trace = block.model_copy(update={"pdl__trace": iter_trace})
        case ReadBlock():
            result, background, scope, trace = process_input(state, scope, block, loc)
            if state.yield_result:
                yield_result(result.result(), block.kind)
            if state.yield_background:
                yield_background(background)

        case IncludeBlock():
            result, background, scope, trace = process_include(state, scope, block, loc)

        case ImportBlock():
            result, background, scope, trace = process_import(state, scope, block, loc)

        case FunctionBlock():
            closure = block.model_copy()
            if block.def_ is not None:
                scope = scope | {block.def_: closure}
            closure.pdl__scope = scope
            result = PdlConst(closure)
            background = PdlList([])
            trace = closure.model_copy(update={})
        case CallBlock():
            result, background, scope, trace = process_call(state, scope, block, loc)
        case EmptyBlock():
            result = PdlConst("")
            background = PdlList([])
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
    if isinstance(pattern, Pattern) and pattern.def_ is not None:
        new_scope = new_scope | {pattern.def_: value}
    return new_scope


def process_defs(
    state: InterpreterState,
    scope: ScopeType,
    defs: dict[str, BlockType],
    loc: PdlLocationType,
) -> tuple[ScopeType, dict[str, BlockType]]:
    defs_trace: dict[str, BlockType] = {}
    defloc = append(loc, "defs")
    idx = 0
    for x, block in defs.items():
        newloc = append(defloc, x)
        state = state.with_iter(idx)
        state = state.with_yield_result(False)
        state = state.with_yield_background(False)
        result, _, _, block_trace = process_block(state, scope, block, newloc)
        scope = scope | PdlDict({x: result})
        defs_trace[x] = block_trace
        idx = idx + 1
        state = state.with_pop()
    return scope, defs_trace


BlockTypeTVarProcessBlockOf = TypeVar(
    "BlockTypeTVarProcessBlockOf", bound=AdvancedBlockType
)


def process_block_of(  # pylint: disable=too-many-arguments, too-many-positional-arguments
    block: BlockTypeTVarProcessBlockOf,
    field: str,
    state: InterpreterState,
    scope: ScopeType,
    loc: PdlLocationType,
    field_alias: Optional[str] = None,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockTypeTVarProcessBlockOf]:
    try:
        result, background, scope, child_trace = process_block(
            state,
            scope,
            getattr(block, field),
            append(loc, field_alias or field),
        )
    except PDLRuntimeError as exc:
        trace = block.model_copy(update={field: exc.pdl__trace})
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
    loc: PdlLocationType,
    field_alias: Optional[str] = None,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockTypeTVarProcessBlocksOf]:
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
    loc: PdlLocationType,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, BlockType | list[BlockType]]:
    result: Any
    background: LazyMessages
    trace: BlockType | list[BlockType]
    results = []
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        # Is a list of blocks
        iteration_state = state.with_yield_result(
            state.yield_result
            and (iteration_type in (IterationType.LASTOF, IterationType.TEXT))
        )
        new_loc = None
        background = PdlList([])
        trace = []
        pdl_context_init: LazyMessages = scope.data["pdl_context"]
        try:
            for i, block in enumerate(blocks):
                iteration_state = iteration_state.with_iter(i)
                scope = scope | {
                    "pdl_context": lazy_messages_concat(pdl_context_init, background)
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
                background = lazy_messages_concat(background, iteration_background)
                trace.append(t)  # type: ignore
                iteration_state = iteration_state.with_pop()
        except PDLRuntimeError as exc:
            trace.append(exc.pdl__trace)  # type: ignore
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


def combine_results(iteration_type: IterationType, results: list[PdlLazy[Any]]):
    result: Any
    match iteration_type:
        case IterationType.ARRAY:
            result = PdlList(results)
        case IterationType.OBJECT:
            result = PdlDict({})
            for d in results:
                result = result | d
        case IterationType.LASTOF:
            if len(results) > 0:
                result = results[-1]
            else:
                result = None
        case IterationType.TEXT:
            result = lazy_apply(
                (lambda _: "".join([stringify(r.result()) for r in results])),
                PdlConst(()),
            )
        case _:
            assert False
    return result


BlockTypeTVarProcessContribute = TypeVar(
    "BlockTypeTVarProcessContribute", bound=AdvancedBlockType
)


def process_contribute(
    block: BlockTypeTVarProcessContribute, scope: ScopeType, loc: PdlLocationType
) -> tuple[Any, BlockTypeTVarProcessContribute]:
    result: list[ContributeTarget | dict[str, ContributeValue]]
    value_trace: LocalizedExpression[
        list[ContributeTarget | dict[str, ContributeValue]]
    ]
    value = get_contribute_value(block.contribute)
    if value is None:
        return None, block
    loc = append(loc, "contribute")
    try:
        result, value_trace = process_expr(scope, value, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, pdl__location=loc, program=block),
        ) from exc
    replace = replace_contribute_value(
        block.contribute, ContributeValue(value=value_trace)
    )
    trace = block.model_copy(update={"contribute": replace})
    return result, trace


BlockTypeTVarProcessExprOf = TypeVar(
    "BlockTypeTVarProcessExprOf", bound=AdvancedBlockType
)


def process_expr_of(
    block: BlockTypeTVarProcessExprOf,
    field: str,
    scope: ScopeType,
    loc: PdlLocationType,
    field_alias: Optional[str] = None,
) -> tuple[Any, BlockTypeTVarProcessExprOf]:
    result: Any
    expr_trace: LocalizedExpression[Any]
    expr = getattr(block, field)
    loc = append(loc, field_alias or field)
    try:
        result, expr_trace = process_expr(scope, expr, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, pdl__location=loc, program=block),
        ) from exc
    trace = block.model_copy(update={field: expr_trace})
    return result, trace


def process_condition_of(
    block: AdvancedBlockType,
    field: str,
    scope: ScopeType,
    loc: PdlLocationType,
    field_alias: Optional[str] = None,
) -> tuple[bool, LocalizedExpression[bool]]:
    result: bool
    expr_trace: LocalizedExpression[bool]
    expr = getattr(block, field)
    loc = append(loc, field_alias or field)
    try:
        result, expr_trace = process_expr(scope, expr, loc)
    except PDLRuntimeExpressionError as exc:
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=ErrorBlock(msg=exc.message, pdl__location=loc, program=block),
        ) from exc
    return result, expr_trace


EXPR_START_STRING = "${"
EXPR_END_STRING = "}"

ProcessExprT = TypeVar("ProcessExprT")


def process_expr(  # pylint: disable=too-many-return-statements
    scope: ScopeType, expr: ExpressionType[ProcessExprT], loc: PdlLocationType
) -> tuple[ProcessExprT, LocalizedExpression[ProcessExprT]]:
    result: ProcessExprT
    if isinstance(expr, LocalizedExpression):
        result = _process_expr(scope, expr.pdl__expr, loc)
        trace = expr.model_copy(update={"pdl__result": result})
    else:
        result = _process_expr(scope, expr, loc)
        trace = LocalizedExpression(
            pdl__expr=expr, pdl__result=result, pdl__location=loc
        )
    return (result, trace)


_ProcessExprT = TypeVar("_ProcessExprT")


def _process_expr(  # pylint: disable=too-many-return-statements
    scope: ScopeType, expr: ExpressionType[_ProcessExprT], loc: PdlLocationType
) -> _ProcessExprT:
    result: _ProcessExprT
    if isinstance(expr, LocalizedExpression):
        return _process_expr(scope, expr.pdl__expr, loc)
    if isinstance(expr, str):
        try:
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
                # `expr` is either a single jinja expression or a string without expression
                if expr.startswith(EXPR_START_STRING) and expr.endswith(
                    EXPR_END_STRING
                ):
                    # `expr` has the shape `${ ... }`: it is a single jinja expression
                    free_vars = meta.find_undeclared_variables(expr_ast)
                    result = env.compile_expression(  # pyright: ignore
                        expr[2:-1], undefined_to_none=False
                    )({x: scope[x] for x in free_vars if x in scope})
                    if isinstance(result, Undefined):
                        raise UndefinedError(str(result))
                    return result
                if isinstance(expr_ast_nodes[0], TemplateData):
                    # `expr` is a string that do not include jinja expression
                    return expr  # type: ignore
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
            free_vars = meta.find_undeclared_variables(expr_ast)
            result = template.render(
                {x: scope[x] for x in free_vars if x in scope}
            )  # pyright: ignore
            return result
        except PDLRuntimeError as exc:
            raise exc from exc
        except TemplateSyntaxError as exc:
            raise PDLRuntimeExpressionError(
                f"Syntax error in {expr}: {exc}", loc
            ) from exc
        except Exception as exc:
            raise PDLRuntimeExpressionError(
                f"Error during the evaluation of {expr}: {exc}", loc
            ) from exc

    if isinstance(expr, list):
        result_list: list[Any] = []
        for index, x in enumerate(expr):
            res: Any = _process_expr(scope, x, append(loc, "[" + str(index) + "]"))
            result_list.append(res)
        return result_list  # type: ignore
    if isinstance(expr, dict):
        result_dict: dict[str, Any] = {}
        for k, v in expr.items():
            k_loc = append(loc, k)
            k_res: str = _process_expr(scope, k, k_loc)
            v_res: Any = _process_expr(scope, v, k_loc)
            result_dict[k_res] = v_res
        return result_dict  # type: ignore
    return expr


BlockTypeTVarProcessCallModel = TypeVar(
    "BlockTypeTVarProcessCallModel", bound=ModelBlock
)


def process_call_model(
    state: InterpreterState,
    scope: ScopeType,
    block: BlockTypeTVarProcessCallModel,
    loc: PdlLocationType,
) -> tuple[
    Any,
    LazyMessages,
    ScopeType,
    BlockTypeTVarProcessCallModel,
]:
    # evaluate model name
    model_id, concrete_block = process_expr_of(
        block, "model", scope, loc  # pyright: ignore
    )  # pyright: ignore
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

        case GraniteioModelBlock():
            _, concrete_block = process_expr_of(concrete_block, "backend", scope, loc)
            if concrete_block.processor is not None:
                _, concrete_block = process_expr_of(
                    concrete_block, "processor", scope, loc
                )
            if concrete_block.parameters is not None:
                _, concrete_block = process_expr_of(
                    concrete_block, "parameters", scope, loc
                )
        case _:
            assert False
    # evaluate input
    model_input: ModelInput
    model_input_future, _, _, concrete_block = process_block_of(
        concrete_block,
        "input",
        state.with_yield_result(False).with_yield_background(False),
        scope,
        loc,
    )
    model_input_result = model_input_future.result()
    if isinstance(model_input_result, str):
        model_input = [{"role": state.role, "content": model_input_result}]
    else:
        model_input = model_input_result
    concrete_block = concrete_block.model_copy(
        update={
            "pdl__model_input": model_input,
        }
    )

    model_input = [{"role": m["role"], "content": m["content"]} for m in model_input]
    # Execute model call
    try:
        litellm_params = {}

        def get_transformed_inputs(kwargs):
            params_to_model = kwargs["additional_args"]["complete_input_dict"]
            nonlocal litellm_params
            litellm_params = params_to_model

        import litellm

        litellm.input_callback = [get_transformed_inputs]

        # If the environment has a configured OpenTelemetry exporter, tell LiteLLM
        # to do OpenTelemetry callbacks for that exporter.  Note that this may
        # require optional OpenTelemetry Python libraries that are not pyproject.toml,
        # typically opentelemetry-api, opentelemetry-sdk,
        # opentelemetry-exporter-otlp-proto-http, and opentelemetry-exporter-otlp-proto-grpc
        if getenv("OTEL_EXPORTER") and getenv("OTEL_ENDPOINT"):
            litellm.callbacks = ["otel"]

        msg, raw_result = generate_client_response(
            state, scope, concrete_block, str(model_id), model_input
        )
        background: LazyMessages = PdlList([lazy_apply(lambda msg: msg | {"defsite": block.pdl__id}, msg)])  # type: ignore
        result = lazy_apply(
            lambda msg: "" if msg["content"] is None else msg["content"], msg
        )
        if block.modelResponse is not None:
            scope = scope | {block.modelResponse: raw_result}
        trace: BlockTypeTVarProcessCallModel = concrete_block.model_copy(
            update={"pdl__result": result}
        )  # pyright: ignore
        return result, background, scope, trace
    except httpx.RequestError as exc:
        message = f"model '{model_id}' encountered {repr(exc)} trying to {exc.request.method} against {exc.request.url}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, pdl__location=loc, program=concrete_block),
        ) from exc
    except Exception as exc:
        message = f"Error during '{model_id}' model call: {repr(exc)}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, pdl__location=loc, program=concrete_block),
        ) from exc


def generate_client_response(
    state: InterpreterState,
    scope: ScopeType,
    block: LitellmModelBlock | GraniteioModelBlock,
    model_id: str,
    model_input: ModelInput,
) -> tuple[LazyMessage, PdlLazy[Any]]:
    match state.batch:
        case 0:
            model_output, raw_result = generate_client_response_streaming(
                state, scope, block, model_id, model_input
            )
        case 1:
            model_output, raw_result = generate_client_response_single(
                state, scope, block, model_id, model_input
            )
        case _:
            assert False
    return model_output, raw_result


def generate_client_response_streaming(
    state: InterpreterState,
    scope: ScopeType,
    block: LitellmModelBlock | GraniteioModelBlock,
    model_id: str,
    model_input: ModelInput,
) -> tuple[LazyMessage, PdlLazy[Any]]:
    msg_stream: Generator[dict[str, Any], Any, Any]
    match block:
        case LitellmModelBlock():
            if block.parameters is None:
                parameters = None
            else:
                parameters = value_of_expr(block.parameters)  # pyright: ignore
            assert parameters is None or isinstance(
                parameters, dict
            )  # block is a "concrete block"
            # Apply PDL defaults to model invocation

            parameters = apply_defaults(
                model_id,
                parameters or {},
                scope.get("pdl_model_default_parameters", []),
            )
            msg_stream = LitellmModel.generate_text_stream(
                model_id=value_of_expr(block.model),
                messages=model_input,
                spec=block.spec,
                parameters=litellm_parameters_to_dict(parameters),
            )
        case GraniteioModelBlock():
            # TODO: curently fallback to the non-streaming interface
            return generate_client_response_single(
                state, scope, block, model_id, model_input
            )
        case _:
            assert False
    complete_msg: Optional[dict[str, Any]] = None
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
        complete_msg = {"role": state.role, "content": ""}
    if len(wrapped_gen.value) > 0:
        last = wrapped_gen.value[-1]
        if last["usage"] is not None:
            usage = last["usage"]
            if (
                usage["completion_tokens"] is not None
                and usage["prompt_tokens"] is not None
            ):
                block.pdl__usage = PdlUsage(
                    completion_tokens=usage["completion_tokens"],
                    prompt_tokens=usage["prompt_tokens"],
                )
    return PdlConst(complete_msg), PdlConst(raw_result)


def litellm_parameters_to_dict(
    parameters: Optional[LitellmParameters | dict[str, Any]],
) -> dict[str, Any]:
    if isinstance(parameters, dict):
        return {k: v for k, v in parameters.items() if k != "stream"}
    if parameters is None:
        parameters = LitellmParameters()
    parameters_dict = parameters.model_dump(exclude={"stream"})
    return parameters_dict


def generate_client_response_single(
    state: InterpreterState,
    scope: ScopeType,
    block: LitellmModelBlock | GraniteioModelBlock,
    model_id: str,
    model_input: ModelInput,
) -> tuple[LazyMessage, PdlLazy[Any]]:
    if block.parameters is None:
        parameters = None
    else:
        parameters = value_of_expr(block.parameters)  # pyright:ignore
    assert parameters is None or isinstance(
        parameters, dict
    )  # block is a "concrete block"
    parameters = apply_defaults(
        model_id,
        parameters or {},
        scope.get("pdl_model_default_parameters", []),
    )
    block.pdl__usage = PdlUsage()
    match block:
        case LitellmModelBlock():
            message, response = LitellmModel.generate_text(
                block=block,
                model_id=value_of_expr(block.model),
                messages=model_input,
                parameters=litellm_parameters_to_dict(parameters),
            )
        case GraniteioModelBlock():
            from .pdl_granite_io import GraniteioModel

            message, response = GraniteioModel.generate_text(
                block=block,
                messages=model_input,
            )
        case _:
            assert False
    if state.yield_result:
        msg = message.result()
        yield_result("" if msg["content"] is None else msg["content"], block.kind)
    if state.yield_background:
        msg = message.result()
        yield_background([msg])
    return (message, response)


def process_call_code(
    state: InterpreterState,
    scope: ScopeType,
    block: ArgsBlock | CodeBlock,
    loc: PdlLocationType,
) -> tuple[PdlLazy[Any], LazyMessages, ScopeType, ArgsBlock | CodeBlock]:
    background: LazyMessages
    code_a: None | list[str] = None
    code_s = ""
    match block:
        case ArgsBlock():
            code_a = []
            args_trace: list[LocalizedExpression[str]] = []
            for expr_i in block.args:
                arg_i: str
                trace_i: LocalizedExpression[str]
                arg_i, trace_i = process_expr(scope, expr_i, loc)
                code_a.append(arg_i)
                args_trace.append(trace_i)
            block = block.model_copy(update={"args": args_trace})
        case CodeBlock():
            code_, _, _, block = process_block_of(
                block,
                "code",
                state.with_yield_result(False).with_yield_background(False),
                scope,
                loc,
            )
            code_s = code_.result()

    match block.lang:
        case "python":
            try:
                result = call_python(code_s, scope, state)
                background = PdlList(
                    [PdlDict({"role": state.role, "content": lazy_apply(str, result), "defsite": block.pdl__id})]  # type: ignore
                )
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Python Code error: {traceback.format_exc()}",
                    loc=loc,
                    trace=block.model_copy(
                        update={"code": code_s, "defsite": block.pdl__id}
                    ),
                ) from exc
        case "command":
            try:
                result = call_command(code_s, code_a)
                background = PdlList(
                    [
                        PdlDict(  # type: ignore
                            {
                                "role": state.role,
                                "content": result,
                                "defsite": block.pdl__id,
                            }
                        )
                    ]
                )
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Shell Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case "jinja":
            try:
                result = call_jinja(code_s, scope)
                background = PdlList(
                    [
                        PdlDict(  # type: ignore
                            {
                                "role": state.role,
                                "content": result,
                                "defsite": block.pdl__id,
                            }
                        )
                    ]
                )
            except Exception as exc:
                raise PDLRuntimeError(
                    f"Jinja Code error: {repr(exc)}",
                    loc=loc,
                    trace=block.model_copy(update={"code": code_s}),
                ) from exc
        case "pdl":
            try:
                result = call_pdl(code_s, scope)
                background = PdlList(
                    [PdlDict({"role": state.role, "content": result, "defsite": block.pdl__id})]  # type: ignore
                )
            except Exception as exc:
                raise PDLRuntimeError(
                    f"PDL Code error: {repr(exc)}",
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
    trace = block.model_copy(update={"pdl__result": result})
    return result, background, scope, trace


__PDL_SESSION = types.SimpleNamespace()


def call_python(code: str, scope: ScopeType, state: InterpreterState) -> PdlLazy[Any]:
    my_namespace = types.SimpleNamespace(PDL_SESSION=__PDL_SESSION, **scope)
    sys.path.append(str(state.cwd))
    exec(code, my_namespace.__dict__)  # nosec B102
    # [B102:exec_used] Use of exec detected.
    # This is the code that the user asked to execute. It can be executed in a docker container with the option `--sandbox`
    result = my_namespace.result
    sys.path.pop()
    return PdlConst(result)


def call_command(code: str, code_a: list[str] | None) -> PdlLazy[str]:
    if code_a is not None:
        args = code_a
    else:
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
    return PdlConst(output)


def call_jinja(code: str, scope: ScopeType) -> PdlLazy[Any]:
    template = Template(
        code,
    )
    result = template.render(scope)
    return PdlConst(result)


def call_pdl(code: str, scope: ScopeType) -> PdlLazy[Any]:
    program, loc = parse_str(code)
    state = InterpreterState()
    result, _, _, _ = process_prog(state, scope, program, loc)
    return result


def process_call(
    state: InterpreterState, scope: ScopeType, block: CallBlock, loc: PdlLocationType
) -> tuple[Any, LazyMessages, ScopeType, CallBlock]:
    result = None
    background: LazyMessages = PdlList([])
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
    if "pdl_context" in args:
        args["pdl_context"] = PdlList(args["pdl_context"])
    f_body = closure.returns
    f_scope = (
        (closure.pdl__scope or PdlDict({}))
        | PdlDict({"pdl_context": scope.data["pdl_context"]})
        | PdlDict((args or {}))
    )
    if closure.pdl__location is not None:
        fun_loc = PdlLocationType(
            file=closure.pdl__location.file,
            path=closure.pdl__location.path + ["return"],
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
            trace=block.model_copy(update={"pdl__trace": exc.pdl__trace}),
        ) from exc
    trace = block.model_copy(update={"pdl__trace": f_trace})
    if closure.spec is not None:
        result = lazy_apply(
            lambda r: result_with_type_checking(
                r,
                closure.spec,
                f"Type errors in result of function call to {block.call}:",
                loc,
                trace,
            ),
            result,
        )
    return result, background, scope, trace


def process_input(
    state: InterpreterState, scope: ScopeType, block: ReadBlock, loc: PdlLocationType
) -> tuple[PdlLazy[str], LazyMessages, ScopeType, ReadBlock]:
    read, block = process_expr_of(block, "read", scope, loc)
    if read is not None:
        file = state.cwd / read
        try:
            with open(file, encoding="utf-8") as f:
                s = f.read()
        except Exception as exc:
            if isinstance(exc, FileNotFoundError):
                msg = f"file {str(file)} not found"
            else:
                msg = f"Fail to open file {str(file)}"
            raise PDLRuntimeError(
                message=msg,
                loc=loc,
                trace=ErrorBlock(msg=msg, pdl__location=loc, program=block),
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
    trace = block.model_copy(update={"pdl__result": s})
    background: LazyMessages = PdlList(
        [PdlDict({"role": state.role, "content": s, "defsite": block.pdl__id})]  # type: ignore
    )
    return PdlConst(s), background, scope, trace


def process_include(
    state: InterpreterState,
    scope: ScopeType,
    block: IncludeBlock,
    loc: PdlLocationType,
) -> tuple[Any, LazyMessages, ScopeType, IncludeBlock]:
    file = state.cwd / block.include
    try:
        prog, new_loc = parse_file(file)
        result, background, scope, trace = process_block(
            state, scope, prog.root, new_loc
        )
        include_trace = block.model_copy(update={"pdl__trace": trace})
        return result, background, scope, include_trace
    except PDLParseError as exc:
        message = f"Attempting to include invalid yaml: {str(file)}\n{exc.message}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, program=block.model_copy()),
        ) from exc
    except PDLRuntimeProcessBlocksError as exc:
        trace = block.model_copy(update={"pdl__trace": exc.blocks})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc


def process_import(
    state: InterpreterState,
    scope: ScopeType,
    block: ImportBlock,
    loc: PdlLocationType,
) -> tuple[Any, LazyMessages, ScopeType, ImportBlock]:
    path = block.import_
    if not path.endswith(".pdl"):
        path += ".pdl"
    file = state.cwd / path
    try:
        prog, new_loc = parse_file(file)
        _, _, new_scope, trace = process_block(
            state.with_yield_background(False).with_yield_result(False),
            empty_scope,
            prog.root,
            new_loc,
        )
        import_trace = block.model_copy(update={"pdl__trace": trace})
        return new_scope, PdlConst([]), scope, import_trace
    except PDLParseError as exc:
        message = f"Attempting to import invalid yaml: {str(file)}\n{exc.message}"
        raise PDLRuntimeError(
            message,
            loc=loc,
            trace=ErrorBlock(msg=message, program=block.model_copy()),
        ) from exc
    except PDLRuntimeProcessBlocksError as exc:
        trace = block.model_copy(update={"pdl__trace": exc.blocks})
        raise PDLRuntimeError(
            exc.message,
            loc=exc.loc or loc,
            trace=trace,
        ) from exc


JSONReturnType = dict[str, Any] | list[Any] | str | float | int | bool | None


def parse_result(parser: ParserType, text: str) -> JSONReturnType:
    result: JSONReturnType
    match parser:
        case "json":
            try:
                result = json_repair.loads(text)  # type: ignore[reportAssignmentType]
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
            match parser.spec:
                case ObjPdlType(obj=dict() as spec) | (dict() as spec):
                    current_group_name = ""
                    try:
                        result = {}
                        for x in spec.keys():
                            current_group_name = x
                            result[x] = m.group(x)
                        return result
                    except IndexError as exc:
                        msg = f"No group named {current_group_name} found by {regex} in {text}"
                        raise PDLRuntimeParserError(msg) from exc
                case _:
                    result = list(m.groups())
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


def get_var(var: str, scope: ScopeType, loc: PdlLocationType) -> Any:
    v, _ = process_expr(scope, f"{EXPR_START_STRING} {var} {EXPR_END_STRING}", loc)
    return v
