import subprocess
import json
import argparse
import os
import types
import requests
from genai.credentials import Credentials
from genai.model import Model
from genai.schemas import GenerateParams

DEBUG = False

GENAI_KEY = os.getenv("GENAI_KEY")
GENAI_API = os.getenv("GENAI_API")



def generate(pdl):
    scope = {}
    with open(pdl, 'r') as infile:
        data = json.load(infile)
        context = []
        process_block(scope, context, data)
        for prompt in context:
            print(prompt, end="")
    print("\n")

def process_prompts(scope, context, prompts):
    for prompt in prompts:
        if type(prompt) == str:
            context.append(prompt)
        else:
            process_block(scope, context, prompt)

def process_block(scope, context, block):
    iter = 0
    cond = True
    if "condition" in block:
        cond = condition(block["condition"], scope, context)
    if not cond:
        return
    
    if "repeats" in block and block["repeats"] <= 0:
        return

    while(True):
        debug(context)
       
        iter += 1
        if "prompts" in block:
            process_prompts(scope, context, block["prompts"])
        elif is_model_lookup(block):
            result = call_model(scope, context, block)
            if is_show_result(block):
                context += [result]
            scope[block["var"]] = result
            debug("Storing model result for " + block["var"] + ": " + str(result))
        elif is_python_code(block):
            result = call_python(scope, block["lookup"]["code"])
            if result != None:
                if is_show_result(block):
                    context += [result]
                scope[block["var"]] = result
                debug("Storing python result for " + block["var"] + ": " + str(result))
        elif is_value(block):
            result = get_value(block, scope)
            if result != "":
                context += [result]
        elif is_api(block):
            url = block["lookup"]["url"]
            inputs = []
            process_block(scope, inputs, block["lookup"]["input"])
            input_str = ''.join(inputs)
            response = requests.get(url + input_str)
            result = response.json()
            debug(result)
            if is_show_result(block):
                context += [result]
            scope[block["var"]] = result
            debug("Storing api result for " + block["var"] + ": " + str(result))

        # Determine if we need to stop iterating in this block
        if stop_iterations(scope, context, block, iter):
            break


def debug(somestring):
    if DEBUG:
        print("******")
        print(somestring)
        print("******")

def error(somstring):
    print("***Error: " + somstring)

def stop_iterations(scope, context, block, iter):
    if not "repeats" in block and not "repeats_until" in block:
        return True
    
    if "repeats" in block and "repeats_until" in block:
        error("Cannot have both repeats and repeats_until")
        return True
    
    if "repeats" in block:
        if iter == block["repeats"]:
            return True

    if "repeats_until" in block:
        if condition(block["repeats_until"], scope, context):
            return True

    return False


def is_model_lookup(block):
    if "var" in block and "lookup" in block and "model" in block["lookup"] and "input" in block["lookup"]:
        return True
    return False

def is_python_code(block):
    if "var" in block and "lookup" in block and "lan" in block["lookup"] and block["lookup"]["lan"] == "python" and "code" in block["lookup"]:
        return True
    return False

def is_show_result(block):
    if "show_result" in block["lookup"] and block["lookup"]["show_result"] == False:
        return False
    return True

def is_value(block):
    if "value" in block:
        return True
    return False

def get_value(block, scope):
    if block["value"] in scope:
        return str(scope[block["value"]])
    return ""

def is_api(block):
    if "var" in block and "lookup" in block and "api" in block["lookup"] and "url" in block["lookup"] and "input" in block["lookup"]:
        return True
    return False

def condition(cond, scope, context):
    if "ends_with" in cond:
        return ends_with(cond["ends_with"], scope, context)
    
    if "contains" in cond:
        return contains(cond["contains"], scope, context)
    
    return False

def ends_with(cond, scope, context):
    if "arg0" in cond and "arg1" in cond:
        arg0 = ""
        if type(cond["arg0"]) == str:
            arg0 = cond["arg0"]
        else: # arg0 is a value block
            if is_value(cond["arg0"]):
                arg0 = get_value(cond["arg0"], scope)
            else:
                error("Ill-formed value block")
                return False
        return arg0.endswith(cond["arg1"])

    error("Ill-formed ends_with condition")
    return False

def contains(cond, scope, context):
    if "arg0" in cond and "arg1" in cond:
        arg0 = ""
        if type(cond["arg0"]) == str:
            arg0 = cond["arg0"]
        else: # arg0 is a value block
            if is_value(cond["arg0"]):
                arg0 = get_value(cond["arg0"], scope)
            else:
                error("Ill-formed value block")
                return False
        return cond["arg1"] in arg0

    error("Ill-formed contains condition")
    return False


def call_model(scope, context, block):
    model_input = ""
    stop_sequences = []
    include_stop_sequences=False

    if block["lookup"]["input"] != "context": # If not set to context, then input must be a block
        inputs = []
        process_block(scope, inputs, block["lookup"]["input"])
        model_input = "".join(inputs)
    if model_input == "":
        model_input = ''.join(context)
    if "stop_sequences" in block["lookup"]:
        stop_sequences = block["lookup"]["stop_sequences"]
    if "include_stop_sequences" in block["lookup"]:
        include_stop_sequences = block["lookup"]["include_stop_sequences"]

    creds = Credentials(GENAI_KEY, api_endpoint=GENAI_API)
    params = None
    if stop_sequences != []:
        params = GenerateParams(
            decoding_method="greedy",
            max_new_tokens=200,
            min_new_tokens=1,
            #stream=False,
            #temperature=1,
            #top_k=50,
            #top_p=1,
            repetition_penalty=1.07,
            include_stop_sequence=include_stop_sequences,
            stop_sequences=stop_sequences
        )
    else:
        params = GenerateParams(
            decoding_method="greedy",
            max_new_tokens=200,
            min_new_tokens=1,
            #stream=False,
            #temperature=1,
            #top_k=50,
            #top_p=1,
            repetition_penalty=1.07
        )

    debug("model input: " + model_input)
    model = Model(block["lookup"]["model"], params=params, credentials=creds)
    response = model.generate([model_input])
    gen = response[0].generated_text
    debug("model output: " + gen)
    return gen


def call_python(scope, code):
    code_str = getCodeString(scope, code)
    my_namespace = types.SimpleNamespace()
    exec(code_str, my_namespace.__dict__)
    return str(my_namespace.result)
    

def getCodeString(scope, code):
    ret = ""
    for c in code:
        if type(c) == str:
            ret += c
        else:
            codes = []
            process_block(scope, codes, c)
            ret += ''.join(codes)
    debug("code string: " + ret)
    return ret


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument("pdl", help="pdl file", type=str)
    args = parser.parse_args()
    
    
    generate(args.pdl)