import pytest

from pdl.pdl import exec_dict
from pdl.pdl_interpreter import PDLRuntimeError

var_data = {
    "description": "Hello world with variable use",
    "text": [
        "Hello,",
        {
            "def": "NAME",
            "text": [
                {
                    "model": "watsonx_text/ibm/granite-34b-code-instruct",
                    "parameters": {
                        "temperature": 0,
                        "stop": ["!"],
                        "mock_response": " World",
                    },
                }
            ],
        },
        "!\n",
        "Tell me about",
        {"get": "NAME"},
        "?\n",
    ],
}


def test_var():
    text = exec_dict(var_data)
    assert text == "Hello, World!\nTell me about World?\n"


var_shared_scope_data = {
    "description": "Hello world with variable use",
    "text": [
        "Hello,",
        {
            "def": "NAME",
            "text": [
                {
                    "model": "watsonx_text/ibm/granite-34b-code-instruct",
                    "parameters": {
                        "temperature": 0,
                        "stop": ["!"],
                        "mock_response": " World",
                    },
                }
            ],
        },
        {
            "def": "I",
            "lang": "python",
            "code": "result = NAME[::-1] + '!\\n'",
            "contribute": [],
        },
        {"get": "I"},
    ],
}


def test_code_shared_scope():
    text = exec_dict(var_shared_scope_data)
    assert text == "Hello, WorlddlroW !\n"


var_shared_scope_mutate_data = {
    "description": "Hello world with variable use",
    "text": [
        "Hello, ",
        {
            "def": "NAME",
            "text": "foo",
            "contribute": [],
        },
        {
            "def": "I",
            "lang": "python",
            "code": {"text": ["NAME = NAME[::-1]\n", "result = NAME"]},
            "contribute": [],
        },
        {"get": "NAME"},
        {"get": "I"},
    ],
}


def test_code_shared_scope_no_mutate():
    """
    Python should be able to access variables in the PDL document scope,
    but any modifications should _not_ affect the document scope.
    """
    text = exec_dict(var_shared_scope_mutate_data)
    assert text == "Hello, foooof"


code_var_data = {
    "description": "simple python",
    "text": [
        {
            "def": "I",
            "lang": "python",
            "code": "result = 0",
        },
    ],
}


def test_code_var():
    result = exec_dict(code_var_data, output="all")
    text = result["result"]
    scope = result["scope"]
    assert scope["pdl_context"] == [
        {"role": "user", "content": text, "defsite": "text.0.code"}
    ]
    assert scope["I"] == 0
    assert text == "0"


missing_var = {
    "description": "simple python",
    "text": [{"get": "somevar"}],
}


def test_missing_var():
    with pytest.raises(PDLRuntimeError):
        exec_dict(missing_var)


missing_call = {
    "description": "simple python",
    "text": [{"call": "${ somevar }"}],
}


def test_missing_call():
    with pytest.raises(PDLRuntimeError):
        exec_dict(missing_call)
