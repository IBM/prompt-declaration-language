from pdl.pdl import exec_dict, exec_file, exec_str

hello_def = {
    "def": "hello",
    "description": "Define hello",
    "function": None,
    "return": "Hello world!",
}

hello_call = {"description": "Call hello", "text": [hello_def, {"call": "${ hello }"}]}


def test_function_def():
    text = exec_dict({"text": [hello_def]})
    assert text == ""


def test_function_call():
    text = exec_dict(hello_call)
    assert text == "Hello world!"


def test_hello_signature():
    result = exec_dict(hello_def, output="all")
    closure = result["scope"]["hello"]
    assert closure.signature == {
        "name": hello_def["def"],
        "description": hello_def["description"],
        "type": "function",
        "parameters": {},
    }


hello_params = {
    "description": "Call hello",
    "text": [
        {
            "description": "Define hello",
            "def": "hello",
            "function": {"name": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"call": "${ hello }", "args": {"name": "World"}},
    ],
}


def test_function_params():
    text = exec_dict(hello_params)
    assert text == "Hello World!"


def test_hello_params_signature():
    result = exec_dict(hello_params, output="all")
    closure = result["scope"]["hello"]
    assert closure.signature == {
        "name": hello_params["text"][0]["def"],
        "description": hello_params["text"][0]["description"],
        "type": "function",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
            "additionalProperties": False,
        },
    }


hello_stutter = {
    "description": "Repeat the context",
    "text": [
        {"def": "stutter", "function": None, "return": "${ pdl_context[0].content }"},
        "Hello World!\n",
        {"call": "${ stutter }"},
    ],
}


def test_function_implicit_context():
    text = exec_dict(hello_stutter)
    assert text == "Hello World!\nHello World!\n"


hello_bye = {
    "description": "Repeat the context",
    "text": [
        {"def": "stutter", "function": {}, "return": "${ pdl_context[0].content }"},
        "Hello World!\n",
        {
            "call": "${ stutter }",
            "args": {"pdl_context": [{"role": None, "content": "Bye!"}]},
        },
    ],
}


def test_function_explicit_context():
    text = exec_dict(hello_bye)
    assert text == "Hello World!\nBye!"


hello_call_template = {
    "description": "Call hello template",
    "text": [
        {"defs": {"alias": {"data": {}}}},
        {
            "description": "Define hello",
            "def": "f",
            "function": {"name": "string"},
            "return": {"text": ["Hello ", {"get": "name"}, "!"]},
        },
        {"lang": "python", "code": "result = alias['hello'] = f"},
        {"call": '${ alias["hello"] }', "args": {"name": "World"}},
    ],
}


def test_call_template():
    text = exec_dict(hello_call_template)
    assert text == "Hello World!"


def test_call_expression_args():
    result = exec_file("tests/data/call_expression_args.pdl")
    assert (
        result
        == "FN::get_current_stock:: 'Simple call!'\n{'product_name': 'from_object'}\nFN::get_current_stock:: 'from_object'\n"
    )


def test_call_from_code_01():
    prog = """
defs:
  f:
    function:
      x:
      y:
    return:
      ${x + y}
array:
- call: ${f}
  args:
    x: 1
    y: 2
- ${ f(x=1, y=2) }
- lang: python
  code:
    result = f(x=1, y=2)
"""
    result = exec_str(prog)
    assert result == [3, 3, 3]


def test_call_from_code_02():
    prog = """
defs:
  f:
    function:
    return:
      ${pdl_context}
lastOf:
- Hello
- context: independent
  array:
  - call: ${f}
  - ${ f() }
  - lang: python
    code:
      result = f()
"""
    result = exec_str(prog)
    assert [ctx.serialize("litellm") for ctx in result] == [
        [{"role": "user", "content": "Hello", "pdl__defsite": "lastOf.0.data"}],
        [{"role": "user", "content": "Hello", "pdl__defsite": "lastOf.0.data"}],
        [{"role": "user", "content": "Hello", "pdl__defsite": "lastOf.0.data"}],
    ]


def test_call_from_code_03():
    prog = """
defs:
  f:
    function:
    return:
      ${pdl_context}
lastOf:
- Hello
- context: independent
  array:
  - call: ${f}
    args:
      pdl_context: []
  - ${ f(pdl_context=[]) }
  - lang: python
    code:
      result = f(pdl_context=[])
"""
    result = exec_str(prog)
    assert [ctx.serialize("litellm") for ctx in result] == [
        [],
        [],
        [],
    ]


