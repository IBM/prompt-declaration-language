import json
import re
import types
from itertools import batched
from pathlib import Path
from typing import Any, Generator, Iterable, Literal, Optional, Sequence

import requests
import yaml
from jinja2 import Environment, StrictUndefined, Template, UndefinedError
from jinja2.runtime import Undefined
from pydantic import BaseModel

from .pdl_ast import (
    AdvancedBlockType,
    ApiBlock,
    ArrayBlock,
    BamModelBlock,
    BamTextGenerationParameters,
    Block,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    DocumentBlock,
    EmptyBlock,
    ErrorBlock,
    ExpressionType,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    IterationType,
    LocationType,
    ModelBlock,
    ParserType,
    PDLException,
    PdlParser,
    Program,
    ReadBlock,
    RegexParser,
    RepeatBlock,
    RepeatUntilBlock,
    ScopeType,
    SequenceBlock,
    WatsonxModelBlock,
    empty_block_location,
)
from .pdl_ast_utils import iter_block_children, iter_blocks
from .pdl_dumper import block_to_dict, dump_yaml
from .pdl_llms import BamModel, WatsonxModel
from .pdl_location_utils import append, get_loc_string
from .pdl_parser import PDLParseError, parse_program
from .pdl_scheduler import ModelCallMessage, OutputMessage, YieldMessage, schedule
from .pdl_schema_validator import type_check_args, type_check_spec


class PDLRuntimeParserError(PDLException):
    pass


empty_scope: ScopeType = {"context": ""}


class InterpreterState(BaseModel):
    yield_output: bool = True
    log: list[str] = []
    batch: int = 0
    # batch=0: streaming
    # batch=1: call to generate with `input`

    def with_yield_output(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_output": b})


def generate(
    pdl_file: str,
    log_file: Optional[str],
    initial_scope: ScopeType,
    output_mode: Optional[Literal["json", "yaml"]],
    output_file: Optional[str],
):
    if log_file is None:
        log_file = "log.txt"
    try:
        prog, line_table = parse_program(pdl_file)
        state = InterpreterState(yield_output=True)
        loc = LocationType(path=[], file=pdl_file, table=line_table)
        _, _, _, trace = process_prog(state, initial_scope, prog, loc)
        with open(log_file, "w", encoding="utf-8") as log_fp:
            for line in state.log:
                log_fp.write(line)
        if output_mode is not None and trace is not None:
            write_trace(pdl_file, output_mode, output_file, trace)
    except PDLParseError as e:
        print("\n".join(e.msg))


def write_trace(
    pdl_file: str,
    mode: Literal["json", "yaml"],
    output_file: Optional[str],
    trace: BlockType,
):
    if output_file is None:
        output_file = str(Path(pdl_file).with_suffix("")) + f"_result.{mode}"
    with open(output_file, "w", encoding="utf-8") as fp:
        match mode:
            case "json":
                json.dump(block_to_dict(trace), fp)
            case "yaml":
                dump_yaml(block_to_dict(trace), stream=fp)


def process_prog(
    state: InterpreterState,
    initial_scope: ScopeType,
    prog: Program,
    loc=empty_block_location,
) -> tuple[Any, str, ScopeType, BlockType]:
    scope: ScopeType = empty_scope | initial_scope
    doc_generator = step_block(state, scope, block=prog.root, loc=loc)
    for result, document, scope, trace in schedule([doc_generator]):
        return result, document, scope, trace
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
    # assert document == incremental_document or not state.yield_output
    # return result, document, scope, trace


def process_progs(
    state: InterpreterState,
    initial_scopes: Iterable[ScopeType],
    prog: Program,
    loc=empty_block_location,
) -> Iterable[tuple[Any, str, ScopeType, BlockType]]:
    if state.batch > 1:
        batch_size = state.batch
    else:
        batch_size = 1
    for batch in batched(initial_scopes, batch_size):
        doc_generators = [
            step_block(state, empty_scope | initial_scope, block=prog.root, loc=loc)
            for initial_scope in batch
        ]
        for result, document, scope, trace in schedule(doc_generators):
            yield result, document, scope, trace


def step_block(
    state: InterpreterState, scope: ScopeType, block: BlockType, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, BlockType]]:
    result: Any
    output: str
    trace: BlockType
    if not isinstance(block, Block):
        result, errors = process_expr(scope, block, loc)
        if len(errors) != 0:
            trace = handle_error(block, loc, None, errors, block)
            result = block
            output = str(block)
        else:
            output = stringify(result)
            trace = output
        if state.yield_output:
            yield OutputMessage(output)
        append_log(state, "Document", output)
    else:
        result, output, scope, trace = yield from step_advanced_block(
            state, scope, block, loc
        )
    scope = scope | {"context": output}
    return result, output, scope, trace


