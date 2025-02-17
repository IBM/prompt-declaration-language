from pdl.pdl import exec_dict

defs_data = {
    "description": "Hello world with variable use",
    "defs": {
        "HELLO": "Hello,",
        "NAME": {
            "text": [
                {
                    "model": "watsonx_text/ibm/granite-34b-code-instruct",
                    "input": {"get": "HELLO"},
                    "parameters": {
                        "stop": ["!"],
                        "include_stop_sequence": False,
                        "mock_response": " World",
                    },
                }
            ]
        },
    },
    "text": [
        {"get": "HELLO"},
        {"get": "NAME"},
        "!\n",
    ],
}


def test_defs():
    text = exec_dict(defs_data)
    assert text == "Hello, World!\n"


defs_chain_data = {
    "description": "Hello world with variable use",
    "defs": {
        "X": {"data": "a"},
        "Y": {"data": "b"},
        "Z": {"text": [{"get": "X"}, {"get": "Y"}, "c"]},
    },
    "text": [{"get": "X"}, {"get": "Y"}, {"get": "Z"}],
}


def test_defs_chain():
    text = exec_dict(defs_chain_data)
    assert text == "ababc"


defs_only = {"description": "defs only", "defs": {"var": "hello"}}


def test_defs_only():
    text = exec_dict(defs_only)
    assert text == ""
