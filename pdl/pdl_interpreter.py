import json
import os
import types
from pathlib import Path
from typing import Any, Literal, Optional, Sequence, TypeVar

import pystache
import requests
import yaml
from dotenv import load_dotenv
from genai.client import Client
from genai.credentials import Credentials
from genai.schema import DecodingMethod
from pydantic import ValidationError

from . import pdl_ast, ui
from .pdl_ast import (
    ApiBlock,
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsArgs,
    ContainsCondition,
    DocumentType,
    EndsWithArgs,
    EndsWithCondition,
    ErrorBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    InputBlock,
    InputFileBlock,
    InputStdinBlock,
    ModelBlock,
    PDLTextGenerationParameters,
    Program,
    RepeatsBlock,
    RepeatsUntilBlock,
    ScopeType,
    SequenceBlock,
    ValueBlock,
)
from .pdl_ast_utils import iter_block_children, iter_document
from .pdl_dumper import block_to_dict, dump_yaml

T = TypeVar("T")


DEBUG = False

MAX_NEW_TOKENS = 1024
MIN_NEW_TOKENS = 1
REPETITION_PENATLY = 1.07

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
    mode: Literal["html", "json", "yaml"],
    output: Optional[str],
):
    scope: ScopeType = empty_scope
    document = ""
    if logging is None:
        logging = "log.txt"
    with open(pdl, "r", encoding="utf-8") as infile:
        with open(logging, "w", encoding="utf-8") as logfile:
            log: list[str] = []
            data = yaml.safe_load(infile)
            trace = None
            try:
                prog = Program.model_validate(data)
                trace = prog.root
                _, document, scope, trace = process_block(log, scope, prog.root)
            except ValidationError:
                print("Invalid yaml")
                with open("pdl-schema.json", "r", encoding="utf-8") as schemafile:
                    schema = json.load(schemafile)
                    defs = schema["$defs"]
                    analyze_errors(defs, schema, data)
            finally:
                print(document)
                print("\n")
                for line in log:
                    logfile.write(line)
                if trace is not None:
                    if mode == "html":
                        if output is None:
                            output = str(Path(pdl).with_suffix("")) + "_result.html"
                        ui.render(trace, output)
                    if mode == "json":
                        if output is None:
                            output = str(Path(pdl).with_suffix("")) + "_result.json"
                        with open(output, "w", encoding="utf-8") as fp:
                            json.dump(block_to_dict(trace), fp)
                    if mode == "yaml":
                        if output is None:
                            output = str(Path(pdl).with_suffix("")) + "_result.yaml"
                        with open(output, "w", encoding="utf-8") as fp:
                            dump_yaml(block_to_dict(trace), stream=fp)


def process_block(
    log, scope: ScopeType, block: BlockType
) -> tuple[Any, str, ScopeType, BlockType]:
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(log, scope, block.defs)
    else:
        defs_trace = block.defs
    result, output, scope, trace = process_block_body(log, scope, block)
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: result}
        debug("Storing model result for " + var + ": " + str(trace.result))
    trace = trace.model_copy(update={"defs": defs_trace, "result": output})
    if block.show_result is False:
        output = ""
    scope = scope | {"context": output}
    return result, output, scope, trace


