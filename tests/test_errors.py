import json

from pydantic import ValidationError

from pdl.pdl.pdl_ast import Program, empty_block_location  # pyright: ignore
from pdl.pdl.pdl_interpreter import (  # pyright: ignore
    InterpreterState,
    empty_scope,
    process_prog,
)
from pdl.pdl.pdl_schema_error_analyzer import analyze_errors  # pyright: ignore


def error(raw_data, assertion):
    state = InterpreterState()
    try:
        data = Program.model_validate(raw_data)
        _, _, _, _ = process_prog(state, empty_scope, data)
    except ValidationError:
        with open("pdl-schema.json", "r", encoding="utf-8") as schemafile:
            schema = json.load(schemafile)
            defs = schema["$defs"]
            errors = analyze_errors(
                defs, schema["$defs"]["PdlBlock"], raw_data, empty_block_location
            )
            assert set(errors) == set(assertion)


error1 = {
    "description": "Hello world!",
    "documents": ["Hello, world!\n", "This is your first prompt descriptor!\n"],
}


def test_error1():
    error(
        error1,
        [
            ":0 - Missing required field: return",
            ":0 - Missing required field: function",
            ":0 - Field not allowed: documents",
        ],
    )


error2 = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v2",
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
            ":0 - Field not allowed: parameterss",
        ],
    )


error3 = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v2",
            "parameters": {
                "decoding_methods": "greedy",
                "stop_sequences": ["!"],
                "include_stop_sequence": False,
            },
        },
        "!\n",
    ],
}


def test_error3():
    error(
        error3,
        [
            ":0 - Field not allowed: decoding_methods",
        ],
    )


error4 = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v2",
            "parameters": {
                "decoding_methods": "greedy",
                "stop_sequencess": ["!"],
                "include_stop_sequence": False,
            },
        },
        "!\n",
    ],
}


def test_error4():
    error(
        error4,
        [
            ":0 - Field not allowed: decoding_methods",
            ":0 - Field not allowed: stop_sequencess",
        ],
    )


error5 = {
    "description": "Hello world showing call out to python code",
    "document": [
        "Hello, ",
        {
            "lans": "python",
            "code": ["import random\n", "import string\n", "result = 'Tracy'"],
        },
        "!\n",
    ],
}


def test_error5():
    error(
        error5,
        [
            ":0 - Missing required field: lan",
            ":0 - Field not allowed: lans",
        ],
    )


error6 = {
    "description": "Hello world showing call out to python code",
    "document": [
        "Hello, ",
        {
            "lans": "python",
            "codes": ["import random\n", "import string\n", "result = 'Tracy'"],
        },
        "!\n",
    ],
}
