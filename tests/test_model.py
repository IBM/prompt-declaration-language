from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

model_data = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v2",
            "parameters": {
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
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, world!\n"


model_chain_data = {
    "description": "Hello world showing model chaining",
    "document": [
        "Hello,",
        {
            "def": "SOMEONE",
            "document": [
                {
                    "model": "ibm/granite-20b-code-instruct-v2",
                    "parameters": {
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
                    "model": "ibm/granite-20b-code-instruct-v2",
                    "parameters": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["!"],
                        "include_stop_sequence": False,
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
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "".join(
        [
            "Hello,",
            " world",
            "!\n",
            "Who is",
            " world",
            "?\n",
            "I am the one who knows.",
            "\n",
        ]
    )


multi_shot_data = {
    "description": "Hello world showing model chaining",
    "document": [
        {
            "def": "LOCATION",
            "document": [
                {
                    "model": "ibm/granite-20b-code-instruct-v2",
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
                    "parameters": {
                        "decoding_method": "greedy",
                        "stop_sequences": ["Question"],
                        "include_stop_sequence": False,
                    },
                }
            ],
            "show_result": True,
        }
    ],
}


def test_multi_shot():
    state = InterpreterState()
    data = Program.model_validate(multi_shot_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Armonk, NY\n"


model_data_missing_parameters = {
    "description": "Hello world with a variable to call into a model",
    "document": [
        "Hello,\n",
        {
            "model": "ibm/granite-20b-code-instruct-v2",
            "parameters": {
                "stop_sequences": ["."],
            },
        },
    ],
}


def test_data_missing_parameters():
    state = InterpreterState()
    data = Program.model_validate(model_data_missing_parameters)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert (
        document
        == "Hello,\n\nI am writing to inquire about the possibility of a partnership with you."
    )


model_parameter = {
    "description": "Hello world with a variable",
    "defs": {"model": "ibm/granite-20b-code-instruct-v2"},
    "document": [
        "Hello,",
        {
            "model": "{{ model }}",
            "parameters": {
                "stop_sequences": ["!"],
            },
        },
    ],
}


def test_model_parameter():
    state = InterpreterState()
    data = Program.model_validate(model_parameter)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, world!"


model_parameter1 = {
    "description": "Hello world with a variable",
    "defs": {"model": "granite-20b-code-instruct-v2"},
    "document": [
        "Hello,",
        {
            "model": "ibm/{{ model }}",
            "parameters": {
                "stop_sequences": ["!"],
            },
        },
    ],
}


def test_model_parameter1():
    state = InterpreterState()
    data = Program.model_validate(model_parameter1)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Hello, world!"