def step_advanced_block(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, BlockType]]:
    if len(block.defs) > 0:
        scope, defs_trace = yield from step_defs(state, scope, block.defs, loc)
    else:
        defs_trace = block.defs
    state = state.with_yield_output(state.yield_output and block.show_result)
    result, output, scope, trace = yield from step_block_body(state, scope, block, loc)
    trace = trace.model_copy(update={"defs": defs_trace, "result": output})
    if block.parser is not None:
        try:
            result = parse_result(block.parser, result)
        except PDLRuntimeParserError as e:
            trace = handle_error(block, loc, e.msg, [], trace)
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: result}
    if block.show_result is False:
        output = ""
    if block.spec is not None and not isinstance(block, FunctionBlock):
        errors = type_check_spec(result, block.spec, block.location)
        if len(errors) > 0:
            trace = handle_error(
                block, loc, "Type errors during spec checking", errors, trace
            )
    return result, output, scope, trace


def step_block_body(
    state: InterpreterState,
    scope: ScopeType,
    block: AdvancedBlockType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, AdvancedBlockType]]:
    scope_init = scope
    result: Any
    output: str
    trace: AdvancedBlockType
    block.location = loc
    match block:
        case ModelBlock():
            result, output, scope, trace = yield from step_call_model(
                state, scope, block, loc
            )
        case CodeBlock():
            result, output, scope, trace = yield from step_call_code(
                state, scope, block, loc
            )
            if state.yield_output:
                yield OutputMessage(output)
        case GetBlock(get=var):
            result = get_var(var, scope)
            if result is None:
                output = ""
                trace = handle_error(
                    block,
                    append(loc, "get"),
                    f"Variable is undefined: {var}",
                    [],
                    block.model_copy(),
                )
            else:
                output = stringify(result)
                trace = block.model_copy()
            if state.yield_output:
                yield OutputMessage(output)
        case DataBlock(data=v):
            block.location = append(loc, "data")
            result, errors = process_expr(scope, v, append(loc, "data"))
            if len(errors) != 0:
                result = None
                output = ""
                trace = handle_error(
                    block, append(loc, "data"), None, errors, block.model_copy()
                )
            else:
                output = stringify(result)
                trace = block.model_copy()
            if state.yield_output:
                yield OutputMessage(output)
        case ApiBlock():
            result, output, scope, trace = yield from step_call_api(
                state, scope, block, loc
            )
            if state.yield_output:
                yield OutputMessage(output)
        case DocumentBlock():
            result, output, scope, document = yield from step_blocks(
                IterationType.DOCUMENT,
                state,
                scope,
                block.document,
                append(loc, "document"),
            )
            trace = block.model_copy(update={"document": document})
        case SequenceBlock():
            result, output, scope, sequence = yield from step_blocks(
                IterationType.SEQUENCE,
                state,
                scope,
                block.sequence,
                append(loc, "sequence"),
            )
            trace = block.model_copy(update={"sequence": sequence})
        case ArrayBlock():
            result, output, scope, array = yield from step_blocks(
                IterationType.ARRAY,
                state,
                scope,
                block.array,
                append(loc, "array"),
            )
            trace = block.model_copy(update={"array": array})
        case IfBlock():
            result = None
            output = ""
            b, errors = process_condition(scope, block.condition, append(loc, "if"))
            if len(errors) != 0:
                trace = handle_error(
                    block, append(loc, "if"), None, errors, block.model_copy()
                )
            else:
                if b:
                    thenloc = append(loc, "then")
                    result, output, scope, then_trace = yield from step_blocks(
                        IterationType.SEQUENCE, state, scope, block.then, thenloc
                    )
                    trace = block.model_copy(
                        update={
                            "if_result": b,
                            "then": then_trace,
                        }
                    )
                elif block.elses is not None:
                    elseloc = append(loc, "else")
                    result, output, scope, else_trace = yield from step_blocks(
                        IterationType.SEQUENCE, state, scope, block.elses, elseloc
                    )
                    trace = block.model_copy(
                        update={
                            "if_result": b,
                            "elses": else_trace,
                        }
                    )
                else:
                    trace = block.model_copy(update={"if_result": b})
        case RepeatBlock(num_iterations=n):
            results = []
            output = ""
            iterations_trace: list[BlocksType] = []
            context_init = scope_init["context"]
            for _ in range(n):
                repeatloc = append(loc, "repeat")
                scope = scope | {"context": context_init + output}
                (
                    iteration_result,
                    iteration_output,
                    scope,
                    body_trace,
                ) = yield from step_blocks(
                    IterationType.SEQUENCE, state, scope, block.repeat, repeatloc
                )
                results.append(iteration_result)
                output += iteration_output
                iterations_trace.append(body_trace)
                if contains_error(body_trace):
                    break
            result = combine_results(block.iteration_type, results)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ForBlock():
            results = []
            output = ""
            iter_trace: list[BlocksType] = []
            context_init = scope_init["context"]
            items: dict[str, Any] = {}
            lengths = []
            for k, v in block.fors.items():
                klist: list[Any] = []
                kloc = append(append(block.location, "for"), k)
                klist, errors = process_expr(scope, v, kloc)
                if len(errors) != 0:
                    trace = handle_error(block, kloc, None, errors, block.model_copy())
                if not isinstance(klist, list):
                    trace = handle_error(
                        block,
                        kloc,
                        "Values inside the For block must be lists",
                        [],
                        block.model_copy(),
                    )
                    klist = []
                items = items | {k: klist}
                lengths.append(len(klist))
            if len(set(lengths)) != 1:  # Not all the lists are of the same length
                result = []
                trace = handle_error(
                    block,
                    append(block.location, "for"),
                    "Lists inside the For block must be of the same length",
                    [],
                    block.model_copy(),
                )
            else:
                for i in range(lengths[0]):
                    scope = scope | {"context": context_init + output}
                    for k in items.keys():
                        scope = scope | {k: items[k][i]}
                    newloc = append(loc, "repeat")
                    (
                        iteration_result,
                        iteration_output,
                        scope,
                        body_trace,
                    ) = yield from step_blocks(
                        IterationType.SEQUENCE, state, scope, block.repeat, newloc
                    )
                    output += iteration_output
                    results.append(iteration_result)
                    iter_trace.append(body_trace)
                    if contains_error(body_trace):
                        break
                result = combine_results(block.iteration_type, results)
                trace = block.model_copy(update={"trace": iter_trace})
        case RepeatUntilBlock(until=cond):
            results = []
            stop = False
            output = ""
            iterations_trace = []
            context_init = scope_init["context"]
            while not stop:
                scope = scope | {"context": context_init + output}
                repeatloc = append(loc, "repeat")
                (
                    iteration_result,
                    iteration_output,
                    scope,
                    body_trace,
                ) = yield from step_blocks(
                    IterationType.SEQUENCE, state, scope, block.repeat, repeatloc
                )
                results.append(iteration_result)
                output += iteration_output
                iterations_trace.append(body_trace)
                if contains_error(body_trace):
                    break
                stop, errors = process_condition(scope, cond, append(loc, "until"))
                if len(errors) != 0:
                    trace = handle_error(
                        block, append(loc, "until"), None, errors, block.model_copy()
                    )
                    iterations_trace.append(trace)
                    break
            result = combine_results(block.iteration_type, results)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ReadBlock():
            output, scope, trace = process_input(state, scope, block, loc)
            if state.yield_output:
                yield OutputMessage(output)
            result = output

        case IncludeBlock():
            result, output, scope, trace = yield from step_include(
                state, scope, block, loc
            )

        case FunctionBlock():
            closure = block.model_copy()
            if block.assign is not None:
                scope = scope | {block.assign: closure}
            closure.scope = scope
            result = closure
            output = ""
            trace = closure.model_copy(update={})
        case CallBlock(call=f):
            result = None
            output = ""
            args, errors = process_expr(scope, block.args, append(loc, "args"))
            if len(errors) != 0:
                trace = handle_error(
                    block, append(loc, "args"), None, errors, block.model_copy()
                )
            closure_expr, errors = process_expr(scope, block.call, append(loc, "call"))
            if len(errors) != 0:
                trace = handle_error(
                    block, append(loc, "call"), None, errors, block.model_copy()
                )
            closure = get_var(closure_expr, scope)
            if closure is None:
                trace = handle_error(
                    block,
                    append(loc, "call"),
                    f"Function is undefined: {f}",
                    [],
                    block.model_copy(),
                )
            else:
                argsloc = append(loc, "args")
                type_errors = type_check_args(args, closure.function, argsloc)
                if len(type_errors) > 0:
                    trace = handle_error(
                        block,
                        argsloc,
                        f"Type errors during function call to {f}",
                        type_errors,
                        block.model_copy(),
                    )
                else:
                    f_body = closure.returns
                    f_scope = closure.scope | {"context": scope["context"]} | args
                    funloc = LocationType(
                        file=closure.location.file,
                        path=closure.location.path + ["return"],
                        table=loc.table,
                    )
                    result, output, _, f_trace = yield from step_blocks(
                        IterationType.SEQUENCE, state, f_scope, f_body, funloc
                    )
                    trace = block.model_copy(update={"trace": f_trace})
                    if closure.spec is not None:
                        errors = type_check_spec(result, closure.spec, funloc)
                        if len(errors) > 0:
                            trace = handle_error(
                                block,
                                loc,
                                f"Type errors in result of function call to {f}",
                                errors,
                                trace,
                            )
        case EmptyBlock():
            result = ""
            output = ""
            trace = block.model_copy()

        case _:
            assert False, f"Internal error: unsupported type ({type(block)})"
    if isinstance(trace, ErrorBlock) or children_contain_error(trace):
        if block.fallback is None:
            trace.has_error = True
        else:
            result, fallback_output, scope, fallback_trace = yield from step_blocks(
                IterationType.SEQUENCE,
                state,
                scope,
                blocks=block.fallback,
                loc=append(loc, "fallback"),
            )
            output = output + fallback_output
            trace.fallback = fallback_trace
    return result, output, scope, trace