def test_call_from_code_04():
    prog = """
defs:
  f:
    function:
    return:
      lastOf:
      - How are you?
      - Bye
lastOf:
- Hello
- context: independent
  array:
  - text:
    - call: ${f}
    - ${pdl_context}
  - text:
    - ${f()}
    - ${pdl_context}
  - text:
    - lang: python
      code:
        result = f()
    - ${pdl_context}
"""
    result = exec_str(prog)
    assert result == [
        "Bye[{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'lastOf.0.data'},{'role': 'user', 'content': 'How are you?', 'pdl__defsite': 'lastOf.1.array.0.text.0.call.lastOf.0.data'},{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'lastOf.1.array.0.text.0.call.lastOf.1.data'}]",
        "Bye[{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'lastOf.0.data'},{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'lastOf.1.array.1.text.0.data'}]",
        "Bye[{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'lastOf.0.data'},{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'lastOf.1.array.2.text.0.code'}]",
    ]


def test_call_from_code_05():
    prog = """
defs:
  f:
    function:
      x:
      y:
    return:
      ${x - y}
array:
- call: ${f}
  args:
    x: 2
    y: 1
- ${ f(2, 1) }
- lang: python
  code:
    result = f(2, 1)
"""
    result = exec_str(prog)
    assert result == [1, 1, 1]


def test_call_from_code_06():
    prog = """
defs:
  f:
    function:
      x: string
    return:
      data: ${x}
text:
- ${ f("Hello") }
- " "
- ${ f("Bye") }
"""
    result = exec_str(prog)
    assert result == "Hello Bye"


def test_call_from_code_07():
    prog = """
defs:
  f:
    function:
      x: string
    return:
      data: ${x}
text:
- ${ f('Hello') + ' ' + f('Bye') }
"""
    result = exec_str(prog)
    assert result == "Hello Bye"


def test_call_from_code_08():
    prog = """
defs:
  f:
    function:
      x: string
    return:
      lastOf:
      - ${ x }
      - ${ pdl_context }
text:
- call: ${ f }
  args:
    x: Hello
    pdl_context: []
  role: A
- "\n"
- data: ${ f("Hello", pdl_context=[]) }
  role: A
"""
    result = exec_str(prog)
    assert (
        result
        == "[{'role': 'A', 'content': 'Hello', 'pdl__defsite': 'text.0.call.lastOf.0.data'}] [{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'text.defs.f.function.instance0.lastOf.0.data'}]"
    )  # XXX The second message should have role `A`


def test_call_from_code_09():
    prog = """
defs:
  f:
    function:
      x: string
    return:
      lastOf:
      - ${ x }
      - ${ pdl_context }
lastOf:
- defs:
    d:
      call: ${ f }
      args:
        x: Hello
        pdl_context: []
  data: ${ d }
- data: ${ f("Bye", pdl_context=[]) }
- ${ pdl_context }"""
    result = exec_str(prog)
    assert (
        str(result)
        == "[{'role': 'user', 'content': [{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'lastOf.0.data.defs.d.call.lastOf.0.data'}]},{'role': 'user', 'content': [{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'lastOf.defs.f.function.instance0.lastOf.0.data'}]}]"
    )


def test_call_from_code_10():
    prog = """
defs:
  f:
    function:
      x: string
    return:
      lastOf:
      - ${ x }
      - ${ pdl_context }
text:
- defs:
    d:
      call: ${ f }
      args:
        x: Hello
        pdl_context: []
  data: ${ d }
- "\\n------\\n"
- data: ${ f("Bye", pdl_context=[]) }
- "\\n------\\n"
- ${ pdl_context }"""
    result = exec_str(prog)
    assert (
        result
        == """[{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'text.0.data.defs.d.call.lastOf.0.data'}]
------
[{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'text.defs.f.function.instance0.lastOf.0.data'}]
------
[{'role': 'user', 'content': [{'role': 'user', 'content': 'Hello', 'pdl__defsite': 'text.0.data.defs.d.call.lastOf.0.data'}]},{'role': 'user', 'content': '\\n------\\n', 'pdl__defsite': 'text.1.data'},{'role': 'user', 'content': [{'role': 'user', 'content': 'Bye', 'pdl__defsite': 'text.defs.f.function.instance0.lastOf.0.data'}]},{'role': 'user', 'content': '\\n------\\n', 'pdl__defsite': 'text.3.data'}]"""
    )
