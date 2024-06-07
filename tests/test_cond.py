from pdl.pdl.pdl_ast import Program  # pyright: ignore
from pdl.pdl.pdl_interpreter import empty_scope  # pyright: ignore
from pdl.pdl.pdl_interpreter import InterpreterState, process_prog  # pyright: ignore

cond_data = {
    "description": "Arithmetic Expressions",
    "document": [
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
            "document": [
                "Question: ",
                {
                    "def": "QUESTION",
                    "document": [
                        {
                            "model": "ibm/granite-20b-code-instruct-v2",
                            "parameters": {
                                "decoding_method": "greedy",
                                "max_new_tokens": 2048,
                                "stop_sequences": ["Answer"],
                                "include_stop_sequence": False,
                            },
                        }
                    ],
                },
                "Answer: Let's think step by step.\n",
                {
                    "document": [
                        {
                            "def": "REASON_OR_CALC",
                            "document": [
                                {
                                    "model": "ibm/granite-20b-code-instruct-v2",
                                    "parameters": {
                                        "decoding_method": "greedy",
                                        "max_new_tokens": 2048,
                                        "stop_sequences": ["<<"],
                                        "include_stop_sequence": True,
                                    },
                                }
                            ],
                        },
                        {
                            "then": [
                                {
                                    "def": "EXPR",
                                    "document": [
                                        {
                                            "model": "ibm/granite-20b-code-instruct-v2",
                                            "parameters": {
                                                "decoding_method": "greedy",
                                                "max_new_tokens": 2048,
                                                "stop_sequences": ["=", "\n"],
                                                "include_stop_sequence": False,
                                            },
                                        }
                                    ],
                                },
                                "= ",
                                {
                                    "def": "RESULT",
                                    "document": [
                                        {
                                            "lan": "python",
                                            "code": ["result = ", {"get": "EXPR"}],
                                        }
                                    ],
                                },
                                " >>",
                            ],
                            "if": '{{ REASON_OR_CALC.endswith("<<") }}',
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
    state = InterpreterState()
    data = Program.model_validate(cond_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "".join(assert_data)


def cond_data1(show, name):
    return {
        "description": "Hello world showing call out to python code with condition",
        "document": [
            {
                "def": "NAME",
                "document": [
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
                "then": [", hello there!\n"],
                "if": '{{ NAME.endswith("' + name + '") }}',
            },
        ],
    }


def test_cond1():
    state = InterpreterState()
    data = Program.model_validate(cond_data1(False, "blah"))
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == ""


def test_cond2():
    state = InterpreterState()
    data = Program.model_validate(cond_data1(True, "acy"))
    _, document, _, _ = process_prog(state, empty_scope, data)
    assert document == "Tracy, hello there!\n"


repeat_until_data = {
    "description": "Hello world showing call out to python code with condition",
    "document": [
        {
            "def": "I",
            "document": [{"lan": "python", "code": ["result = 0"]}],
            "show_result": True,
        },
        "\n",
        {
            "repeat": [
                {
                    "def": "I",
                    "lan": "python",
                    "code": ["result = ", {"get": "I"}, " + 1"],
                    "show_result": True,
                },
                "\n",
            ],
            "until": "{{ I == 5 }}",
        },
    ],
}


def test_repeat_until():
    state = InterpreterState()
    data = Program.model_validate(repeat_until_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
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


repeat_until_str_data = {
    "description": "Hello world showing call out to python code with condition",
    "document": [
        {
            "def": "I",
            "document": [{"lan": "python", "code": ["result = 0"]}],
            "show_result": True,
        },
        "\n",
        {
            "repeat": [
                {
                    "def": "I",
                    "document": [
                        {
                            "lan": "python",
                            "code": ["result = ", {"get": "I"}, " + 1"],
                        }
                    ],
                    "show_result": True,
                },
                "\n",
            ],
            "until": '{{ I in "5" }}',
        },
    ],
}


def test_repeat_until_str():
    state = InterpreterState()
    data = Program.model_validate(repeat_until_str_data)
    _, document, _, _ = process_prog(state, empty_scope, data)
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