def stringify(result):
    if isinstance(result, str):
        s = result
    elif isinstance(result, FunctionBlock):
        s = ""
    else:
        try:
            s = json.dumps(result)
        except TypeError:
            s = str(result)
    return s


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
        state = state.with_yield_output(False)
        result, _, _, blocks_trace = yield from step_blocks(
            IterationType.SEQUENCE, state, scope, blocks, newloc
        )
        scope = scope | {x: result}
        defs_trace[x] = blocks_trace
    return scope, defs_trace


def step_blocks(
    iteration_type: IterationType,
    state: InterpreterState,
    scope: ScopeType,
    blocks: BlocksType,
    loc: LocationType,
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, BlocksType]]:
    result: Any
    output: str
    trace: BlocksType
    results = []
    iteration_state = state
    # match iteration_type:
    #     case IterationType.DOCUMENT:
    #         iteration_state = state
    #     case _:
    #         iteration_state = state.with_yield_output(False)
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        output = ""
        trace = []
        context_init = scope["context"]
        for i, block in enumerate(blocks):
            scope = scope | {"context": context_init + output}
            newloc = append(loc, "[" + str(i) + "]")
            iteration_result, o, scope, t = yield from step_block(
                iteration_state, scope, block, newloc
            )
            results.append(iteration_result)
            output += o
            trace.append(t)  # type: ignore
    else:
        block_result, output, scope, trace = yield from step_block(
            iteration_state, scope, blocks, loc
        )
        results.append(block_result)
    result = combine_results(iteration_type, results)
    # match iteration_type:
    #     case IterationType.DOCUMENT:
    #         pass
    #     case _:
    #         if state.yield_output:
    #             yield OutputMessage(stringify(result))
    return result, output, scope, trace


