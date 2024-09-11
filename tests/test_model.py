from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

model_data = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-34b-code-instruct",
            "params": {
                "decoding_method": "greedy",
                "stop_sequences": ["!"],
                "include_stop_sequence": False,
            },
        },
        "!\n",
    ],
}


def test_model():
    state = InterpreterState()
    data = Program.model_validate(model_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, World!\n"


model_chain_data = {
    "description": "Hello world showing model chaining",
    "document": [
        "Hello,",
        {
            "def": "SOMEONE",
            "document": [
                {
                    "model": "ibm/granite-34b-code-instruct",
                    "params": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["!"],
                        "include_stop_sequence": False,
                    },
                }
            ],
        },
        "!\n",
        "Who is",
        {"get": "SOMEONE"},
        "?\n",
        {
            "def": "RESULT",
            "document": [
                {
                    "model": "ibm/granite-34b-code-instruct",
                    "params": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["?"],
                        "include_stop_sequence": True,
                    },
                }
            ],
        },
        "\n",
    ],
}


def test_model_chain():
    state = InterpreterState()
    data = Program.model_validate(model_chain_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        document
        == "Hello, World!\nWho is World?\n```\n\n## License\n\nThis project is licensed under the terms of the MIT license.\n\n"
    )


multi_shot_data = {
    "description": "Hello world showing model chaining",
    "document": [
        {
            "def": "LOCATION",
            "document": [
                {
                    "model": "ibm/granite-34b-code-instruct",
                    "input": {
                        "document": [
                            "Question: What is the weather in London?\n",
                            "London\n",
                            "Question: What's the weather in Paris?\n",
                            "Paris\n",
                            "Question: Tell me the weather in Lagos?\n",
                            "Lagos\n",
                            "Question: What is the weather in Armonk, NY?\n",
                        ]
                    },
                    "params": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["Question"],
                        "include_stop_sequence": False,
                    },
                }
            ],
        }
    ],
}


def test_multi_shot():
    state = InterpreterState()
    data = Program.model_validate(multi_shot_data)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Armonk"


model_data_missing_parameters = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,\n",
        {
            "model": "ibm/granite-34b-code-instruct",
            "params": {
                "stop_sequences": ["."],
            },
        },
    ],
}


def test_data_missing_parameters():
    state = InterpreterState()
    data = Program.model_validate(model_data_missing_parameters)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert (
        document
        == 'Hello,\n\nI have a question about the use of the word "in" in the sentence: "The cake was baked in the oven.'
    )


model_parameter = {
    "description": "Hello world with a variable",
    "defs": {"model": "ibm/granite-34b-code-instruct"},
    "document": [
        "Hello,",
        {
            "model": "{{ model }}",
            "params": {
                "stop_sequences": ["!"],
            },
        },
    ],
}


def test_model_parameter():
    state = InterpreterState()
    data = Program.model_validate(model_parameter)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, World!"


model_parameter1 = {
    "description": "Hello world with a variable",
    "defs": {"model": "granite-34b-code-instruct"},
    "document": [
        "Hello,",
        {
            "model": "ibm/{{ model }}",
            "params": {
                "stop_sequences": ["!"],
            },
        },
    ],
}


def test_model_parameter1():
    state = InterpreterState()
    data = Program.model_validate(model_parameter1)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, World!"


litellm_mock = {
    "description": "call LiteLLM with a mock response",
    "document": [
        "Hello,",
        {
            "model": "watsonx/ibm/granite-34b-code-instruct-v2",
            "platform": "litellm",
            "parameters": {"stop": ["!"], "mock_response": " World!"},
        },
    ],
}


def test_litellm_mock():
    state = InterpreterState()
    data = Program.model_validate(litellm_mock)
    document, _, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, World!"