def process_block_body(
    log, scope: ScopeType, block: BlockType
) -> tuple[Any, str, ScopeType, BlockType]:
    scope_init = scope
    result: Any
    output: str
    trace: pdl_ast.BlockType
    match block:
        case ModelBlock():
            result, output, scope, trace = call_model(log, scope, block)
        case CodeBlock(lan="python", code=code):
            result, output, scope, code_trace = call_python(log, scope, code)
            trace = block.model_copy(update={"code": code_trace})
        case CodeBlock(lan=l):
            msg = f"Unsupported language: {l}"
            error(msg)
            result = None
            output = ""
            trace = ErrorBlock(msg=msg, block=block.model_copy())
        case GetBlock(get=var):
            result = get_var(var, scope)
            output = result if isinstance(result, str) else json.dumps(result)
            trace = block.model_copy()
        case ValueBlock(value=v):
            result = process_expr(scope, v)
            output = result if isinstance(result, str) else json.dumps(result)
            trace = block.model_copy()
        case ApiBlock():
            result, output, scope, trace = call_api(log, scope, block)
        case SequenceBlock():
            result, output, scope, document = process_document(
                log, scope, block.document
            )
            trace = block.model_copy(update={"document": document})
        case IfBlock():
            b, _, cond_trace = process_condition(log, scope, block.condition)
            # scope = scope | {"context": scope_init["context"]}
            if b:
                result, output, scope, document = process_document(
                    log, scope, block.document
                )
                trace = block.model_copy(
                    update={
                        "condition": cond_trace,
                        "document": document,
                    }
                )
            else:
                result = None
                output = ""
                trace = block.model_copy(update={"condition": cond_trace})
        case RepeatsBlock(repeats=n):
            result = None
            output = ""
            iterations_trace: list[DocumentType] = []
            context_init = scope_init["context"]
            for _ in range(n):
                scope = scope | {"context": context_init + output}
                result, iteration_output, scope, document = process_document(
                    log, scope, block.document
                )
                output += iteration_output
                iterations_trace.append(document)
                if contains_error(document):
                    break
            trace = block.model_copy(update={"trace": iterations_trace})
        case RepeatsUntilBlock(repeats_until=cond_trace):
            result = None
            stop = False
            output = ""
            iterations_trace = []
            context_init = scope_init["context"]
            while not stop:
                scope = scope | {"context": context_init + output}
                result, iteration_output, scope, document = process_document(
                    log, scope, block.document
                )
                output += iteration_output
                iterations_trace.append(document)
                if contains_error(document):
                    break
                stop, scope, _ = process_condition(log, scope, cond_trace)
            trace = block.model_copy(update={"trace": iterations_trace})
        case InputBlock():
            result, output, scope, trace = process_input(log, scope, block)
        case FunctionBlock():
            _ = block.body  # Parse the body of the function
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
            f_body = closure.body
            f_scope = closure.scope | {"context": scope["context"]} | args
            result, output, _, f_trace = process_block(log, f_scope, f_body)
            trace = block.model_copy(update={"trace": f_trace})
        case _:
            assert False
    return result, output, scope, trace


def process_defs(
    log, scope: ScopeType, defs: dict[str, DocumentType]
) -> tuple[ScopeType, dict[str, DocumentType]]:
    defs_trace: dict[str, DocumentType] = {}
    for x, document in defs.items():
        result, _, _, document_trace = process_document(log, scope, document)
        scope = scope | {x: result}
        defs_trace[x] = document_trace
    return scope, defs_trace


def process_document(
    log, scope: ScopeType, document: DocumentType
) -> tuple[Any, str, ScopeType, DocumentType]:
    result: Any
    output: str
    trace: DocumentType
    if isinstance(document, str):
        result = process_expr(scope, document)
        output = result
        trace = result
        append_log(log, "Document", result)
    elif isinstance(document, Block):
        result, output, scope, trace = process_block(log, scope, document)
    elif isinstance(document, Sequence):
        result = None
        output = ""
        trace = []
        context_init = scope["context"]
        for doc in document:
            scope = scope | {"context": context_init + output}
            result, o, scope, t = process_document(log, scope, doc)
            output += o
            trace.append(t)
    else:
        assert False, f"Internal error: unexpected document type {type(document)}"
    return result, output, scope, trace


def process_expr(scope: ScopeType, e: T) -> T:
    if isinstance(e, str):
        return pystache.render(e, scope)
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
    _, output, scope, arg0_trace = process_document(log, scope, cond.arg0)
    arg1 = process_expr(scope, cond.arg1)
    scope = scope | {"context": context_init}
    result = output.endswith(arg1)
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def contains(
    log, scope: ScopeType, cond: ContainsArgs
) -> tuple[bool, ScopeType, ContainsArgs]:
    context_init = scope["context"]
    _, output, scope, arg0_trace = process_document(log, scope, cond.arg0)
    arg1 = process_expr(scope, cond.arg1)
    scope = scope | {"context": context_init}
    result = arg1 in output
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def _get_bam_client() -> Optional[Client]:
    credentials = Credentials.from_env()
    client = Client(credentials=credentials)
    return client


