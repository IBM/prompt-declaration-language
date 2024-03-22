import json
import os
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
from jinja2 import Template
from pydantic import ValidationError

from .pdl_ast import (
    AdvancedBlockType,
    ApiBlock,
    BlocksType,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsArgs,
    ContainsCondition,
    DataBlock,
    DocumentBlock,
    EmptyBlock,
    EndsWithArgs,
    EndsWithCondition,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    ModelBlock,
    PDLTextGenerationParameters,
    Program,
    ReadBlock,
    RepeatBlock,
    RepeatUntilBlock,
    ScopeType,
)
from .pdl_ast_utils import iter_block_children, iter_blocks
from .pdl_dumper import block_to_dict, dump_yaml
from .pdl_schema_checker import analyze_errors

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

    with open(pdl, "r", encoding="utf-8") as infile:
        with open(logging, "w", encoding="utf-8") as logfile:
            log: list[str] = []
            prog_yaml = yaml.safe_load(infile)
            trace = None
            try:
                prog = Program.model_validate(prog_yaml)
                trace = prog.root
                doc_generator = GeneratorWrapper(
                    step_block(log, scope, yield_output=True, block=prog.root)
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
                print("Invalid yaml")
                with open("pdl-schema.json", "r", encoding="utf-8") as schemafile:
                    schema = json.load(schemafile)
                    defs = schema["$defs"]
                    errors = analyze_errors(defs, defs["Program"], prog_yaml)
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
    log, scope: ScopeType, block: BlockType
) -> tuple[Any, str, ScopeType, BlockType]:
    return step_to_completion(step_block(log, scope, yield_output=False, block=block))


def step_block(
    log, scope: ScopeType, yield_output: bool, block: BlockType
) -> Generator[str, Any, tuple[Any, str, ScopeType, BlockType]]:
    if isinstance(block, str):
        result = process_expr(scope, block)
        output = result if isinstance(result, str) else json.dumps(result)
        if yield_output:
            yield output
        trace = output
        append_log(log, "Document", output)
        return result, output, scope, block
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(log, scope, block.defs)
    else:
        defs_trace = block.defs
    yield_output &= block.show_result
    result, output, scope, trace = yield from step_block_body(
        log, scope, yield_output, block
    )
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: result}
        debug("Storing model result for " + var + ": " + str(trace.result))
    trace = trace.model_copy(update={"defs": defs_trace, "result": output})
    if block.show_result is False:
        output = ""
    scope = scope | {"context": output}
    return result, output, scope, trace


