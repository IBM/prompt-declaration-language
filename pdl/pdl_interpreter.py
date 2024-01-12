import os
import types

import requests
from genai.credentials import Credentials
from genai.model import Model
from genai.schemas import GenerateParams

from . import pdl_ast
from .pdl_ast import (
    ApiLookup,
    Block,
    CodeLookup,
    ContainsArgs,
    ContainsCondition,
    EndsWithArgs,
    EndsWithCondition,
    LookupBlock,
    ModelLookup,
    Program,
    PromptsBlock,
    ValueBlock,
)

DEBUG = False

GENAI_KEY = os.getenv("GENAI_KEY")
GENAI_API = os.getenv("GENAI_API")


def generate(pdl):
    scope = {}
    with open(pdl, "r", encoding="utf-8") as infile:
        data = Program.model_validate_json(infile.read())
        # print(json.dumps(Program.model_json_schema(), indent=2))
        # print(data)
        # data = json.load(infile)
        context = []
        process_block(scope, context, data.root)
        for prompt in context:
            print(prompt, end="")
    print("\n")


def process_prompts(scope, context, prompts):
    for prompt in prompts:
        if isinstance(prompt, str):
            context.append(prompt)
        else:
            process_block(scope, context, prompt)


def process_block(scope, context, block: pdl_ast.BlockType):
    iteration = 0
    cond = True
    if block.condition is not None:
        cond = condition(block.condition, scope, context)
    if not cond:
        return

    if block.repeats is not None and block.repeats <= 0:
        return

    while True:
        debug(context)
        iteration += 1
        match block:
            case PromptsBlock(prompts=prompts):
                process_prompts(scope, context, prompts)
            case LookupBlock(var=var, lookup=ModelLookup()):
                result = call_model(scope, context, block)
                if is_show_result(block):
                    context += [result]
                scope[var] = result
                debug("Storing model result for " + var + ": " + str(result))
            case LookupBlock(var=var, lookup=CodeLookup(lan="python", code=code)):
                result = call_python(scope, code)
                if result is not None:
                    if is_show_result(block):
                        context += [result]
                    scope[var] = result
                    debug("Storing python result for " + var + ": " + str(result))
            case ValueBlock():
                result = get_value(block, scope)
                if result != "":
                    context += [result]
            case LookupBlock(var=var, lookup=ApiLookup(url=url, input=input_block)):
                inputs: list[str] = []
                process_block(scope, inputs, input_block)
                input_str = "".join(inputs)
                response = requests.get(url + input_str)
                result = response.json()
                debug(result)
                if is_show_result(block):
                    context += [result]
                scope[var] = result
                debug("Storing api result for " + var + ": " + str(result))
            case _:
                assert False

        # Determine if we need to stop iterating in this block
        if stop_iterations(scope, context, block, iteration):
            break


def debug(somestring):
    if DEBUG:
        print("******")
        print(somestring)
        print("******")


def error(somstring):
    print("***Error: " + somstring)


def stop_iterations(scope, context, block: pdl_ast.BlockType, iteration):
    match block:
        case Block(repeats=None, repeats_until=None):
            return True
        case Block(repeats=repeats, repeats_until=None):
            if iteration == repeats:
                return True
        case Block(repeats=None, repeats_until=repeats_until):
            assert repeats_until is not None
            if condition(repeats_until, scope, context):
                return True
        case _:
            error("Cannot have both repeats and repeats_until")
            return True
    return False


def is_show_result(block: LookupBlock):
    return block.lookup.show_result


def get_value(block, scope) -> str:
    match block:
        case ValueBlock(value=v):
            return str(scope[v])
        case _:
            return ""


def condition(cond: pdl_ast.ConditionType, scope, context):
    match cond:
        case EndsWithCondition(ends_with=args):
            return ends_with(args, scope, context)
        case ContainsCondition(contains=args):
            return contains(args, scope, context)
    return False


def ends_with(cond: pdl_ast.EndsWithArgs, scope, context):
    match cond:
        case EndsWithArgs(arg0=v) if isinstance(v, str):
            x = v
        case EndsWithArgs(arg0=v) if isinstance(v, Block):
            x = get_value(v, scope)
        case _:
            error("Ill-formed ends_with condition")
            return False
    return x.endswith(cond.arg1)


def contains(cond: pdl_ast.ContainsArgs, scope, context):
    match cond:
        case ContainsArgs(arg0=x) if isinstance(x, str):
            arg0 = x
        case ContainsArgs(arg0=Block()):
            arg0 = get_value(cond.arg0, scope)
        case _:
            error("Ill-formed contains condition")
            return False
    return cond.arg1 in arg0


def call_model(scope, context, block: pdl_ast.LookupBlock):
    assert isinstance(block.lookup, pdl_ast.ModelLookup)
    model_input = ""
    stop_sequences = []
    include_stop_sequences = False

    if (
        block.lookup.input != "context"
    ):  # If not set to context, then input must be a block
        inputs: list[str] = []
        process_block(scope, inputs, block.lookup.input)
        model_input = "".join(inputs)
    if model_input == "":
        model_input = "".join(context)
    if block.lookup.stop_sequences is not None:
        stop_sequences = block.lookup.stop_sequences
    if block.lookup.include_stop_sequences is not None:
        include_stop_sequences = block.lookup.include_stop_sequences

    if GENAI_API is None:
        error("Environment variable GENAI_API must be defined")
        genai_api = ""
    else:
        genai_api = GENAI_API
    if GENAI_KEY is None:
        error("Environment variable GENAI_KEY must be defined")
        genai_key = ""
    else:
        genai_key = GENAI_KEY
    creds = Credentials(genai_key, api_endpoint=genai_api)
    params = None
    if stop_sequences != []:
        params = GenerateParams(  # pyright: ignore
            decoding_method="greedy",
            max_new_tokens=200,
            min_new_tokens=1,
            # stream=False,
            # temperature=1,
            # top_k=50,
            # top_p=1,
            repetition_penalty=1.07,
            include_stop_sequence=include_stop_sequences,
            stop_sequences=stop_sequences,
        )
    else:
        params = GenerateParams(  # pyright: ignore
            decoding_method="greedy",
            max_new_tokens=200,
            min_new_tokens=1,
            # stream=False,
            # temperature=1,
            # top_k=50,
            # top_p=1,
            repetition_penalty=1.07,
        )

    debug("model input: " + model_input)
    model = Model(block.lookup.model, params=params, credentials=creds)
    response = model.generate([model_input])
    gen = response[0].generated_text
    debug("model output: " + gen)
    return gen


def call_python(scope, code):
    code_str = get_code_string(scope, code)
    my_namespace = types.SimpleNamespace()
    exec(code_str, my_namespace.__dict__)
    return str(my_namespace.result)


def get_code_string(scope, code):
    ret = ""
    for c in code:
        if isinstance(c, str):
            ret += c
        else:
            codes = []
            process_block(scope, codes, c)
            ret += "".join(codes)
    debug("code string: " + ret)
    return ret
