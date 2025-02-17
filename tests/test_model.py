from pdl.pdl import exec_dict

model_data = {
    "description": "Hello world with a variable to call into a model",
    "text": [
        "Hello,",
        {
            "model": "watsonx/meta-llama/llama-3-8b-instruct",
            "parameters": {
                "temperature": 0,
                "stop": ["!"],
                "mock_response": " World",
            },
        },
        "!\n",
    ],
}


def test_model():
    text = exec_dict(model_data)
    assert text == "Hello, World!\n"


model_chain_data = {
    "description": "Hello world showing model chaining",
    "text": [
        "Hello,",
        {
            "def": "SOMEONE",
            "text": [
                {
                    "model": "watsonx/meta-llama/llama-3-8b-instruct",
                    "parameters": {
                        "temperature": 0,
                        "stop": ["!"],
                        "include_stop_sequence": False,
                        "mock_response": " World",
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
            "text": [
                {
                    "model": "watsonx/google/flan-t5-xl",
                    "parameters": {
                        "temperature": 0,
                        "stop": ["."],
                        "include_stop_sequence": True,
                        "roles": {"user": {"pre_message": "", "post_message": ""}},
                        "mock_response": 'World is a fictional character in the popular science fiction television series "The X-Files',
                    },
                },
            ],
        },
        "\n",
    ],
}


def test_model_chain():
    text = exec_dict(model_chain_data)
    assert (
        text
        == 'Hello, World!\nWho is World?\nWorld is a fictional character in the popular science fiction television series "The X-Files\n'
    )


multi_shot_data = {
    "description": "Hello world showing model chaining",
    "text": [
        {
            "def": "LOCATION",
            "text": [
                {
                    "model": "watsonx/meta-llama/llama-3-8b-instruct",
                    "input": {
                        "text": [
                            "Question: What is the weather in London?\n",
                            "London\n",
                            "Question: What's the weather in Paris?\n",
                            "Paris\n",
                            "Question: Tell me the weather in Lagos?\n",
                            "Lagos\n",
                            "Question: What is the weather in Armonk, NY?\n",
                        ]
                    },
                    "parameters": {
                        "temperature": 0,
                        "stop": ["Question"],
                        "include_stop_sequence": False,
                        "mock_response": "Armonk",
                    },
                }
            ],
        }
    ],
}


def test_multi_shot():
    text = exec_dict(multi_shot_data)
    assert text == "Armonk"


model_data_missing_parameters = {
    "description": "Hello world with a variable to call into a model",
    "text": [
        "Hello,\n",
        {
            "model": "watsonx/meta-llama/llama-3-8b-instruct",
            "parameters": {
                "stop": ["."],
                "mock_response": '\nI have a question about the use of the word "in" in the sentence: "The cake was baked in the oven.',
            },
        },
    ],
}


def test_data_missing_parameters():
    text = exec_dict(model_data_missing_parameters)
    assert (
        text
        == 'Hello,\n\nI have a question about the use of the word "in" in the sentence: "The cake was baked in the oven.'
    )


model_parameter = {
    "description": "Hello world with a variable",
    "defs": {"model": "watsonx/meta-llama/llama-3-8b-instruct"},
    "text": [
        "Hello,",
        {
            "model": "${ model }",
            "parameters": {"stop": ["!"], "mock_response": " World!"},
        },
    ],
}


def test_model_parameter():
    text = exec_dict(model_parameter)
    assert text == "Hello, World!"


model_parameter1 = {
    "description": "Hello world with a variable",
    "defs": {"model": "watsonx/meta-llama/llama-3-8b-instruct"},
    "text": [
        "Hello,",
        {
            "model": "watsonx/ibm/${ model }",
            "parameters": {"stop": ["!"], "mock_response": " World!"},
        },
    ],
}


def test_model_parameter1():
    text = exec_dict(model_parameter1)
    assert text == "Hello, World!"


litellm_mock = {
    "description": "call LiteLLM with a mock response",
    "text": [
        "Hello,",
        {
            "model": "watsonx/meta-llama/llama-3-8b-instruct",
            "platform": "litellm",
            "parameters": {"stop": ["!"], "mock_response": " World!"},
        },
    ],
}


def test_litellm_mock():
    text = exec_dict(litellm_mock)
    assert text == "Hello, World!"