def combine_results(iteration_type: IterationType, results: list[Any]):
    result: Any
    match iteration_type:
        case IterationType.ARRAY:
            result = results
        case IterationType.SEQUENCE:
            if len(results) > 0:
                result = results[-1]
            else:
                result = None
        case IterationType.DOCUMENT:
            result = "".join([stringify(r) for r in results])
        case _:
            assert False
    return result


def process_expr(
    scope: ScopeType, expr: Any, loc: LocationType
) -> tuple[Any, list[str]]:
    if isinstance(expr, str):
        try:
            if expr.startswith("{{") and expr.endswith("}}") and "}}" not in expr[:-2]:
                env = Environment(
                    block_start_string="{%%%%%PDL%%%%%%%%%%",
                    block_end_string="%%%%%PDL%%%%%%%%%%}",
                    undefined=StrictUndefined,
                )

                s = env.compile_expression(expr[2:-2], undefined_to_none=False)(scope)
                if isinstance(s, Undefined):
                    raise UndefinedError(str(s))
            else:
                template = Template(
                    expr,
                    keep_trailing_newline=True,
                    block_start_string="{%%%%%PDL%%%%%%%%%%",
                    block_end_string="%%%%%PDL%%%%%%%%%%}",
                    # comment_start_string="",
                    # comment_end_string="",
                    autoescape=False,
                    undefined=StrictUndefined,
                )
                s = template.render(scope)
        except UndefinedError as e:
            msg = f"{get_loc_string(loc)}{e}"
            return (None, [msg])

        return (s, [])
    if isinstance(expr, list):
        errors = []
        result = []
        for index, x in enumerate(expr):
            res, errs = process_expr(scope, x, append(loc, "[" + str(index) + "]"))
            if len(errs) != 0:
                errors += errs
            result.append(res)
        return (result, errors)  # type: ignore
    if isinstance(expr, dict):
        errors = []
        result_dict: dict[str, Any] = {}
        for k, x in expr.items():
            r, errs = process_expr(scope, x, append(loc, k))
            if len(errs) != 0:
                errors += errs
            result_dict[k] = r
        return (result_dict, errors)  # type: ignore
    return (expr, [])


