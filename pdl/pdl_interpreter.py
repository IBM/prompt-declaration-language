import json
import os
import re
import shlex
import subprocess
import types
from ast import literal_eval
from pathlib import Path
from typing import Any, Generator, Generic, Literal, Optional, Sequence, TypeVar

import requests
import yaml
from dotenv import load_dotenv
from genai.client import Client
from genai.credentials import Credentials
from genai.schema import DecodingMethod
from jinja2 import StrictUndefined, Template, UndefinedError
from pydantic import ValidationError

from .pdl_ast import (
    AdvancedBlockType,
    ApiBlock,
    BlockLocation,
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
    ModelBlock,
    Parser,
    PDLTextGenerationParameters,
    Program,
    ReadBlock,
    RepeatBlock,
    RepeatUntilBlock,
    ScopeType,
    empty_block_location,
)
from .pdl_ast_utils import iter_block_children, iter_blocks
from .pdl_dumper import block_to_dict, dump_yaml
from .pdl_location_utils import append, get_line_map, get_loc_string
from .pdl_schema_error_analyzer import analyze_errors
from .pdl_schema_validator import type_check_args, type_check_spec

DEBUG = False

MAX_NEW_TOKENS = 1024
MIN_NEW_TOKENS = 1
REPETITION_PENATLY = 1.05
TEMPERATURE_SAMPLING = 0.7
TOP_P_SAMPLING = 0.85
TOP_K_SAMPLING = 50

load_dotenv()
GENAI_KEY = os.getenv("GENAI_KEY")
GENAI_API = os.getenv("GENAI_API")


empty_scope: ScopeType = {"context": ""}
empty_text_generation_parameters = PDLTextGenerationParameters(
    beam_width=None,
    max_new_tokens=None,
    min_new_tokens=None,
    random_seed=None,
    repetition_penalty=None,
    stop_sequences=None,
    temperature=None,
    time_limit=None,
    top_k=None,
    top_p=None,
    truncate_input_tokens=None,
    typical_p=None,
)


def generate(
    pdl: str,
    logging: Optional[str],
    mode: Literal["json", "yaml"],
    output_file: Optional[str],
    scope_file: Optional[str],
    scope_data: Optional[str],
):  # pylint: disable=too-many-arguments
    scope: ScopeType = empty_scope
    document = ""
    if logging is None:
        logging = "log.txt"

    if scope_file is not None:
        with open(scope_file, "r", encoding="utf-8") as scopefile:
            initial_scope = yaml.safe_load(scopefile)
            scope = scope | initial_scope

    if scope_data is not None:
        initial_scope = yaml.safe_load(scope_data)
        scope = scope | initial_scope

    with open(pdl, "r", encoding="utf-8") as tablefile:
        line_table = get_line_map(tablefile)
        with open(pdl, "r", encoding="utf-8") as infile:
            with open(logging, "w", encoding="utf-8") as logfile:
                log: list[str] = []
                prog_yaml = yaml.safe_load(infile)
                trace = None
                loc = BlockLocation(path=[], file=pdl, table=line_table)
                try:
                    prog = Program.model_validate(prog_yaml)
                    trace = prog.root
                    doc_generator = GeneratorWrapper(
                        step_block(
                            log, scope, yield_output=True, block=prog.root, loc=loc
                        )
                    )
                    incremental_document = ""
                    for output in doc_generator:
                        print(output, end="")
                        assert output is not None
                        incremental_document += output
                    print()
                    _, document, scope, trace = doc_generator.value
                    assert document == incremental_document
                except ValidationError:
                    msg = "Invalid YAML"
                    print(msg)
                    with open("pdl-schema.json", "r", encoding="utf-8") as schemafile:
                        schema = json.load(schemafile)
                        defs = schema["$defs"]
                        errors = analyze_errors(defs, defs["Program"], prog_yaml, loc)
                        # if len(errors) == 0:
                        #    errors = [msg]
                        for item in errors:
                            print(item)
                finally:
                    for line in log:
                        logfile.write(line)
                    if trace is not None:
                        if mode == "json":
                            if output_file is None:
                                output_file = (
                                    str(Path(pdl).with_suffix("")) + "_result.json"
                                )
                            with open(output_file, "w", encoding="utf-8") as fp:
                                json.dump(block_to_dict(trace), fp)
                        if mode == "yaml":
                            if output_file is None:
                                output_file = (
                                    str(Path(pdl).with_suffix("")) + "_result.yaml"
                                )
                            with open(output_file, "w", encoding="utf-8") as fp:
                                dump_yaml(block_to_dict(trace), stream=fp)