def call_model(
    log, scope: ScopeType, block: ModelBlock
) -> tuple[Any, str, ScopeType, ModelBlock | ErrorBlock]:
    if block.input is not None:  # If not implicit, then input must be a block
        _, model_input, _, input_trace = process_document(log, scope, block.input)
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
                msg=msg, block=block.model_copy(update={"input": input_trace})
            )
            return None, "", scope, trace
        params = block.parameters
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
        response = client.text.generation.create(
            model_id=block.model,
            prompt_id=block.prompt_id,
            inputs=model_input,
            parameters=params.__dict__,
            moderations=block.moderations,
            data=block.data,
        )
        gen = next(response).results[0].generated_text
        debug("model output: " + gen)
        append_log(log, "Model Output", gen)
        trace = block.model_copy(update={"result": gen, "input": input_trace})
        return gen, gen, scope, trace
    except Exception as e:
        msg = f"Model error: {e}"
        error(msg)
        trace = ErrorBlock(
            msg=msg, block=block.model_copy(update={"input": input_trace})
        )
        return None, "", scope, trace


def call_api(
    log, scope: ScopeType, block: ApiBlock
) -> tuple[Any, str, ScopeType, ApiBlock | ErrorBlock]:
    _, input_str, _, input_trace = process_document(log, scope, block.input)
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
            msg=msg, block=block.model_copy(update={"input": input_trace})
        )
    return result, output, scope, trace


def call_python(
    log, scope: ScopeType, code: DocumentType
) -> tuple[Any, str, ScopeType, DocumentType]:
    _, code_str, _, code_trace = get_code_string(log, scope, code)
    my_namespace = types.SimpleNamespace()
    append_log(log, "Code Input", code_str)
    exec(code_str, my_namespace.__dict__)
    result = my_namespace.result
    output = str(result)
    append_log(log, "Code Output", result)
    return result, output, scope, code_trace


def get_code_string(
    log, scope: ScopeType, code: DocumentType
) -> tuple[str, str, ScopeType, DocumentType]:
    _, code_s, _, code_trace = process_document(log, scope, code)
    debug("code string: " + code_s)
    return code_s, code_s, scope, code_trace


def process_input(
    log, scope: ScopeType, block: InputBlock
) -> tuple[Any, str, ScopeType, InputBlock | ErrorBlock]:
    if block.json_content and block.assign is None:
        msg = "If json_content is True in input block, then there must be def field"
        error(msg)
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return None, "", scope, trace

    if isinstance(block, InputFileBlock):
        with open(block.filename, encoding="utf-8") as f:
            s = f.read()
            append_log(log, "Input from File: " + block.filename, s)
    elif isinstance(block, InputStdinBlock):
        if block.stdin is False:
            msg = "Input block must have either a filename or stdin set to true"
            error(msg)
            trace = ErrorBlock(msg=msg, block=block.model_copy())
            return None, "", scope, trace
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
    else:
        assert False
    if block.json_content and block.assign is not None:
        result = json.loads(s)
        scope = scope | {block.assign: s}
    else:
        result = s

    trace = block.model_copy(update={"result": s})
    return result, s, scope, trace


def get_var(var: str, scope: ScopeType) -> Any:
    segs = var.split(".")
    res = scope[segs[0]]
    for v in segs[1:]:
        res = res[v]
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
    print("***Error: " + somestring)


def contains_error(document: DocumentType) -> bool:
    def raise_on_error(block):
        if isinstance(block, ErrorBlock):
            raise StopIteration
        iter_block_children(raise_on_error, block)

    try:
        iter_document(raise_on_error, document)
        return False
    except StopIteration:
        return True


def is_base_type(schema):
    if "type" in schema:
        the_type = schema["type"]
        if the_type in set(["string", "boolean", "integer", "number", "null"]):
            return True
    if "enum" in schema:
        return True
    return False


def is_array(schema):
    if "type" in schema:
        return schema["type"] == "array"
    return False


