from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import process_block  # pyright: ignore

cond_data = {
    "title": "Arithmetic Expressions",
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
                    "var": "QUESTION",
                    "lookup": {
                        "model": "ibm/granite-20b-code-instruct-v1",
                        "decoding": "argmax",
                        "params": {"distribution_batch_size": 1, "max_length": 2048},
                        "input": "context",
                        "stop_sequences": ["Answer"],
                    },
                },
                "Answer: Let's think step by step.\n",
                {
                    "prompts": [
                        {
                            "var": "REASON_OR_CALC",
                            "lookup": {
                                "model": "ibm/granite-20b-code-instruct-v1",
                                "decoding": "argmax",
                                "params": {
                                    "distribution_batch_size": 1,
                                    "max_length": 2048,
                                },
                                "input": "context",
                                "stop_sequences": ["<<"],
                                "include_stop_sequences": True,
                            },
                        },
                        {
                            "prompts": [
                                {
                                    "var": "EXPR",
                                    "lookup": {
                                        "model": "ibm/granite-20b-code-instruct-v1",
                                        "decoding": "argmax",
                                        "params": {
                                            "distribution_batch_size": 1,
                                            "max_length": 2048,
                                        },
                                        "input": "context",
                                        "stop_sequences": ["=", "\n"],
                                    },
                                },
                                "= ",
                                {
                                    "var": "RESULT",
                                    "lookup": {
                                        "lan": "python",
                                        "code": ["result = ", {"value": "EXPR"}],
                                    },
                                },
                                " >>",
                            ],
                            "condition": {
                                "ends_with": {
                                    "arg0": {"value": "REASON_OR_CALC"},
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
    document = []
    log = []
    data = Program.model_validate(cond_data)
    process_block(log, scope, document, data.root)
    assert document == assert_data


def cond_data1(show, name):
    return {
        "title": "Hello world showing call out to python code with condition",
        "prompts": [
            {
                "var": "NAME",
                "lookup": {
                    "lan": "python",
                    "code": ["import random\n", "import string\n", "result = 'Tracy'"],
                    "show_result": show,
                },
            },
            {
                "prompts": [", hello there!\n"],
                "condition": {"ends_with": {"arg0": {"value": "NAME"}, "arg1": name}},
            },
        ],
    }


def test_cond1():
    scope = {}
    document = []
    log = []
    data = Program.model_validate(cond_data1(False, "blah"))
    process_block(log, scope, document, data.root)
    assert document == []


def test_cond2():
    scope = {}
    document = []
    log = []
    data = Program.model_validate(cond_data1(True, "acy"))
    process_block(log, scope, document, data.root)
    assert document == ["Tracy", ", hello there!\n"]


repeat_until_data = {
    "title": "Hello world showing call out to python code with condition",
    "prompts": [
        {
            "var": "I",
            "lookup": {"lan": "python", "code": ["result = 0"], "show_result": True},
        },
        "\n",
        {
            "prompts": [
                {
                    "var": "I",
                    "lookup": {
                        "lan": "python",
                        "code": ["result = ", {"value": "I"}, " + 1"],
                        "show_result": True,
                    },
                },
                "\n",
            ],
            "repeats_until": {"contains": {"arg0": {"value": "I"}, "arg1": "5"}},
        },
    ],
}


def test_repeat_until():
    scope = {}
    document = []
    log = []
    data = Program.model_validate(repeat_until_data)
    process_block(log, scope, document, data.root)
    assert document == [
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
