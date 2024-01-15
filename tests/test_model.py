from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

model_data = {
    "title": "Hello world with a variable to call into a model",
    "prompts": [
        "Hello,",
        {
            "var": "NAME",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "decoding": "greedy",
                "input": "context",
                "stop_sequences": ["!"],
            },
        },
        "!\n",
    ],
}


def test_model():
    scope = {}
    document = []
    data = Program.model_validate(model_data)
    process_block(scope, document, data.root)
    assert document == ["Hello,", " world", "!\n"]


model_chain_data = {
    "title": "Hello world showing model chaining",
    "prompts": [
        "Hello,",
        {
            "var": "NAME",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "decoding": "argmax",
                "input": "context",
                "stop_sequences": ["!"],
            },
        },
        "!\n",
        "Who is",
        {"value": "NAME"},
        "?\n",
        {
            "var": "RESULT",
            "lookup": {
                "model": "google/flan-t5-xl",
                "decoding": "argmax",
                "input": "context",
                "stop_sequences": ["!"],
            },
        },
        "\n",
    ],
}


def test_model_chain():
    scope = {}
    document = []
    data = Program.model_validate(model_chain_data)
    process_block(scope, document, data.root)
    assert document == [
        "Hello,",
        " world",
        "!\n",
        "Who is",
        " world",
        "?\n",
        "hello world",
        "\n",
    ]


multi_shot_data = {
    "title": "Hello world showing model chaining",
    "prompts": [
        {
            "var": "LOCATION",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "decoding": "argmax",
                "input": {
                    "prompts": [
                        "Question: What is the weather in London?\n",
                        "London\n",
                        "Question: What's the weather in Paris?\n",
                        "Paris\n",
                        "Question: Tell me the weather in Lagos?\n",
                        "Lagos\n",
                        "Question: What is the weather in Armonk, NY?\n",
                    ]
                },
                "show_result": True,
                "stop_sequences": ["Question"],
            },
        }
    ],
}


def test_multi_shot():
    scope = {}
    document = []
    data = Program.model_validate(multi_shot_data)
    process_block(scope, document, data.root)

    assert document == ["Armonk, NY\n"]