def is_object(schema):
    if "type" in schema:
        return schema["type"] == "object"
    return False


def is_any_of(schema):
    if "anyOf" in schema:
        return True
    return False


def nullable(schema):
    if "anyOf" in schema:
        for item in schema["anyOf"]:
            if "type" in item and item["type"] == "null":
                return True
    return False


def get_non_null_type(schema):
    if "anyOf" in schema and len(schema["anyOf"]) == 2:
        for item in schema["anyOf"]:
            if "type" not in item or "type" in item and item["type"] != "null":
                return item
    return None


json_types_convert = {
    "null": "None",
    "string": str,
    "boolean": bool,
    "integer": int,
    "number": float,
    "array": list,
    "object": dict,
}


def convert_to_json_type(a_type):
    for k, v in json_types_convert.items():
        if a_type == v:
            return k
    return None


def match(ref_type, data):
    # if "required" in ref_type.keys():
    # required_fields = ref_type["required"]
    all_fields = ref_type["properties"].keys()
    intersection = list(set(data.keys()) & set(all_fields))
    return len(intersection)


def analyze_errors(defs, schema, data):  # noqa: C901, noqa: R0911
    if schema == {}:
        return  # anything matches type Any

    if is_base_type(schema):
        if "type" in schema:
            the_type = json_types_convert[schema["type"]]
            if not isinstance(data, the_type):
                print("Error0: " + str(data) + " should be of type " + str(the_type))
        if "enum" in schema:
            if data not in schema["enum"]:
                print(
                    "Error: " + str(data) + " should be one of: " + str(schema["enum"])
                )

    elif "$ref" in schema:
        ref_string = schema["$ref"].split("/")[2]
        ref_type = defs[ref_string]
        analyze_errors(defs, ref_type, data)

    elif is_array(schema):
        if not isinstance(data, list):
            print("Error: " + str(data) + " should be a list")
        else:
            for item in data:
                analyze_errors(defs, schema["items"], item)

    elif is_object(schema):
        if not isinstance(data, dict):
            print("Error: " + str(data) + " should be an object")
        else:
            if "required" in schema.keys():
                required_fields = schema["required"]
                for missing in list(set(required_fields) - set(data.keys())):
                    print("Error: Missing required field: " + missing)
            all_fields = schema["properties"].keys()
            extras = list(set(data.keys()) - set(all_fields))
            if (
                "additionalProperties" in schema
                and schema["additionalProperties"] is False
            ):
                for field in extras:
                    print("Error: Field not allowed: " + field)

            valid_fields = list(set(all_fields) & set(data.keys()))
            for field in valid_fields:
                analyze_errors(defs, schema["properties"][field], data[field])

    elif is_any_of(schema):
        if len(schema["anyOf"]) == 2 and nullable(schema):
            analyze_errors(defs, get_non_null_type(schema), data)

        elif not isinstance(data, dict) and not isinstance(data, list):
            the_type = convert_to_json_type(type(data))
            the_type_exists = False
            for item in schema["anyOf"]:
                if "type" in item and item["type"] == the_type:
                    the_type_exists = True
                if "enum" in item and data in item["enum"]:
                    the_type_exists = True
            if not the_type_exists:
                print("Error1: " + str(data) + " should be of type " + str(schema))

        elif isinstance(data, list):  # TODO: missing case here!!!
            print("Error: " + str(data) + " should not be a list")

        elif isinstance(data, dict):
            match_ref = {}
            highest_match = 0
            for item in schema["anyOf"]:
                field_matches = 0
                if "type" in item and item["type"] == "object":
                    field_matches = match(item, data)
                    if field_matches > highest_match:
                        highest_match = field_matches
                        match_ref = item
                if "$ref" in item:
                    ref_string = item["$ref"].split("/")[2]
                    ref_type = defs[ref_string]
                    field_matches = match(ref_type, data)
                    if field_matches > highest_match:
                        highest_match = field_matches
                        match_ref = ref_type

            if match_ref == {}:
                print("Error2: " + str(data) + " should be of type: " + str(schema))

            else:
                analyze_errors(defs, match_ref, data)
