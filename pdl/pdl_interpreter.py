import json
import os
import types
from pathlib import Path

import requests
import yaml
from dotenv import load_dotenv
from genai.credentials import Credentials
from genai.model import Model
from genai.schemas import GenerateParams

from . import pdl_ast, ui
from .pdl_ast import (
    ApiBlock,
    Block,
    CodeBlock,
    ConditionType,
    ContainsArgs,
    ContainsCondition,
    EndsWithArgs,
    EndsWithCondition,
    ErrorBlock,
    GetBlock,
    IfBlock,
    InputBlock,
    ModelBlock,
    Program,
    PromptsType,
    PromptType,
    RepeatsBlock,
    RepeatsUntilBlock,
    SequenceBlock,
    ValueBlock,
)
from .pdl_dumper import dump_yaml

# from .pdl_dumper import dump_yaml, dumps_json, program_to_dict

DEBUG = False

load_dotenv()
GENAI_KEY = os.getenv("GENAI_KEY")
GENAI_API = os.getenv("GENAI_API")


def generate(pdl, logging, mode, output):
    scope = {}
    if logging is None:
        logging = "log.txt"
    with open(pdl, "r", encoding="utf-8") as infile:
        with open(logging, "w", encoding="utf-8") as logfile:
            data = yaml.safe_load(infile)
            prog = Program.model_validate(data)
            log = []
            result = ""
            trace = prog.root
            try:
                result, trace = process_block(log, scope, "", prog.root)
            finally:
                print(result)
                print("\n")
                for prompt in log:
                    logfile.write(prompt)
                if mode == "html":
                    if output is None:
                        output = str(Path(pdl).with_suffix("")) + "_result.html"
                    ui.render(trace, output)
                if mode == "json":
                    if output is None:
                        output = str(Path(pdl).with_suffix("")) + "_result.json"
                    with open(output, "w", encoding="utf-8") as fp:
                        json.dump(trace.model_dump(), fp)
                if mode == "yaml":
                    if output is None:
                        output = str(Path(pdl).with_suffix("")) + "_result.yaml"
                    with open(output, "w", encoding="utf-8") as fp:
                        dump_yaml(trace.model_dump(), stream=fp)


def process_block(
    log, scope, document: str, block: pdl_ast.BlockType
) -> tuple[str, pdl_ast.BlockType]:
    output: str
    trace: pdl_ast.BlockType
    match block:
        case ModelBlock():
            output, trace = call_model(log, scope, document, block)
        case CodeBlock(lan="python", code=code):
            output, code_trace = call_python(log, scope, code)
            trace = block.model_copy(update={"result": output, "code": code_trace})
        case CodeBlock(lan=l):
            msg = f"Unsupported language: {l}"
            error(msg)
            output = ""
            trace = ErrorBlock(msg=msg, block=block.model_copy())
        case GetBlock():
            output = get_var(block, scope)
            trace = block.model_copy(update={"result": output})
        case ValueBlock(value=v):
            output = str(v)
            trace = block.model_copy(update={"result": output})
        case ApiBlock():
            output, trace = call_api(log, scope, block)
        case SequenceBlock():
            output, prompts = process_prompts(log, scope, document, block.prompts)
            trace = block.model_copy(update={"result": output, "prompts": prompts})
        case IfBlock():
            b, cond_trace = process_condition(log, scope, document, block.condition)
            if b:
                output, prompts = process_prompts(log, scope, document, block.prompts)
                trace = block.model_copy(
                    update={
                        "result": output,
                        "condition": cond_trace,
                        "prompts": prompts,
                    }
                )
            else:
                output = ""
                trace = block.model_copy(update={"result": "", "condition": cond_trace})
        case RepeatsBlock(repeats=n):
            output = ""
            iteration_trace: list[PromptsType] = []
            for _ in range(n):
                iteration_output, prompts = process_prompts(
                    log, scope, document + output, block.prompts
                )
                output += iteration_output
                iteration_trace.append(prompts)
            trace = block.model_copy(
                update={"result": output, "trace": iteration_trace}
            )
        case RepeatsUntilBlock(repeats_until=cond_trace):
            stop = False
            output = ""
            iteration_trace = []
            while not stop:
                iteration_output, prompts = process_prompts(
                    log, scope, document + output, block.prompts
                )
                output += iteration_output
                iteration_trace.append(prompts)
                stop, _ = process_condition(log, scope, document, cond_trace)
            trace = block.model_copy(
                update={"result": output, "trace": iteration_trace}
            )
        case InputBlock():
            output, trace = process_input(log, block)
        case _:
            assert False
    if block.assign is not None:
        var = block.assign
        scope[var] = trace.result
        debug("Storing model result for " + var + ": " + str(trace.result))
    if block.show_result is False:
        output = ""
    return output, trace


def call_api(log, scope, block: pdl_ast.ApiBlock) -> tuple[str, pdl_ast.ApiBlock]:
    input_str, input_trace = process_prompt(log, scope, "", block.input)
    input_str = block.url + input_str
    append_log(log, "API Input", input_str)
    response = requests.get(input_str)
    output = str(response.json())
    debug(output)
    append_log(log, "API Output", output)
    trace = block.model_copy(update={"result": output, "input": input_trace})
    return output, trace


