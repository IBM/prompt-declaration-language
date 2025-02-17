from pdl.pdl import exec_dict

regex_data = {
    "description": "Parsing using regex",
    "text": "Malcolm Reynolds",
    "parser": {
        "spec": {"first_name": "str", "last_name": "str"},
        "regex": "(?P<first_name>\\w+) (?P<last_name>\\w+)",
    },
}


def test_model():
    result = exec_dict(regex_data)
    assert result == {"first_name": "Malcolm", "last_name": "Reynolds"}
