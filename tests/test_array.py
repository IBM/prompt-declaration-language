from pdl.pdl import exec_dict

array_data = {"description": "Array", "array": ["1", "2", "3", "4"]}


def test_array_data():
    result = exec_dict(array_data)
    assert result == ["1", "2", "3", "4"]


for_data = {
    "description": "For block example",
    "for": {
        "i": [1, 2, 3, 4],
    },
    "repeat": "${ i }",
    "join": {"as": "array"},
}


def test_for_data():
    result = exec_dict(for_data)
    assert result == [1, 2, 3, 4]


repeat_until_data = {
    "description": "Repeat until",
    "lastOf": [
        {
            "def": "I",
            "text": {"lang": "python", "code": "result = 0"},
        },
        {
            "repeat": {
                "def": "I",
                "lang": "python",
                "code": "result = ${ I } + 1",
            },
            "until": "${ I == 5 }",
            "join": {"as": "array"},
        },
    ],
}


def test_repeat_until():
    result = exec_dict(repeat_until_data)
    assert result == [1, 2, 3, 4, 5]