def step_block_body(
    log, scope: ScopeType, yield_output: bool, block: AdvancedBlockType
) -> Generator[str, Any, tuple[Any, str, ScopeType, AdvancedBlockType]]:
    scope_init = scope
    result: Any
    output: str
    trace: AdvancedBlockType
    match block:
        case ModelBlock():
            result, output, scope, trace = yield from step_call_model(
                log, scope, yield_output, block
            )
        case CodeBlock():
            result, output, scope, trace = call_code(log, scope, block)
            if yield_output:
                yield output
        case GetBlock(get=var):
            result = get_var(var, scope)
            if result is None:
                msg = "Variable is undefined: " + var
                error(msg)
                output = ""
                trace = ErrorBlock(msg=msg, program=block.model_copy())
            else:
                output = result if isinstance(result, str) else json.dumps(result)
                trace = block.model_copy()
            if yield_output:
                yield output
        case DataBlock(data=v):
            result = process_expr(scope, v)
            output = result if isinstance(result, str) else json.dumps(result)
            if yield_output:
                yield output
            trace = block.model_copy()
        case ApiBlock():
            result, output, scope, trace = call_api(log, scope, block)
            if yield_output:
                yield output
        case DocumentBlock():
            _, output, scope, document = yield from step_blocks(
                log, scope, yield_output, block.document
            )
            result = output
            trace = block.model_copy(update={"document": document})
        case IfBlock():
            b, _, cond_trace = process_condition(log, scope, block.condition)
            # scope = scope | {"context": scope_init["context"]}
            if b:
                result, output, scope, then_trace = yield from step_blocks(
                    log, scope, yield_output, block.then
                )
                trace = block.model_copy(
                    update={
                        "if_result": b,
                        "condition": cond_trace,
                        "then": then_trace,
                    }
                )
            elif block.elses is not None:
                result, output, scope, else_trace = yield from step_blocks(
                    log, scope, yield_output, block.elses
                )
                trace = block.model_copy(
                    update={
                        "if_result": b,
                        "condition": cond_trace,
                        "elses": else_trace,
                    }
                )
            else:
                result = None
                output = ""
                trace = block.model_copy(update={"condition": cond_trace})

        case RepeatBlock(num_iterations=n):
            result = None
            output = ""
            iterations_trace: list[BlocksType] = []
            context_init = scope_init["context"]
            for _ in range(n):
                scope = scope | {"context": context_init + output}
                result, iteration_output, scope, body_trace = yield from step_blocks(
                    log, scope, yield_output, block.repeat
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
            for k, v in block.fors.items():
                klist = process_expr(scope, v)
                items = items | {k: klist}
                lengths.append(len(klist))
            if len(set(lengths)) != 1:  # Not all the lists are of the same length
                msg = "Lists inside the For block must be of the same length"
                error(msg)
                output = ""
                trace = ErrorBlock(msg=msg, program=block.model_copy())
            else:
                for i in range(lengths[0]):
                    scope = scope | {"context": context_init + output}
                    for k in items.keys():
                        scope = scope | {k: items[k][i]}
                    (
                        iteration_result,
                        iteration_output,
                        scope,
                        body_trace,
                    ) = yield from step_blocks(log, scope, yield_output, block.repeat)
                    output += iteration_output
                    result.append(iteration_result)
                    iter_trace.append(body_trace)
                    if contains_error(body_trace):
                        break
                trace = block.model_copy(update={"trace": iter_trace})

        case RepeatUntilBlock(until=cond_trace):
            result = None
            stop = False
            output = ""
            iterations_trace = []
            context_init = scope_init["context"]
            while not stop:
                scope = scope | {"context": context_init + output}
                result, iteration_output, scope, body_trace = yield from step_blocks(
                    log, scope, yield_output, block.repeat
                )
                output += iteration_output
                iterations_trace.append(body_trace)
                if contains_error(body_trace):
                    break
                stop, scope, _ = process_condition(log, scope, cond_trace)
            trace = block.model_copy(update={"trace": iterations_trace})
        case ReadBlock():
            result, output, scope, trace = process_input(log, scope, block)
            if yield_output:
                yield output

        case IncludeBlock():
            result, output, scope, trace = yield from step_include(
                log, scope, yield_output, block
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
            args = process_expr(scope, block.args)
            closure = get_var(f, scope)
            if closure is None:
                msg = "Function is undefined: " + f
                error(msg)
                output = ""
                result = None
                trace = ErrorBlock(msg=msg, program=block.model_copy())
            else:
                f_body = closure.returns
                f_scope = closure.scope | {"context": scope["context"]} | args
                result, output, _, f_trace = yield from step_blocks(
                    log, f_scope, yield_output, f_body
                )
                trace = block.model_copy(update={"trace": f_trace})
        case EmptyBlock():
            result = ""
            output = ""
            trace = block.model_copy()

        case _:
            assert False, f"Internal error: unsupported type ({type(block)})"
    return result, output, scope, trace


def process_defs(
    log, scope: ScopeType, defs: dict[str, BlocksType]
) -> tuple[ScopeType, dict[str, BlocksType]]:
    defs_trace: dict[str, BlocksType] = {}
    for x, blocks in defs.items():
        result, _, _, blocks_trace = process_blocks(log, scope, blocks)
        scope = scope | {x: result}
        defs_trace[x] = blocks_trace
    return scope, defs_trace


def process_blocks(
    log, scope: ScopeType, blocks: BlocksType
) -> tuple[Any, str, ScopeType, BlocksType]:
    return step_to_completion(
        step_blocks(log, scope, yield_output=False, blocks=blocks)
    )


def step_blocks(
    log, scope: ScopeType, yield_output: bool, blocks: BlocksType
) -> Generator[str, Any, tuple[Any, str, ScopeType, BlocksType]]:
    result: Any
    output: str
    trace: BlocksType
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        result = None
        output = ""
        trace = []
        context_init = scope["context"]
        for block in blocks:
            scope = scope | {"context": context_init + output}
            result, o, scope, t = yield from step_block(log, scope, yield_output, block)
            output += o
            trace.append(t)  # type: ignore
    else:
        result, output, scope, trace = yield from step_block(
            log, scope, yield_output, blocks
        )
    return result, output, scope, trace


def process_expr(scope: ScopeType, e: Any) -> Any:
    if isinstance(e, str):
        template = Template(
            e,
            keep_trailing_newline=True
            # block_start_string="",
            # block_end_string="",
            # comment_start_string="",
            # comment_end_string="",
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


def process_condition(
    log, scope: ScopeType, cond: ConditionType
) -> tuple[bool, ScopeType, ConditionType]:
    trace: ConditionType
    match cond:
        case EndsWithCondition(ends_with=args):
            result, scope, args_trace = ends_with(log, scope, args)
            trace = cond.model_copy(update={"result": result, "ends_with": args_trace})
        case ContainsCondition(contains=args):
            result, scope, args_trace = contains(log, scope, args)
            trace = cond.model_copy(update={"result": result, "contains": args_trace})
        case _:
            result = False
            trace = cond
    return result, scope, trace


def ends_with(
    log, scope: ScopeType, cond: EndsWithArgs
) -> tuple[bool, ScopeType, EndsWithArgs]:
    context_init = scope["context"]
    _, output, scope, arg0_trace = process_blocks(log, scope, cond.arg0)
    arg1 = process_expr(scope, cond.arg1)
    scope = scope | {"context": context_init}
    result = output.endswith(arg1)
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def contains(
    log, scope: ScopeType, cond: ContainsArgs
) -> tuple[bool, ScopeType, ContainsArgs]:
    context_init = scope["context"]
    _, output, scope, arg0_trace = process_blocks(log, scope, cond.arg0)
    arg1 = process_expr(scope, cond.arg1)
    scope = scope | {"context": context_init}
    result = arg1 in output
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def _get_bam_client() -> Optional[Client]:
    credentials = Credentials.from_env()
    client = Client(credentials=credentials)
    return client


def step_call_model(
    log, scope: ScopeType, yield_output: bool, block: ModelBlock
) -> Generator[str, Any, tuple[Any, str, ScopeType, ModelBlock | ErrorBlock]]:
    if block.input is not None:  # If not implicit, then input must be a block
        _, model_input, _, input_trace = process_blocks(log, scope, block.input)
    else:
        model_input = scope["context"]
        input_trace = None
    try:
        debug("model input: " + model_input)
        append_log(log, "Model Input", model_input)
        client = _get_bam_client()
        if client is None:
            msg = "Fail to get a BAM client"
            error(msg)
            trace = ErrorBlock(
                msg=msg, program=block.model_copy(update={"input": input_trace})
            )
            return None, "", scope, trace
        params = block.parameters
        params = set_default_model_params(params)
        gen = yield from generate_client_response(
            log, client, block, model_input, params, yield_output
        )
        debug("model output: " + gen)
        append_log(log, "Model Output", gen)
        trace = block.model_copy(update={"result": gen, "input": input_trace})
        return gen, gen, scope, trace
    except Exception as e:
        msg = f"Model error: {e}"
        error(msg)
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
    model_input: str,
    params: Optional[PDLTextGenerationParameters],
    yield_output: bool,
) -> Generator[str, Any, str]:
    gen = ""
    for response in client.text.generation.create_stream(
        model_id=block.model,
        prompt_id=block.prompt_id,
        input=model_input,
        parameters=params.__dict__,
        moderations=block.moderations,
        data=block.data,
    ):
        if not response.results:
            if response.moderation is not None:
                append_log(log, "Hate speech:", response.moderation.hap)
            continue
        for result in response.results:
            if result.generated_text:
                if yield_output:
                    yield result.generated_text
                gen += result.generated_text
    return gen


def call_api(
    log, scope: ScopeType, block: ApiBlock
) -> tuple[Any, str, ScopeType, ApiBlock | ErrorBlock]:
    _, input_str, _, input_trace = process_blocks(log, scope, block.input)
    input_str = block.url + input_str
    try:
        append_log(log, "API Input", input_str)
        response = requests.get(input_str)
        result = response.json()
        output = result if isinstance(result, str) else json.dumps(result)
        debug(output)
        append_log(log, "API Output", output)
        trace = block.model_copy(update={"input": input_trace})
    except Exception as e:
        msg = f"API error: {e}"
        error(msg)
        result = None
        output = ""
        trace = ErrorBlock(
            msg=msg, program=block.model_copy(update={"input": input_trace})
        )
    return result, output, scope, trace


def call_code(
    log, scope: ScopeType, block: CodeBlock
) -> tuple[Any, str, ScopeType, CodeBlock | ErrorBlock]:
    _, code_s, _, code_trace = process_blocks(log, scope, block.code)
    append_log(log, "Code Input", code_s)
    debug("code string: " + code_s)
    match block.lan:
        case "python":
            result = call_python(code_s)
            output = str(result)
        case _:
            msg = f"Unsupported language: {block.lan}"
            error(msg)
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


def process_input(
    log, scope: ScopeType, block: ReadBlock
) -> tuple[Any, str, ScopeType, ReadBlock | ErrorBlock]:
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

    if block.parser == "json":
        try:
            result = json.loads(s)
        except Exception:
            msg = "Attempted to parse ill-formed JSON"
            error(msg)
            trace = ErrorBlock(msg=msg, program=block.model_copy())
            return None, "", scope, trace
    else:
        result = s

    trace = block.model_copy(update={"result": s})
    return result, s, scope, trace


def step_include(
    log, scope: ScopeType, yield_output: bool, block: IncludeBlock
) -> Generator[str, Any, tuple[Any, str, ScopeType, IncludeBlock | ErrorBlock]]:
    with open(block.include, "r", encoding="utf-8") as infile:
        prog_yaml = yaml.safe_load(infile)
        trace = None
        try:
            prog = Program.model_validate(prog_yaml)
            result, output, scope, trace = yield from step_block(
                log, scope, yield_output, prog.root
            )
            include_trace = block.model_copy(update={"trace": trace})
            return result, output, scope, include_trace
        except ValidationError as e:
            print(e)
            msg = "Attempting to include invalid yaml: " + block.include
            error(msg)
            trace = ErrorBlock(msg=msg, program=block.model_copy())
            return None, "", scope, trace


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


def error(somestring):
    print("Error: " + somestring)


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
