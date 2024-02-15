import json
import os
import types
from pathlib import Path
from typing import Any, Literal, Optional

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
    BlockType,
    CallBlock,
    CodeBlock,
    ConditionType,
    ContainsArgs,
    ContainsCondition,
    EndsWithArgs,
    EndsWithCondition,
    ErrorBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    InputBlock,
    ModelBlock,
    Program,
    PromptsType,
    PromptType,
    RepeatsBlock,
    RepeatsUntilBlock,
    ScopeType,
    SequenceBlock,
    ValueBlock,
)
from .pdl_dumper import block_to_dict, dump_yaml

# from .pdl_dumper import dump_yaml, dumps_json, program_to_dict

DEBUG = False

load_dotenv()
GENAI_KEY = os.getenv("GENAI_KEY")
GENAI_API = os.getenv("GENAI_API")


empty_scope: ScopeType = {"context": ""}


def generate(
    pdl: str,
    logging: Optional[str],
    mode: Literal["html", "json", "yaml"],
    output: Optional[str],
):
    scope: ScopeType = empty_scope
    if logging is None:
        logging = "log.txt"
    with open(pdl, "r", encoding="utf-8") as infile:
        with open(logging, "w", encoding="utf-8") as logfile:
            data = yaml.safe_load(infile)
            prog = Program.model_validate(data)
            log: list[str] = []
            result = ""
            trace = prog.root
            try:
                result, scope, trace = process_block(log, scope, prog.root)
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
                        json.dump(block_to_dict(trace), fp)
                if mode == "yaml":
                    if output is None:
                        output = str(Path(pdl).with_suffix("")) + "_result.yaml"
                    with open(output, "w", encoding="utf-8") as fp:
                        dump_yaml(block_to_dict(trace), stream=fp)


