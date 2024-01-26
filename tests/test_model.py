from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

model_data = {
    "title": "Hello world with a variable to call into a model",
    "prompts": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v1",
            "decoding": "greedy",
            "stop_sequences": ["!"],
        },
        "!\n",
    ],
}


def test_model():
    scope = {}
    log = []
    data = Program.model_validate(model_data)
    document = process_block(log, scope, [], data.root)
    assert document == ["Hello,", " world", "!\n"]


model_chain_data = {
    "title": "Hello world showing model chaining",
    "prompts": [
        "Hello,",
        {
            "assign": "NAME",
            "prompts": [
                {
                    "model": "ibm/granite-20b-code-instruct-v1",
                    "decoding": "argmax",
                    "stop_sequences": ["!"],
                }
            ],
        },
        "!\n",
        "Who is",
        {"var": "NAME"},
        "?\n",
        {
            "assign": "RESULT",
            "prompts": [
                {
                    "model": "google/flan-t5-xl",
                    "decoding": "argmax",
                    "stop_sequences": ["!"],
                }
            ],
        },
        "\n",
    ],
}


def test_model_chain():
    scope = {}
    log = []
    data = Program.model_validate(model_chain_data)
    document = process_block(log, scope, [], data.root)
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
            "assign": "LOCATION",
            "prompts": [
                {
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
                    "stop_sequences": ["Question"],
                }
            ],
            "show_result": True,
        }
    ],
}


def test_multi_shot():
    scope = {}
    log = []
    data = Program.model_validate(multi_shot_data)
    document = process_block(log, scope, [], data.root)
    assert document == ["Armonk, NY\n"]
