from pdl.pdl.pdl import process_block

var_data = {
    "title": "Hello world with variable use",
    "prompts": [
        "Hello,",
        {
            "var": "NAME",
            "lookup": {
                "model": "ibm/granite-20b-code-instruct-v1",
                "decoding": "argmax",
                "input": "context",
                "stop_sequences": [
                    "!"
                ]
            }
        },
        "!\n",
        "Who is",
        {
            "value": "NAME"
        },
        "?\n"
    ]
}

def test_var():
    scope = {}
    context = []
    process_block(scope, context, var_data)
    assert context == ['Hello,', ' world', '!\n', 'Who is', ' world', '?\n']