GeneratorWrapperYieldT = TypeVar("GeneratorWrapperYieldT")
GeneratorWrapperSendT = TypeVar("GeneratorWrapperSendT")
GeneratorWrapperReturnT = TypeVar("GeneratorWrapperReturnT")


class GeneratorWrapper(
    Generic[GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT]
):
    value: GeneratorWrapperReturnT

    def __init__(
        self,
        gen: Generator[
            GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT
        ],
    ):
        self.gen = gen

    def __iter__(self):
        self.value = yield from self.gen


GeneratorReturnT = TypeVar("GeneratorReturnT")


def step_to_completion(gen: Generator[Any, Any, GeneratorReturnT]) -> GeneratorReturnT:
    w = GeneratorWrapper(gen)
    for _ in w:
        pass
    return w.value


def process_block(
    log, scope: ScopeType, block: BlockType, loc=empty_block_location
) -> tuple[Any, str, ScopeType, BlockType]:
    return step_to_completion(
        step_block(log, scope, yield_output=False, block=block, loc=loc)
    )


def step_block(
    log, scope: ScopeType, yield_output: bool, block: BlockType, loc: BlockLocation
) -> Generator[str, Any, tuple[Any, str, ScopeType, BlockType]]:
    if isinstance(block, str):
        try:
            result = process_expr(scope, block)
            output = stringify(result)
            trace = output
        except UndefinedError as e:
            msg = f"{e} in {block}"
            error(msg, loc)
            result = block
            output = block
            trace = ErrorBlock(msg=msg, program=block)
        if yield_output:
            yield output
        append_log(log, "Document", output)
        return result, output, scope, trace
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(log, scope, block.defs, loc)
    else:
        defs_trace = block.defs
    yield_output &= block.show_result
    result, output, scope, trace = yield from step_block_body(
        log, scope, yield_output, block, loc
    )
    trace = trace.model_copy(update={"defs": defs_trace, "result": output})
    match block.parser:
        case None:
            pass
        case "json":
            try:
                result = json.loads(result)
            except Exception:
                msg = "Attempted to parse ill-formed YAML"
                error(msg, loc)
                trace = ErrorBlock(msg=msg, program=trace)
                return result, output, scope, trace
        case "yaml":
            try:
                result = yaml.safe_load(result)
            except Exception:
                msg = "Attempted to parse ill-formed YAML"
                error(msg, loc)
                trace = ErrorBlock(msg=msg, program=trace)
                return result, output, scope, trace
        case Parser():
            result = process_parse(block.parser, result, loc)
        case _:
            assert False
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: result}
        debug("Storing model result for " + var + ": " + str(trace.result))
    if block.show_result is False:
        output = ""
    if block.spec is not None and not isinstance(block, FunctionBlock):
        errors = type_check_spec(result, block.spec, block.location)
        if len(errors) > 0:
            msg = "Type errors during spec checking"
            for err in errors:
                msg += "\n" + err
            error(msg, block.location)
            trace = ErrorBlock(msg=msg, program=trace)
            return result, output, scope, trace
    scope = scope | {"context": output}
    return result, output, scope, trace


