from pdl.pdl import exec_dict, exec_str

python_data = {
    "description": "Hello world showing call out to python code",
    "text": [
        "Hello, ",
        {
            "lang": "python",
            "code": {
                "text": ["import random\n", "import string\n", "result = 'Tracy'"]
            },
        },
        "!\n",
    ],
}


def test_python():
    text = exec_dict(python_data)
    assert text == "Hello, Tracy!\n"


def show_result_data(show):
    return {
        "description": "Using a weather API and LLM to make a small weather app",
        "text": [
            {
                "def": "QUERY",
                "text": {"lang": "python", "code": "result = 'How can I help you?: '"},
                "contribute": show,
            }
        ],
    }


def test_contribute_result():
    text = exec_dict(show_result_data(["result"]))
    assert text == "How can I help you?: "


def test_contribute_context():
    result = exec_dict(show_result_data(["context"]), output="all")
    assert result["scope"]["pdl_context"] == [
        {
            "role": "user",
            "content": "How can I help you?: ",
            "defsite": "text.0.text.code",
        }
    ]


def test_contribute_false():
    text = exec_dict(show_result_data([]))
    assert text == ""


command_data = {
    "lastOf": [
        {"def": "world", "lang": "command", "code": "echo -n World", "contribute": []},
        "Hello ${ world }!",
    ]
}

command_data_args = {
    "lastOf": [
        {
            "def": "world1",
            "lang": "command",
            "code": "echo -n \\'World\\'",  # test nested quotes
        },
        {
            "def": "world",
            "args": [
                "echo",
                "-n",
                "${ world1 }",  # and jinja expansion of nested quotes
            ],
            "contribute": [],
        },
        "Hello ${ world }!",
    ]
}


def test_command():
    result = exec_dict(command_data, output="all")
    document = result["result"]
    scope = result["scope"]
    assert document == "Hello World!"
    assert scope["world"] == "World"


def test_command_args():
    result = exec_dict(command_data_args, output="all")
    document = result["result"]
    scope = result["scope"]
    assert document == "Hello 'World'!"
    assert scope["world1"] == "'World'"
    assert scope["world"] == "'World'"


def test_jinja1():
    prog_str = """
defs:
  world: "World"
lang: jinja
code: |
  Hello {{ world }}!
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"


def test_jinja2():
    prog_str = """
defs:
  world: "World"
lang: jinja
code: |
  Hello ${ world }!
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"


def test_jinja3():
    prog_str = """
defs:
  scores:
    array:
    - 10
    - 90
    - 50
    - 60
    - 100
lang: jinja
code: |
    {% for score in scores %}
        {% if score > 80 %}good{% else %}bad{% endif %}{% endfor %}
"""
    result = exec_str(prog_str)
    assert (
        result
        == """
    bad
    good
    bad
    bad
    good"""
    )


def test_pdl1():
    prog_str = """
lang: pdl
code: |
  description: Hello world
  text:
  - "Hello World!"
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"


def test_pdl2():
    prog_str = """
defs:
  w: World
lang: pdl
code: |
  description: Hello world
  text:
  - "Hello ${w}!"
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"


def test_pdl3():
    prog_str = """
defs:
  x:
    code: "result = print"
    lang: python
lang: pdl
code: |
  data: ${x}
"""
    result = exec_str(prog_str)
    assert result == "<built-in function print>"


def test_pdl4():
    prog_str = """
defs:
  x:
    code: "result = print"
    lang: python
lang: pdl
code: |
  data: ${ "${" }x ${ "}" }
"""
    result = exec_str(prog_str)
    assert result == print  # pylint: disable=comparison-with-callable


def test_lang_casing():
    prog_str = """
lang: Python
code: result = "Hello World!"
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"
