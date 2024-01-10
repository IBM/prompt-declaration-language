from pdl.pdl.pdl import process_block

python_data = {
    "title": "Hello world showing call out to python code",
    "prompts": [
        "Hello, ",
        {
            "var": "NAME",
            "lookup": {
                "lan": "python",
                "code": [
                    "import random\n",
                    "import string\n",
                    
                    "result = 'Tracy'"
                ]
            }
        },
        "!\n"
    ]
}

def test_python():
    scope = {}
    context = []
    process_block(scope, context, python_data)
    assert context == ['Hello, ', 'Tracy', '!\n']


def show_result_data(show):
    return {
    "title": "Using a weather API and LLM to make a small weather app",
    "prompts": [
        {
            "var": "QUERY",
            "lookup": {
                "lan": "python",
                "code": [
                    "result = 'How can I help you?: '"
                ],
                "show_result": show
            }
        }
    ]
}

def test_show_result():
    scope = {}
    context = []
    process_block(scope, context, show_result_data(True))
    assert context == ['How can I help you?: ']

def test_show_result_false():
    scope = {}
    context = []
    process_block(scope, context, show_result_data(False))
    assert context == []