def process_prompts(
    log, scope, document: str, prompts: PromptsType
) -> tuple[str, PromptsType]:
    output: str = ""
    trace: PromptsType = []
    for prompt in prompts:
        o, p = process_prompt(log, scope, document + output, prompt)
        output += o
        trace.append(p)
    return output, trace


def process_prompt(log, scope, document, prompt: PromptType) -> tuple[str, PromptType]:
    output: str = ""
    if isinstance(prompt, str):
        output = prompt
        trace = prompt
        append_log(log, "Prompt", prompt)
    elif isinstance(prompt, Block):
        output, trace = process_block(log, scope, document, prompt)
    else:
        assert False
    return output, trace


def append_log(log, title, somestring):
    log.append("**********  " + title + "  **********\n")
    log.append(somestring + "\n")


def debug(somestring):
    if DEBUG:
        print("******")
        print(somestring)
        print("******")


def error(somestring):
    print("***Error: " + somestring)


def get_var(block, scope) -> str:
    match block:
        case GetBlock(get=var):
            return str(scope[var])
        case _:
            return ""


def process_condition(
    log, scope, document, cond: ConditionType
) -> tuple[bool, ConditionType]:
    trace: ConditionType
    match cond:
        case EndsWithCondition(ends_with=args):
            result, args_trace = ends_with(log, scope, document, args)
            trace = cond.model_copy(update={"result": result, "ends_with": args_trace})
        case ContainsCondition(contains=args):
            result, args_trace = contains(log, scope, document, args)
            trace = cond.model_copy(update={"result": result, "contains": args_trace})
        case _:
            result = False
            trace = cond
    return result, trace


def ends_with(log, scope, document, cond: EndsWithArgs) -> tuple[bool, EndsWithArgs]:
    output, arg0_trace = process_prompt(log, scope, document, cond.arg0)
    result = output.endswith(cond.arg1)
    return result, cond.model_copy(update={"arg0": arg0_trace})


def contains(log, scope, document, cond: ContainsArgs) -> tuple[bool, ContainsArgs]:
    output, arg0_trace = process_prompt(log, scope, document, cond.arg0)
    result = cond.arg1 in output
    return result, cond.model_copy(update={"arg0": arg0_trace})


def call_model(
    log, scope, document, block: ModelBlock
) -> tuple[str, pdl_ast.BlockType]:
    model_input = ""
    stop_sequences = []
    include_stop_sequences = False

    if block.input is not None:  # If not set to document, then input must be a block
        model_input, input_trace = process_prompt(log, scope, "", block.input)
    else:
        input_trace = None
    if model_input == "":
        model_input = document
    if block.stop_sequences is not None:
        stop_sequences = block.stop_sequences
    if block.include_stop_sequences is not None:
        include_stop_sequences = block.include_stop_sequences

    if GENAI_API is None:
        msg = "Environment variable GENAI_API must be defined"
        error(msg)
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return "", trace

    if GENAI_KEY is None:
        msg = "Environment variable GENAI_KEY must be defined"
        error(msg)
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return "", trace

    creds = Credentials(GENAI_KEY, api_endpoint=GENAI_API)
    params = None
    if stop_sequences != []:
        params = GenerateParams(  # pyright: ignore
            decoding_method="greedy",
            max_new_tokens=1000,
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
            max_new_tokens=1000,
            min_new_tokens=1,
            # stream=False,
            # temperature=1,
            # top_k=50,
            # top_p=1,
            repetition_penalty=1.07,
        )

    debug("model input: " + model_input)
    append_log(log, "Model Input", model_input)
    model = Model(block.model, params=params, credentials=creds)
    response = model.generate([model_input])
    gen = response[0].generated_text
    debug("model output: " + gen)
    append_log(log, "Model Output", gen)
    trace = block.model_copy(update={"result": gen, "input": input_trace})
    return gen, trace


def call_python(log, scope, code: PromptsType) -> tuple[str, PromptsType]:
    code_str, code_trace = get_code_string(log, scope, code)
    my_namespace = types.SimpleNamespace()
    append_log(log, "Code Input", code_str)
    exec(code_str, my_namespace.__dict__)
    result = str(my_namespace.result)
    append_log(log, "Code Output", result)
    return result, code_trace


def get_code_string(log, scope, code: PromptsType) -> tuple[str, PromptsType]:
    code_s, code_trace = process_prompts(log, scope, "", code)
    debug("code string: " + code_s)
    return code_s, code_trace


def process_input(log, block) -> tuple[str, pdl_ast.BlockType]:
    if (block.filename is None and block.stdin is False) or (
        block.filename is not None and block.stdin is True
    ):
        msg = "Input block must have either a filename or stdin and not both"
        error(msg)
        output = ""
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return output, trace

    if block.filename is not None:
        with open(block.filename, encoding="utf-8") as f:
            s = f.read()
            append_log(log, "Input from File: " + block.filename, s)
            trace = block.model_copy(update={"result": s})
            return s, trace
    # block.stdin == True
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
        trace = block.model_copy(update={"result": s})
        return s, trace
    # multiline
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
    return s, trace
