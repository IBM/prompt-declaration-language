import json
from pathlib import Path

from pydantic import ValidationError

import pdl.pdl
from pdl.pdl_ast import Program, empty_block_location
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog
from pdl.pdl_schema_error_analyzer import analyze_errors


def error(raw_data, assertion):
    state = InterpreterState()
    try:
        data = Program.model_validate(raw_data)
        _, _, _, _ = process_prog(state, empty_scope, data)
    except ValidationError:
        pdl_schema_file = Path(pdl.pdl.__file__).parent / "pdl-schema.json"
        with open(pdl_schema_file, "r", encoding="utf-8") as schemafile:
            schema = json.load(schemafile)
            defs = schema["$defs"]
            errors = analyze_errors(
                defs, schema["$defs"]["PdlBlock"], raw_data, empty_block_location
            )
            assert set(errors) == set(assertion)


error1 = {
    "description": "Hello world!",
    "texts": ["Hello, world!\n", "This is your first prompt descriptor!\n"],
}


def test_error1():
    error(
        error1,
        [
            "line 0 - Missing required field: return",
            "line 0 - Missing required field: function",
            "line 0 - Field not allowed: texts",
        ],
    )


error2 = {
    "description": "Hello world with a variable to call into a model",
    "text": [
        "Hello,",
        {
            "model": "watsonx/ibm/granite-20b-code-instruct",
            "parameterss": {
                "decoding_method": "greedy",
                "stop_sequences": ["!"],
                "include_stop_sequence": False,
            },
        },
        "!\n",
    ],
}


def test_error2():
    error(
        error2,
        [
            "line 0 - Field not allowed: parameterss",
        ],
    )


# error3 = {
#     "description": "Hello world with a variable to call into a model",
#     "text": [
#         "Hello,",
#         {
#             "model": "watsonx/ibm/granite-20b-code-instruct",
#             "parameters": {
#                 "decoding_methods": "greedy",
#                 "stop_sequences": ["!"],
#                 "include_stop_sequence": False,
#             },
#         },
#         "!\n",
#     ],
# }


# def test_error3():
#     error(
#         error3,
#         [
#             ":0 - Field not allowed: decoding_methods",
#         ],
#     )


# error4 = {
#     "description": "Hello world with a variable to call into a model",
#     "text": [
#         "Hello,",
#         {
#             "model": "watsonx/ibm/granite-20b-code-instruct",
#             "parameters": {
#                 "decoding_methods": "greedy",
#                 "stop_sequencess": ["!"],
#                 "include_stop_sequence": False,
#             },
#         },
#         "!\n",
#     ],
# }


# def test_error4():
#     error(
#         error4,
#         [
#             ":0 - Field not allowed: decoding_methods",
#             ":0 - Field not allowed: stop_sequencess",
#         ],
#     )


error5 = {
    "description": "Hello world showing call out to python code",
    "text": [
        "Hello, ",
        {
            "lans": "python",
            "code": {
                "text": ["import random\n", "import string\n", "result = 'Tracy'"]
            },
        },
        "!\n",
    ],
}


def test_error5():
    error(
        error5,
        [
            "line 0 - Missing required field: lang",
            "line 0 - Field not allowed: lans",
        ],
    )


error6 = {
    "description": "Hello world showing call out to python code",
    "text": [
        "Hello, ",
        {
            "lans": "python",
            "codes": {
                "text": ["import random\n", "import string\n", "result = 'Tracy'"]
            },
        },
        "!\n",
    ],
}
