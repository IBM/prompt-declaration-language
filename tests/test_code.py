from pdl.pdl import exec_str
from pdl.pdl_ast import Program
from pdl.pdl_interpreter import InterpreterState, empty_scope, process_prog

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
    state = InterpreterState()
    data = Program.model_validate(python_data)
    text, _, _, _ = process_prog(state, empty_scope, data)
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
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["result"]))
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == "How can I help you?: "


def test_contribute_context():
    state = InterpreterState()
    data = Program.model_validate(show_result_data(["context"]))
    _, background, _, _ = process_prog(state, empty_scope, data)
    assert background == [{"role": "user", "content": "How can I help you?: "}]


def test_contribute_false():
    state = InterpreterState()
    data = Program.model_validate(show_result_data([]))
    text, _, _, _ = process_prog(state, empty_scope, data)
    assert text == ""


command_data = {
    "lastOf": [
        {"def": "world", "lang": "command", "code": "echo -n World", "contribute": []},
        "Hello ${ world }!",
    ]
}


def test_command():
    state = InterpreterState()
    data = Program.model_validate(command_data)
    document, _, scope, _ = process_prog(state, empty_scope, data)
    assert document == "Hello World!"
    assert scope["world"] == "World"


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