def process_condition(
    scope: ScopeType, cond: ExpressionType, loc: LocationType
) -> tuple[bool, list[str]]:
    b, errors = process_expr(scope, cond, loc)
    return b, errors


def step_call_model(
    state: InterpreterState,
    scope: ScopeType,
    block: BamModelBlock | WatsonxModelBlock,
    loc: LocationType,
) -> Generator[
    YieldMessage,
    Any,
    tuple[Any, str, ScopeType, BamModelBlock | WatsonxModelBlock | ErrorBlock],
]:
    # evaluate model name
    model, errors = process_expr(scope, block.model, append(loc, "model"))
    # evaluate input
    if block.input is not None:  # If not implicit, then input must be a block
        _, model_input, _, input_trace = yield from step_blocks(
            IterationType.DOCUMENT,
            state.with_yield_output(False),
            scope,
            block.input,
            append(loc, "input"),
        )
    else:
        model_input = scope["context"]
        input_trace = None
    # evaluate model params
    match block:
        case BamModelBlock():
            if isinstance(block.parameters, BamTextGenerationParameters):
                params_expr = block.parameters.model_dump()
            else:
                params_expr = block.parameters
            params, param_errors = process_expr(scope, params_expr, loc)
            errors += param_errors
            concrete_block = block.model_copy(
                update={
                    "model": model,
                    "input": model_input,
                    "parameters": params,
                }
            )
        case WatsonxModelBlock():
            params, param_errors = process_expr(scope, block.params, loc)
            errors += param_errors
            concrete_block = block.model_copy(
                update={
                    "model": model,
                    "input": model_input,
                    "params": params,
                }
            )
        case _:
            assert False
    if len(errors) != 0:
        trace = handle_error(
            block,
            loc,
            None,
            errors,
            block.model_copy(update={"input": input_trace, "trace": concrete_block}),
        )
        return None, "", scope, trace
    # Execute model call
    try:
        append_log(state, "Model Input", model_input)
        gen = yield from generate_client_response(state, concrete_block)
        append_log(state, "Model Output", gen)
        trace = block.model_copy(
            update={"result": gen, "input": input_trace, "trace": concrete_block}
        )
        return gen, gen, scope, trace
    except Exception as e:
        trace = handle_error(
            block,
            loc,
            f"Model error: {e}",
            [],
            block.model_copy(update={"input": input_trace, "trace": concrete_block}),
        )
        return None, "", scope, trace