def step_block_body(
    log,
    scope: ScopeType,
    yield_output: bool,
    block: AdvancedBlockType,
    loc: BlockLocation,
) -> Generator[str, Any, tuple[Any, str, ScopeType, AdvancedBlockType]]:
    scope_init = scope
    result: Any
    output: str
    trace: AdvancedBlockType
    block.location = loc
    match block:
        case ModelBlock():
            result, output, scope, trace = yield from step_call_model(
                log, scope, yield_output, block, loc
            )
        case CodeBlock():
            result, output, scope, trace = call_code(log, scope, block, loc)
            if yield_output:
                yield output
        case GetBlock(get=var):
            result = get_var(var, scope)
            if result is None:
                msg = "Variable is undefined: " + var
                error(msg, append(loc, "get"))
                output = ""
                trace = ErrorBlock(msg=msg, program=block.model_copy())
            else:
                output = stringify(result)
                trace = block.model_copy()
            if yield_output:
                yield output
        case DataBlock(data=v):
            block.location = append(loc, "data")
            try:
                result = process_expr(scope, v)
                output = stringify(result)
                trace = block.model_copy()
            except UndefinedError as e:
                msg = f"{e} in {v}"
                error(msg, block.location)
                result = None
                output = ""
                trace = ErrorBlock(msg=msg, program=block.model_copy())
            if yield_output:
                yield output
        case ApiBlock():
            result, output, scope, trace = call_api(log, scope, block, loc)
            if yield_output:
                yield output
        case DocumentBlock():
            _, output, scope, document = yield from step_blocks(
                log, scope, yield_output, block.document, append(loc, "document")
            )
            result = output
            trace = block.model_copy(update={"document": document})
        case IfBlock():
            result = None
            output = ""
            b = None
            try:
                b = process_condition(scope, block.condition)
                if b:
                    thenloc = append(loc, "then")
                    result, output, scope, then_trace = yield from step_blocks(
                        log, scope, yield_output, block.then, thenloc
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
                        log, scope, yield_output, block.elses, elseloc
                    )
                    trace = block.model_copy(
                        update={
                            "if_result": b,
                            "elses": else_trace,
                        }
                    )
                else:
                    trace = block.model_copy(update={"if_result": b})
            except UndefinedError as e:
                msg = f"{e} in {block.condition}"
                error(msg, append(block.location, "if"))
                trace = ErrorBlock(msg=msg, program=block.model_copy())
        case RepeatBlock(num_iterations=n):
            result = None
            output = ""
            iterations_trace: list[BlocksType] = []
            context_init = scope_init["context"]
            for _ in range(n):
                repeatloc = append(loc, "repeat")
                scope = scope | {"context": context_init + output}
                result, iteration_output, scope, body_trace = yield from step_blocks(
                    log, scope, yield_output, block.repeat, repeatloc
                )
                output += iteration_output
                iterations_trace.append(body_trace)
                if contains_error(body_trace):
                    break
            trace = block.model_copy(update={"trace": iterations_trace})
        case ForBlock():
            result = []
            output = ""
            iter_trace: list[BlocksType] = []
            context_init = scope_init["context"]
            items: dict[str, Any] = {}
            lengths = []
            try:
                for k, v in block.fors.items():
                    klist = process_expr(scope, v)
                    items = items | {k: klist}
                    lengths.append(len(klist))
                if len(set(lengths)) != 1:  # Not all the lists are of the same length
                    msg = "Lists inside the For block must be of the same length"
                    error(msg, loc)
                    output = ""
                    trace = ErrorBlock(msg=msg, program=block.model_copy())
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
                            log, scope, yield_output, block.repeat, newloc
                        )
                        output += iteration_output
                        result.append(iteration_result)
                        iter_trace.append(body_trace)
                        if contains_error(body_trace):
                            break
                    trace = block.model_copy(update={"trace": iter_trace})
            except UndefinedError as e:
                msg = f"{e}"
                error(msg, append(block.location, "for"))
                trace = ErrorBlock(msg=msg, program=block.model_copy())

        case RepeatUntilBlock(until=cond):
            result = None
            stop = False
            output = ""
            iterations_trace = []
            context_init = scope_init["context"]
            while not stop:
                scope = scope | {"context": context_init + output}
                repeatloc = append(loc, "repeat")
                result, iteration_output, scope, body_trace = yield from step_blocks(
                    log, scope, yield_output, block.repeat, repeatloc
                )
                output += iteration_output
                iterations_trace.append(body_trace)
                if contains_error(body_trace):
                    break
                try:
                    stop = process_condition(scope, cond)
                except UndefinedError as e:
                    msg = f"{e} in {cond}"
                    error(msg, append(loc, "until"))
                    trace = ErrorBlock(msg=msg, program=block.model_copy())
                    iterations_trace.append(trace)
                    break
            trace = block.model_copy(update={"trace": iterations_trace})
        case ReadBlock():
            output, scope, trace = process_input(log, scope, block, loc)
            if yield_output:
                yield output
            result = output

        case IncludeBlock():
            result, output, scope, trace = yield from step_include(
                log, scope, yield_output, block, loc
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
            args = {}
            try:  # pylint: disable=too-many-nested-blocks
                args = process_expr(scope, block.args)
                closure = get_var(f, scope)
                if closure is None:
                    msg = "Function is undefined: " + f
                    error(msg, append(loc, "call"))
                    output = ""
                    result = None
                    trace = ErrorBlock(msg=msg, program=block.model_copy())
                else:
                    argsloc = append(loc, "args")
                    type_errors = type_check_args(args, closure.function, argsloc)
                    if len(type_errors) > 0:
                        msg = "Type errors during function call to " + f
                        for err in type_errors:
                            msg += "\n" + err
                        error(msg, argsloc)
                        output = ""
                        result = None
                        trace = ErrorBlock(msg=msg, program=block.model_copy())
                    else:
                        f_body = closure.returns
                        f_scope = closure.scope | {"context": scope["context"]} | args
                        funloc = BlockLocation(
                            file=closure.location.file,
                            path=closure.location.path + ["return"],
                            table=loc.table,
                        )
                        result, output, _, f_trace = yield from step_blocks(
                            log, f_scope, yield_output, f_body, funloc
                        )
                        trace = block.model_copy(update={"trace": f_trace})
                        if closure.spec is not None:
                            errors = type_check_spec(result, closure.spec, funloc)
                            if len(errors) > 0:
                                msg = "Type errors in result of function call to " + f
                                for err in errors:
                                    msg += "\n" + err
                                error(msg, loc)
                                trace = ErrorBlock(msg=msg, program=trace)
            except UndefinedError as e:
                msg = f"{e}"
                error(msg, append(loc, "args"))
                result = None
                output = ""
                trace = ErrorBlock(msg=msg, program=block.model_copy())
        case EmptyBlock():
            result = ""
            output = ""
            trace = block.model_copy()

        case _:
            assert False, f"Internal error: unsupported type ({type(block)})"
    return result, output, scope, trace


def stringify(result):
    return result if isinstance(result, str) else json.dumps(result)


def process_defs(
    log, scope: ScopeType, defs: dict[str, BlocksType], loc: BlockLocation
) -> tuple[ScopeType, dict[str, BlocksType]]:
    defs_trace: dict[str, BlocksType] = {}
    defloc = append(loc, "defs")
    for x, blocks in defs.items():
        newloc = append(defloc, x)
        result, _, _, blocks_trace = process_blocks(log, scope, blocks, newloc)
        scope = scope | {x: result}
        defs_trace[x] = blocks_trace
    return scope, defs_trace


def process_blocks(
    log, scope: ScopeType, blocks: BlocksType, loc: BlockLocation
) -> tuple[Any, str, ScopeType, BlocksType]:
    return step_to_completion(
        step_blocks(log, scope, yield_output=False, blocks=blocks, loc=loc)
    )


def step_blocks(
    log, scope: ScopeType, yield_output: bool, blocks: BlocksType, loc: BlockLocation
) -> Generator[str, Any, tuple[Any, str, ScopeType, BlocksType]]:
    result: Any
    output: str
    trace: BlocksType
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        result = None
        output = ""
        trace = []
        context_init = scope["context"]
        for i, block in enumerate(blocks):
            scope = scope | {"context": context_init + output}
            newloc = append(loc, "[" + str(i) + "]")
            result, o, scope, t = yield from step_block(
                log, scope, yield_output, block, newloc
            )
            output += o
            trace.append(t)  # type: ignore
    else:
        result, output, scope, trace = yield from step_block(
            log, scope, yield_output, blocks, loc
        )
    return result, output, scope, trace


def process_expr(scope: ScopeType, e: Any) -> Any:
    if isinstance(e, str):
        template = Template(
            e,
            keep_trailing_newline=True,
            block_start_string="{%%%%%PDL%%%%%%%%%%",
            block_end_string="%%%%%PDL%%%%%%%%%%}",
            # comment_start_string="",
            # comment_end_string="",
            autoescape=False,
            undefined=StrictUndefined,
        )
        s = template.render(scope)
        if e.startswith("{{") and e.endswith("}}"):
            try:
                return literal_eval(s)
            except Exception:
                pass
        return s
    if isinstance(e, list):
        return [process_expr(scope, x) for x in e]  # type: ignore
    if isinstance(e, dict):
        return {k: process_expr(scope, x) for k, x in e.items()}  # type: ignore
    return e


def process_condition(scope: ScopeType, cond: ExpressionType) -> bool:
    b = process_expr(scope, cond)
    return b


def _get_bam_client() -> Optional[Client]:
    credentials = Credentials.from_env()
    client = Client(credentials=credentials)
    return client


def step_call_model(
    log, scope: ScopeType, yield_output: bool, block: ModelBlock, loc: BlockLocation
) -> Generator[str, Any, tuple[Any, str, ScopeType, ModelBlock | ErrorBlock]]:
    if block.input is not None:  # If not implicit, then input must be a block
        _, model_input, _, input_trace = process_blocks(
            log, scope, block.input, append(loc, "input")
        )
    else:
        model_input = scope["context"]
        input_trace = None
    model = ""
    try:
        model = process_expr(scope, block.model)
    except UndefinedError as e:
        msg = f"{e} in {block.model}"
        error(msg, append(loc, "model"))
        trace = ErrorBlock(
            msg=msg, program=block.model_copy(update={"input": input_trace})
        )
        return None, "", scope, trace
    try:
        debug("model input: " + model_input)
        append_log(log, "Model Input", model_input)
        client = _get_bam_client()
        if client is None:
            msg = "Fail to get a BAM client"
            error(msg, append(loc, "model"))
            trace = ErrorBlock(
                msg=msg, program=block.model_copy(update={"input": input_trace})
            )
            return None, "", scope, trace
        params = block.parameters
        params = set_default_model_params(params)
        append_log(log, "Model Params", params)
        gen = yield from generate_client_response(
            log, client, block, model, model_input, params, yield_output
        )
        debug("model output: " + gen)
        append_log(log, "Model Output", gen)
        trace = block.model_copy(update={"result": gen, "input": input_trace})
        return gen, gen, scope, trace
    except Exception as e:
        msg = f"Model error: {e}"
        error(msg, loc)
        trace = ErrorBlock(
            msg=msg, program=block.model_copy(update={"input": input_trace})
        )
        return None, "", scope, trace


def set_default_model_params(
    params: Optional[PDLTextGenerationParameters],
) -> PDLTextGenerationParameters:
    if params is None:
        params = empty_text_generation_parameters
    if params.decoding_method is None:
        params.decoding_method = DecodingMethod.GREEDY
    if params.max_new_tokens is None:
        params.max_new_tokens = MAX_NEW_TOKENS
    if params.min_new_tokens is None:
        params.min_new_tokens = MIN_NEW_TOKENS
    if params.repetition_penalty is None:
        params.repetition_penalty = REPETITION_PENATLY
    if params.decoding_method == DecodingMethod.SAMPLE:
        if params.temperature is None:
            params.temperature = TEMPERATURE_SAMPLING
        if params.top_k is None:
            params.top_k = TOP_K_SAMPLING
        if params.top_p is None:
            params.top_p = TOP_P_SAMPLING
    return params


def generate_client_response(  # pylint: disable=too-many-arguments
    log,
    client: Client,
    block: ModelBlock,
    model: str,
    model_input: str,
    params: Optional[PDLTextGenerationParameters],
    yield_output: bool,
) -> Generator[str, Any, str]:
    gen = ""
    for response in client.text.generation.create_stream(
        model_id=model,
        prompt_id=block.prompt_id,
        input=model_input,
        parameters=params.__dict__,
        moderations=block.moderations,
        data=block.data,
    ):
        if not response.results:
            if response.moderation is not None:
                append_log(
                    log,
                    "Hate speech",
                    f"Generate from: {model_input}",
                )
            continue
        for result in response.results:
            if result.generated_text:
                if yield_output:
                    yield result.generated_text
                gen += result.generated_text
    return gen


def call_api(
    log, scope: ScopeType, block: ApiBlock, loc: BlockLocation
) -> tuple[Any, str, ScopeType, ApiBlock | ErrorBlock]:
    _, input_str, _, input_trace = process_blocks(
        log, scope, block.input, append(loc, "input")
    )
    input_str = block.url + input_str
    try:
        append_log(log, "API Input", input_str)
        response = requests.get(input_str)
        result = response.json()
        output = stringify(result)
        debug(output)
        append_log(log, "API Output", output)
        trace = block.model_copy(update={"input": input_trace})
    except Exception as e:
        msg = f"API error: {e}"
        error(msg, loc)
        result = None
        output = ""
        trace = ErrorBlock(
            msg=msg, program=block.model_copy(update={"input": input_trace})
        )
    return result, output, scope, trace


def call_code(
    log, scope: ScopeType, block: CodeBlock, loc: BlockLocation
) -> tuple[Any, str, ScopeType, CodeBlock | ErrorBlock]:
    _, code_s, _, code_trace = process_blocks(
        log, scope, block.code, append(loc, "code")
    )
    append_log(log, "Code Input", code_s)
    debug("code string: " + code_s)
    match block.lan:
        case "python":
            result = call_python(code_s)
            output = str(result)
        case "command":
            result, output = call_command(code_s)
        case _:
            msg = f"Unsupported language: {block.lan}"
            error(msg, append(loc, "lan"))
            result = None
            output = ""
            trace = ErrorBlock(msg=msg, program=block.model_copy())
            return result, output, scope, trace
    append_log(log, "Code Output", result)
    trace = block.model_copy(update={"result": result, "code": code_trace})
    return result, output, scope, trace


__PDL_SESSION = types.SimpleNamespace()


def call_python(code: str) -> Any:
    my_namespace = types.SimpleNamespace(PDL_SESSION=__PDL_SESSION)
    exec(code, my_namespace.__dict__)
    result = my_namespace.result
    return result


def call_command(code: str) -> tuple[int, str]:
    args = shlex.split(code)
    p = subprocess.run(args, capture_output=True, text=True, check=False)
    if p.stderr != "":
        error(p.stderr, None)
    result = p.returncode
    output = p.stdout
    return result, output


def process_input(
    log, scope: ScopeType, block: ReadBlock, loc: BlockLocation
) -> tuple[str, ScopeType, ReadBlock | ErrorBlock]:
    if block.read is not None:
        with open(block.read, encoding="utf-8") as f:
            s = f.read()
            append_log(log, "Input from File: " + block.read, s)
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
            append_log(log, "Input from stdin: ", s)
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
            append_log(log, "Input from stdin: ", s)
    trace = block.model_copy(update={"result": s})
    return s, scope, trace


def step_include(
    log, scope: ScopeType, yield_output: bool, block: IncludeBlock, loc: BlockLocation
) -> Generator[str, Any, tuple[Any, str, ScopeType, IncludeBlock | ErrorBlock]]:
    with open(block.include, "r", encoding="utf-8") as tablefile:
        linetable = get_line_map(tablefile)
        with open(block.include, "r", encoding="utf-8") as infile:
            prog_yaml = yaml.safe_load(infile)
            trace = None
            newloc = BlockLocation(file=block.include, path=[], table=linetable)
            try:
                prog = Program.model_validate(prog_yaml)
                result, output, scope, trace = yield from step_block(
                    log, scope, yield_output, prog.root, newloc
                )
                include_trace = block.model_copy(update={"trace": trace})
                return result, output, scope, include_trace
            except ValidationError:
                msg = "Attempting to include invalid yaml: " + block.include
                with open("pdl-schema.json", "r", encoding="utf-8") as schemafile:
                    schema = json.load(schemafile)
                    defs = schema["$defs"]
                    errors = analyze_errors(defs, defs["Program"], prog_yaml, newloc)
                    if len(errors) == 0:
                        errors = ["Invalid yaml in included file"]
                    for err in errors:
                        msg += "\n" + err
                    error(msg, loc)
                    trace = ErrorBlock(msg=msg, program=block.model_copy())
                    return None, "", scope, trace


def process_parse(
    parser: Parser, text: str, loc: BlockLocation
) -> Optional[dict[str, Any]]:
    match parser.mode:
        case "pdl":
            assert False, "TODO"
        case "regex":
            assert isinstance(parser.with_, str)
            regex = parser.with_
    m = re.fullmatch(regex, text)
    if m is None:
        msg = f"No match found for {regex} in {text}"
        error(msg, append(loc, "from"))
        return None
    current_group_name = ""
    try:
        result = {}
        for x in parser.spec.keys():
            current_group_name = x
            result[x] = m.group(x)
        return result
    except IndexError:
        msg = f"No group named {current_group_name} found by {regex} in {text}"
        error(msg, append(loc, "from"))
        return None


def get_var(var: str, scope: ScopeType) -> Any:
    try:
        segs = var.split(".")
        res = scope[segs[0]]

        for v in segs[1:]:
            res = res[v]
    except Exception:
        return None
    return res


def append_log(log, title, somestring):
    log.append("**********  " + title + "  **********\n")
    log.append(str(somestring) + "\n")


def debug(somestring):
    if DEBUG:
        print("******")
        print(somestring)
        print("******")


def error(somestring, loc: BlockLocation | None):
    if loc is not None:
        print("\n" + get_loc_string(loc) + "Error: " + somestring + "\n")
    else:
        print("\n" + "Error: " + somestring + "\n")


def contains_error(blocks: BlocksType) -> bool:
    def raise_on_error(block):
        if isinstance(block, ErrorBlock):
            raise StopIteration
        iter_block_children(raise_on_error, block)

    try:
        iter_blocks(raise_on_error, blocks)
        return False
    except StopIteration:
        return True
