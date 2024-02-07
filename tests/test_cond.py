from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

cond_data = {
    "description": "Arithmetic Expressions",
    "prompts": [
        "Question: Noah charges $60 for a large painting and $30 for a small painting.\n",
        "Last month he sold eight large paintings and four small paintings.\n",
        "If he sold twice as much this month, how much is his sales for this month?\n",
        "\n",
        "Answer: Let's think step by step.\n",
        "He sold 8 large paintings and 4 small paintings last month.\n",
        "He sold twice as many this month.\n",
        "8 large paintings x $60 = << 8*60= 480 >> 480\n",
        "4 small paintings x $30 = << 4*30= 120 >> 120\n",
        "So he sold << 480+120= 600 >> 600 paintings last month.\n",
        "Therefore he sold << 600*2= 1200 >> this month.\n",
        "The answer is $1200.\n",
        "\n",
        "Question: Noah charges $30 for a large painting and $10 for a small painting.\n",
        "Last month he sold five large paintings and three small paintings.\n",
        "If he sold three times as much this month, how much is his sales for this month?\n",
        "\n",
        "Answer: Let's think step by step.\n",
        "He sold 5 large paintings and 3 small paintings last month.\n",
        "He sold three times as many this month.\n",
        "5 large paintings x $30 = << 5*30= 150 >> 150\n",
        "3 small paintings x $10 = << 3*10= 30 >> 30\n",
        "So he sold << 150+30= 180 >> 180 paintings last month.\n",
        "Therefore he sold << 180*3= 540 >> this month.\n",
        "The answer is $540.\n\n",
        {
            "prompts": [
                "Question: ",
                {
                    "assign": "QUESTION",
                    "prompts": [
                        {
                            "model": "ibm/granite-20b-code-instruct-v1",
                            "decoding": "argmax",
                            "params": {
                                "distribution_batch_size": 1,
                                "max_length": 2048,
                            },
                            "stop_sequences": ["Answer"],
                        }
                    ],
                },
                "Answer: Let's think step by step.\n",
                {
                    "prompts": [
                        {
                            "assign": "REASON_OR_CALC",
                            "prompts": [
                                {
                                    "model": "ibm/granite-20b-code-instruct-v1",
                                    "decoding": "argmax",
                                    "params": {
                                        "distribution_batch_size": 1,
                                        "max_length": 2048,
                                    },
                                    "stop_sequences": ["<<"],
                                    "include_stop_sequences": True,
                                }
                            ],
                        },
                        {
                            "prompts": [
                                {
                                    "assign": "EXPR",
                                    "prompts": [
                                        {
                                            "model": "ibm/granite-20b-code-instruct-v1",
                                            "decoding": "argmax",
                                            "params": {
                                                "distribution_batch_size": 1,
                                                "max_length": 2048,
                                            },
                                            "stop_sequences": ["=", "\n"],
                                        }
                                    ],
                                },
                                "= ",
                                {
                                    "assign": "RESULT",
                                    "prompts": [
                                        {
                                            "lan": "python",
                                            "code": ["result = ", {"get": "EXPR"}],
                                        }
                                    ],
                                },
                                " >>",
                            ],
                            "condition": {
                                "ends_with": {
                                    "arg0": {"get": "REASON_OR_CALC"},
                                    "arg1": "<<",
                                }
                            },
                        },
                    ]
                },
            ]
        },
    ],
}

assert_data = [
    "Question: Noah charges $60 for a large painting and $30 for a small "
    "painting.\n",
    "Last month he sold eight large paintings and four small paintings.\n",
    "If he sold twice as much this month, how much is his sales for this month?\n",
    "\n",
    "Answer: Let's think step by step.\n",
    "He sold 8 large paintings and 4 small paintings last month.\n",
    "He sold twice as many this month.\n",
    "8 large paintings x $60 = << 8*60= 480 >> 480\n",
    "4 small paintings x $30 = << 4*30= 120 >> 120\n",
    "So he sold << 480+120= 600 >> 600 paintings last month.\n",
    "Therefore he sold << 600*2= 1200 >> this month.\n",
    "The answer is $1200.\n",
    "\n",
    "Question: Noah charges $30 for a large painting and $10 for a small "
    "painting.\n",
    "Last month he sold five large paintings and three small paintings.\n",
    "If he sold three times as much this month, how much is his sales for this "
    "month?\n",
    "\n",
    "Answer: Let's think step by step.\n",
    "He sold 5 large paintings and 3 small paintings last month.\n",
    "He sold three times as many this month.\n",
    "5 large paintings x $30 = << 5*30= 150 >> 150\n",
    "3 small paintings x $10 = << 3*10= 30 >> 30\n",
    "So he sold << 150+30= 180 >> 180 paintings last month.\n",
    "Therefore he sold << 180*3= 540 >> this month.\n",
    "The answer is $540.\n\n",
    "Question: ",
    "\n"
    "Noah charges $10 for a large painting and $5 for a small painting.\n"
    "Last month he sold two large paintings and six small paintings.\n"
    "If he sold half as much this month, how much is his sales for this month?\n"
    "\n",
    "Answer: Let's think step by step.\n",
    "He sold 2 large paintings and 6 small paintings last month.\n"
    "He sold half as many this month.\n"
    "2 large paintings x $10 = <<",
    " 2*10",
    "= ",
    "20",
    " >>",
]


def test_cond():
    scope = {}
    log = []
    data = Program.model_validate(cond_data)
    document, _ = process_block(log, scope, "", data.root)
    assert document == "".join(assert_data)


def cond_data1(show, name):
    return {
        "description": "Hello world showing call out to python code with condition",
        "prompts": [
            {
                "assign": "NAME",
                "prompts": [
                    {
                        "lan": "python",
                        "code": [
                            "import random\n",
                            "import string\n",
                            "result = 'Tracy'",
                        ],
                    }
                ],
                "show_result": show,
            },
            {
                "prompts": [", hello there!\n"],
                "condition": {"ends_with": {"arg0": {"get": "NAME"}, "arg1": name}},
            },
        ],
    }


def test_cond1():
    scope = {}
    log = []
    data = Program.model_validate(cond_data1(False, "blah"))
    document, _ = process_block(log, scope, "", data.root)
    assert document == ""


def test_cond2():
    scope = {}
    log = []
    data = Program.model_validate(cond_data1(True, "acy"))
    document, _ = process_block(log, scope, "", data.root)
    assert document == "Tracy, hello there!\n"


repeat_until_data = {
    "description": "Hello world showing call out to python code with condition",
    "prompts": [
        {
            "assign": "I",
            "prompts": [{"lan": "python", "code": ["result = 0"]}],
            "show_result": True,
        },
        "\n",
        {
            "prompts": [
                {
                    "assign": "I",
                    "prompts": [
                        {
                            "lan": "python",
                            "code": ["result = ", {"get": "I"}, " + 1"],
                        }
                    ],
                    "show_result": True,
                },
                "\n",
            ],
            "repeats_until": {"contains": {"arg0": {"get": "I"}, "arg1": "5"}},
        },
    ],
}


def test_repeat_until():
    scope = {}
    log = []
    data = Program.model_validate(repeat_until_data)
    document, _ = process_block(log, scope, "", data.root)
    assert document == "".join(
        [
            "0",
            "\n",
            "1",
            "\n",
            "2",
            "\n",
            "3",
            "\n",
            "4",
            "\n",
            "5",
            "\n",
        ]
    )