def generate_client_response(  # pylint: disable=too-many-arguments
    state: InterpreterState,
    block: BamModelBlock | WatsonxModelBlock,
) -> Generator[YieldMessage, Any, str]:
    match state.batch:
        case 0:
            output = yield from generate_client_response_streaming(state, block)
        case 1:
            output = yield from generate_client_response_single(state, block)
        case _:
            output = yield from generate_client_response_batching(state, block)
    return output


def generate_client_response_streaming(
    state: InterpreterState,
    block: BamModelBlock | WatsonxModelBlock,
) -> Generator[YieldMessage, Any, str]:
    text_stream: Generator[str, Any, None]
    match block:
        case BamModelBlock():
            assert isinstance(block.input, str)
            text_stream = BamModel.generate_text_stream(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=block.input,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
        case WatsonxModelBlock():
            assert isinstance(block.input, str)
            text_stream = WatsonxModel.generate_text_stream(
                model_id=block.model,
                prompt=block.input,
                params=block.params,
                guardrails=block.guardrails,
                guardrails_hap_params=block.guardrails_hap_params,
            )
        case _:
            assert False
    text = ""
    for chunk in text_stream:
        if state.yield_output:
            yield OutputMessage(chunk)
        text += chunk
    return text


def generate_client_response_single(
    state: InterpreterState,
    block: BamModelBlock | WatsonxModelBlock,
) -> Generator[YieldMessage, Any, str]:
    text: str
    match block:
        case BamModelBlock():
            assert isinstance(block.input, str)
            text = BamModel.generate_text(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=block.input,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
        case WatsonxModelBlock():
            assert isinstance(block.input, str)
            text = WatsonxModel.generate_text(
                model_id=block.model,
                prompt=block.input,
                params=block.params,
                guardrails=block.guardrails,
                guardrails_hap_params=block.guardrails_hap_params,
            )
    if state.yield_output:
        yield OutputMessage(text)
    return text


def generate_client_response_batching(  # pylint: disable=too-many-arguments
    state: InterpreterState,
    block: BamModelBlock | WatsonxModelBlock,
) -> Generator[YieldMessage, Any, str]:
    match block:
        case BamModelBlock():
            assert isinstance(block.input, str)
            text = yield ModelCallMessage(
                model_id=block.model,
                prompt_id=block.prompt_id,
                model_input=block.input,
                parameters=block.parameters,
                moderations=block.moderations,
                data=block.data,
            )
            if state.yield_output:
                yield OutputMessage(text)
        case WatsonxModelBlock():
            assert False  # XXX TODO
        case _:
            assert False
    return text


def step_call_api(
    state: InterpreterState, scope: ScopeType, block: ApiBlock, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, ApiBlock | ErrorBlock]]:
    _, input_str, _, input_trace = yield from step_blocks(
        IterationType.DOCUMENT,
        state.with_yield_output(False),
        scope,
        block.input,
        append(loc, "input"),
    )
    input_str = block.url + input_str
    try:
        append_log(state, "API Input", input_str)
        response = requests.get(input_str)
        result = response.json()
        output = stringify(result)
        append_log(state, "API Output", output)
        trace = block.model_copy(update={"input": input_trace})
    except Exception as e:
        trace = handle_error(
            block,
            loc,
            f"API error: {e}",
            [],
            block.model_copy(update={"input": input_trace}),
        )
        result = None
        output = ""
    return result, output, scope, trace


def step_call_code(
    state: InterpreterState, scope: ScopeType, block: CodeBlock, loc: LocationType
) -> Generator[YieldMessage, Any, tuple[Any, str, ScopeType, CodeBlock | ErrorBlock]]:
    _, code_s, _, code_trace = yield from step_blocks(
        IterationType.DOCUMENT,
        state.with_yield_output(False),
        scope,
        block.code,
        append(loc, "code"),
    )
    append_log(state, "Code Input", code_s)
    try:
        match block.lan:
            case "python":
                result = call_python(code_s, scope)
                output = str(result)
            case _:
                trace = handle_error(
                    block,
                    append(loc, "lan"),
                    f"Unsupported language: {block.lan}",
                    [],
                    block.model_copy(),
                )
                result = None
                output = ""
                return result, output, scope, trace
    except Exception as e:
        trace = handle_error(
            block,
            loc,
            f"Code error: {e}",
            [],
            block.model_copy(update={"code": code_s}),
        )
        result = None
        output = ""

    append_log(state, "Code Output", result)
    trace = block.model_copy(update={"result": result, "code": code_trace})
    return result, output, scope, trace


__PDL_SESSION = types.SimpleNamespace()


def call_python(code: str, scope: dict) -> Any:
    my_namespace = types.SimpleNamespace(PDL_SESSION=__PDL_SESSION, **scope)
    exec(code, my_namespace.__dict__)
    result = my_namespace.result
    return result


def process_input(
    state: InterpreterState, scope: ScopeType, block: ReadBlock, loc: LocationType
) -> tuple[str, ScopeType, ReadBlock | ErrorBlock]:
    read, errors = process_expr(scope, block.read, append(loc, "read"))
    if len(errors) != 0:
        trace = handle_error(block, loc, None, errors, block.model_copy())
        return "", scope, trace
    if read is not None:
        with open(read, encoding="utf-8") as f:
            s = f.read()
            append_log(state, "Input from File: " + read, s)
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
    return s, scope, trace


def step_include(
    state: InterpreterState,
    scope: ScopeType,
    block: IncludeBlock,
    loc: LocationType,
) -> Generator[
    YieldMessage, Any, tuple[Any, str, ScopeType, IncludeBlock | ErrorBlock]
]:
    try:
        prog, line_table = parse_program(block.include)
        newloc = LocationType(file=block.include, path=[], table=line_table)
        result, output, scope, trace = yield from step_block(
            state, scope, prog.root, newloc
        )
        include_trace = block.model_copy(update={"trace": trace})
        return result, output, scope, include_trace
    except PDLParseError as e:
        trace = handle_error(
            block,
            append(loc, "include"),
            f"Attempting to include invalid yaml: {block.include}",
            e.msg,
            block.model_copy(),
        )
        return None, "", scope, trace


def parse_result(parser: ParserType, text: str) -> Optional[dict[str, Any] | list[Any]]:
    result: Optional[dict[str, Any] | list[Any]]
    match parser:
        case "json":
            try:
                result = json.loads(text)
            except Exception as exc:
                raise PDLRuntimeParserError(
                    "Attempted to parse ill-formed JSON"
                ) from exc
        case "yaml":
            try:
                result = yaml.safe_load(text)
            except Exception as exc:
                raise PDLRuntimeParserError(
                    "Attempted to parse ill-formed YAML"
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
            m = matcher(regex, text, flags=re.M)
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


def get_var(var: str, scope: ScopeType) -> Any:
    try:
        segs = var.split(".")
        res = scope[segs[0]]

        for v in segs[1:]:
            res = res[v]
    except Exception:
        return None
    return res


def append_log(state: InterpreterState, title, somestring):
    state.log.append("**********  " + title + "  **********\n")
    state.log.append(str(somestring) + "\n")


def handle_error(
    block: BlockType,
    loc: LocationType,
    top_message: Optional[str],
    errors: list[str],
    subtrace: BlocksType,
) -> ErrorBlock:
    msg = ""
    if top_message is not None:
        msg += f"{get_loc_string(loc)}{top_message}\n"
    msg += "\n".join(errors)
    print("\n" + msg)
    return ErrorBlock(msg=msg, program=subtrace)


def _raise_on_error(block: BlockType):
    if not isinstance(block, Block) or block.fallback is not None:
        return
    if isinstance(block, ErrorBlock):
        raise StopIteration
    iter_block_children(_raise_on_error, block)


def children_contain_error(block: AdvancedBlockType) -> bool:
    try:
        iter_block_children(_raise_on_error, block)
        return False
    except StopIteration:
        return True


def contains_error(blocks: BlocksType) -> bool:
    try:
        iter_blocks(_raise_on_error, blocks)
        return False
    except StopIteration:
        return True