def process_block(
    log, scope: ScopeType, block: BlockType
) -> tuple[str, ScopeType, BlockType]:
    output: str
    trace: pdl_ast.BlockType
    scope_init = scope
    if len(block.defs) > 0:
        scope, defs_trace = process_defs(log, scope, block.defs)
        block = block.model_copy(update={"defs": defs_trace})
    match block:
        case ModelBlock():
            output, scope, trace = call_model(log, scope, block)
        case CodeBlock(lan="python", code=code):
            output, scope, code_trace = call_python(log, scope, code)
            trace = block.model_copy(update={"result": output, "code": code_trace})
        case CodeBlock(lan=l):
            msg = f"Unsupported language: {l}"
            error(msg)
            output = ""
            trace = ErrorBlock(msg=msg, block=block.model_copy())
        case GetBlock(get=var):
            output = str(get_var(var, scope))
            trace = block.model_copy(update={"result": output})
        case ValueBlock(value=v):
            output = str(v)
            trace = block.model_copy(update={"result": output})
        case ApiBlock():
            output, scope, trace = call_api(log, scope, block)
        case SequenceBlock():
            output, scope, prompts = process_prompts(log, scope, block.prompts)
            trace = block.model_copy(update={"result": output, "prompts": prompts})
        case IfBlock():
            b, scope, cond_trace = process_condition(log, scope, block.condition)
            scope = scope | {"context": scope_init["context"]}
            if b:
                output, scope, prompts = process_prompts(log, scope, block.prompts)
                trace = block.model_copy(
                    update={
                        "result": output,
                        "condition": cond_trace,
                        "prompts": prompts,
                    }
                )
            else:
                output = ""
                trace = block.model_copy(
                    update={"result": output, "condition": cond_trace}
                )
        case RepeatsBlock(repeats=n):
            output = ""
            iteration_trace: list[PromptsType] = []
            context_init = scope_init["context"]
            for _ in range(n):
                scope = scope | {"context": context_init + output}
                iteration_output, scope, prompts = process_prompts(
                    log, scope, block.prompts
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
            context_init = scope_init["context"]
            while not stop:
                scope = scope | {"context": context_init + output}
                iteration_output, scope, prompts = process_prompts(
                    log, scope, block.prompts
                )
                output += iteration_output
                iteration_trace.append(prompts)
                stop, scope, _ = process_condition(log, scope, cond_trace)
            trace = block.model_copy(
                update={"result": output, "trace": iteration_trace}
            )
        case InputBlock():
            output, scope, trace = process_input(log, scope, block)
        case FunctionBlock(function=name):
            _ = block.body  # Parse the body of the function
            closure = block.model_copy()
            scope = scope | {name: closure}
            closure.scope = scope
            output = ""
            trace = closure.model_copy(update={"result": output})
        case CallBlock(call=f):
            closure = get_var(f, scope)
            f_body = closure.body
            f_scope = closure.scope | {"context": scope["context"]} | block.args
            output, _, f_trace = process_block(log, f_scope, f_body)
            trace = block.model_copy(update={"trace": f_trace})
        case _:
            assert False
    if block.assign is not None:
        var = block.assign
        scope = scope | {var: trace.result}
        debug("Storing model result for " + var + ": " + str(trace.result))
    if block.show_result is False:
        output = ""
    scope = scope | {"context": output}
    return output, scope, trace


def process_defs(
    log, scope: ScopeType, defs: list[BlockType]
) -> tuple[ScopeType, list[BlockType]]:
    defs_trace: list[Block] = []
    for b in defs:
        _, scope, b_trace = process_block(log, scope, b)
        defs_trace.append(b_trace)
    return scope, defs_trace


def process_prompts(
    log, scope: ScopeType, prompts: PromptsType
) -> tuple[str, ScopeType, PromptsType]:
    output: str = ""
    trace: PromptsType = []
    context_init = scope["context"]
    for prompt in prompts:
        scope = scope | {"context": context_init + output}
        o, scope, p = process_prompt(log, scope, prompt)
        output += o
        trace.append(p)
    return output, scope, trace


def process_prompt(
    log, scope: ScopeType, prompt: PromptType
) -> tuple[str, ScopeType, PromptType]:
    output: str = ""
    if isinstance(prompt, str):
        output = prompt
        trace = prompt
        append_log(log, "Prompt", prompt)
    elif isinstance(prompt, Block):
        output, scope, trace = process_block(log, scope, prompt)
    else:
        assert False
    return output, scope, trace


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
    output, scope, arg0_trace = process_prompt(log, scope, cond.arg0)
    scope = scope | {"context": context_init}
    result = output.endswith(cond.arg1)
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def contains(
    log, scope: ScopeType, cond: ContainsArgs
) -> tuple[bool, ScopeType, ContainsArgs]:
    context_init = scope["context"]
    output, scope, arg0_trace = process_prompt(log, scope, cond.arg0)
    scope = scope | {"context": context_init}
    result = cond.arg1 in output
    return result, scope, cond.model_copy(update={"arg0": arg0_trace})


def call_model(
    log, scope: ScopeType, block: ModelBlock
) -> tuple[str, ScopeType, ModelBlock | ErrorBlock]:
    model_input = ""
    stop_sequences = []
    include_stop_sequences = False
    context_init = scope["context"]
    if block.input is not None:  # If not set to document, then input must be a block
        model_input, scope, input_trace = process_prompt(log, scope, block.input)
        scope = scope | {"context": context_init}
    else:
        input_trace = None
    if model_input == "":
        model_input = context_init
    if block.stop_sequences is not None:
        stop_sequences = block.stop_sequences
    if block.include_stop_sequences is not None:
        include_stop_sequences = block.include_stop_sequences

    if GENAI_API is None:
        msg = "Environment variable GENAI_API must be defined"
        error(msg)
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return "", scope, trace

    if GENAI_KEY is None:
        msg = "Environment variable GENAI_KEY must be defined"
        error(msg)
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return "", scope, trace

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
    try:
        debug("model input: " + model_input)
        append_log(log, "Model Input", model_input)
        model = Model(block.model, params=params, credentials=creds)
        response = model.generate([model_input])
        gen = response[0].generated_text
        debug("model output: " + gen)
        append_log(log, "Model Output", gen)
        trace = block.model_copy(update={"result": gen, "input": input_trace})
        return gen, scope, trace
    except Exception as e:
        msg = f"Model error: {e}"
        error(msg)
        output = ""
        trace = ErrorBlock(
            msg=msg, block=block.model_copy(update={"input": input_trace})
        )
    return output, scope, trace


def call_api(
    log, scope: ScopeType, block: ApiBlock
) -> tuple[str, ScopeType, ApiBlock | ErrorBlock]:
    context_init = scope["context"]
    input_str, _, input_trace = process_prompt(log, scope, block.input)
    scope = scope | {"context": context_init}
    input_str = block.url + input_str
    try:
        append_log(log, "API Input", input_str)
        response = requests.get(input_str)
        output = str(response.json())
        debug(output)
        append_log(log, "API Output", output)
        trace = block.model_copy(update={"result": output, "input": input_trace})
    except Exception as e:
        msg = f"API error: {e}"
        error(msg)
        output = ""
        trace = ErrorBlock(
            msg=msg, block=block.model_copy(update={"input": input_trace})
        )
    return output, scope, trace


def call_python(
    log, scope: ScopeType, code: PromptsType
) -> tuple[str, ScopeType, PromptsType]:
    code_str, scope, code_trace = get_code_string(log, scope, code)
    my_namespace = types.SimpleNamespace()
    append_log(log, "Code Input", code_str)
    exec(code_str, my_namespace.__dict__)
    result = str(my_namespace.result)
    append_log(log, "Code Output", result)
    return result, scope, code_trace


def get_code_string(
    log, scope: ScopeType, code: PromptsType
) -> tuple[str, ScopeType, PromptsType]:
    context_init = scope["context"]
    code_s, scope, code_trace = process_prompts(log, scope, code)
    scope = scope | {"context": context_init}
    debug("code string: " + code_s)
    return code_s, scope, code_trace


def process_input(
    log, scope: ScopeType, block: InputBlock
) -> tuple[str, ScopeType, InputBlock | ErrorBlock]:
    if (block.filename is None and block.stdin is False) or (
        block.filename is not None and block.stdin is True
    ):
        msg = "Input block must have either a filename or stdin and not both"
        error(msg)
        output = ""
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return output, scope, trace

    if block.json_content and block.assign is None:
        msg = "If json_content is True in input block, then there must be assign field"
        error(msg)
        output = ""
        trace = ErrorBlock(msg=msg, block=block.model_copy())
        return output, scope, trace

    if block.filename is not None:
        with open(block.filename, encoding="utf-8") as f:
            s = f.read()
            append_log(log, "Input from File: " + block.filename, s)
    else:  # block.stdin == True
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

    if block.json_content and block.assign is not None:
        s = json.loads(s)
        scope = scope | {block.assign: s}

    trace = block.model_copy(update={"result": s})
    return s, scope, trace


def get_var(var: str, scope: ScopeType) -> Any:
    segs = var.split(".")
    res = scope[segs[0]]
    for v in segs[1:]:
        res = res[v]
    return res


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
