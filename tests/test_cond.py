from pdl.pdl import exec_dict, exec_str
from pdl.pdl_ast import ContributeTarget


def test_bool():
    prog = """
    defs:
      tt: true
      ff: false
    if: ${tt}
    then: false
    else: true
    """
    result = exec_str(prog)
    assert isinstance(result, bool)
    assert not result


cond_data = {
    "description": "Arithmetic Expressions",
    "text": [
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
            "text": [
                "Question: ",
                {
                    "def": "QUESTION",
                    "text": [
                        {
                            "model": "watsonx/ibm/granite-20b-code-instruct",
                            "parameters": {
                                "stop_sequences": ["Answer"],
                                "include_stop_sequence": False,
                            },
                        }
                    ],
                },
                "Answer: Let's think step by step.\n",
                {
                    "text": [
                        {
                            "def": "REASON_OR_CALC",
                            "model": "watsonx/ibm/granite-20b-code-instruct",
                            "parameters": {
                                "stop_sequences": ["<<"],
                                "include_stop_sequence": True,
                            },
                        },
                        {
                            "then": {
                                "text": [
                                    {
                                        "def": "EXPR",
                                        "model": "watsonx/ibm/granite-20b-code-instruct",
                                        "parameters": {
                                            "stop_sequences": ["=", "\n"],
                                            "include_stop_sequence": False,
                                        },
                                    },
                                    "= ",
                                    {
                                        "def": "RESULT",
                                        "lang": "python",
                                        "code": {
                                            "text": ["result = ", {"get": "EXPR"}]
                                        },
                                    },
                                    " >>",
                                ],
                            },
                            "if": '${ REASON_OR_CALC.endswith("<<") }',
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
    "\n",
    "Question: 100 people are waiting in line to buy tickets to a concert.",
    "The tickets are priced at $30 for general admission and $10 for students.",
    "The total revenue from ticket sales last month was $3,000.",
    "If the number of people who bought tickets increased by 10% this month, how much is the total revenue from ticket sales this month?",
    "\n",
    "Answer: Let's think step by step.",
]


# Removing this test for now
# def test_cond():
#    state = InterpreterState()
#    data = Program.model_validate(cond_data)
#    text, _, _, _ = process_prog(state, empty_scope, data)
#    assert text == "".join(assert_data)


def cond_data1(show, name):
    return {
        "description": "Hello world showing call out to python code with condition",
        "text": [
            {
                "def": "NAME",
                "text": [
                    {
                        "lang": "python",
                        "code": {
                            "text": [
                                "import random\n",
                                "import string\n",
                                "result = 'Tracy'",
                            ]
                        },
                    }
                ],
                "contribute": show,
            },
            {
                "then": ", hello there!\n",
                "if": '${ NAME.endswith("' + name + '") }',
                "else": "",
            },
        ],
    }


def test_cond1():
    text = exec_dict(cond_data1([], "blah"))
    assert text == ""


def test_cond2():
    text = exec_dict(
        cond_data1([ContributeTarget.RESULT, ContributeTarget.CONTEXT], "acy")
    )
    assert text == "Tracy, hello there!\n"


repeat_until_data = {
    "description": "Hello world showing call out to python code with condition",
    "text": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        "\n",
        {
            "repeat": {
                "text": [
                    {
                        "def": "I",
                        "lang": "python",
                        "code": "result = ${ I } + 1",
                    },
                    "\n",
                ]
            },
            "until": "${ I == 5 }",
            "join": {"as": "lastOf"},
        },
    ],
}


def test_repeat_until():
    text = exec_dict(repeat_until_data)
    assert text == "".join(
        [
            "0",
            "\n",
            "5",
            "\n",
        ]
    )


repeat_until_array_data = {
    "description": "Hello world showing call out to python code with condition",
    "text": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        "\n",
        {
            "repeat": {
                "text": [
                    {
                        "def": "I",
                        "lang": "python",
                        "code": "result = ${ I } + 1",
                    },
                    "\n",
                ]
            },
            "until": "${ I == 5 }",
            "join": {"as": "array"},
        },
    ],
}


def test_repeat_until_array():
    text = exec_dict(repeat_until_array_data)
    assert text == "".join(["0", "\n", '["1\\n", "2\\n", "3\\n", "4\\n", "5\\n"]'])


repeat_until_text_data = {
    "description": "Hello world showing call out to python code with condition",
    "text": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        "\n",
        {
            "repeat": {
                "text": [
                    {
                        "def": "I",
                        "lang": "python",
                        "code": "result = ${ I } + 1",
                    },
                    "\n",
                ]
            },
            "until": "${ I == 5 }",
        },
    ],
}


def test_repeat_until_text():
    text = exec_dict(repeat_until_text_data)
    assert text == "".join(
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


repeat_until_text_with_data = {
    "description": "Hello world showing call out to python code with condition",
    "text": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        "\n",
        {
            "repeat": {
                "text": {
                    "def": "I",
                    "lang": "python",
                    "code": "result = ${ I } + 1",
                },
            },
            "until": "${ I == 5 }",
            "join": {"with": "\n"},
        },
    ],
}


def test_repeat_until_text_with():
    text = exec_dict(repeat_until_text_with_data)
    assert text == "\n".join(
        [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
        ]
    )


repeat_until_str_data = {
    "description": "Hello world showing call out to python code with condition",
    "text": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        "\n",
        {
            "repeat": {
                "text": [
                    {
                        "def": "I",
                        "text": {
                            "lang": "python",
                            "code": "result = ${ I } + 1",
                        },
                    },
                    "\n",
                ],
            },
            "until": '${ I in "5" }',
        },
    ],
}


def test_repeat_until_str():
    text = exec_dict(repeat_until_str_data)
    assert text == "".join(
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
