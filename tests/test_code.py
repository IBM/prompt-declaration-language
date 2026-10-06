import io
from contextlib import redirect_stdout

from pdl.pdl import exec_dict, exec_str
from pdl.pdl_context import SerializeMode

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
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": "How can I help you?: ",
            "pdl__defsite": "text.0.text.code",
        }
    ]


def test_contribute_selective_context():
    result = exec_str(
        """
text:
- def: STEP
  text: "FULL-RESULT-BODY"
  contribute:
    - result
    - context:
        value: "TINY-SUMMARY"
- "end"
""",
        output="all",
    )

    assert result["result"] == "FULL-RESULT-BODYend"
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": "TINY-SUMMARY",
            "pdl__defsite": "text.0.text",
        },
        {"role": "user", "content": "end", "pdl__defsite": "text.1.data"},
    ]
    contribution = result["trace"].text[0].contribute[1]["context"]
    assert contribution.value.pdl__result == "TINY-SUMMARY"


def test_contribute_selective_result():
    result = exec_str(
        """
text: "FULL-RESULT-BODY"
contribute:
  - result:
      value: "TINY-SUMMARY"
""",
        output="all",
    )

    assert result["result"] == "TINY-SUMMARY"
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == []
    contribution = result["trace"].contribute[0]["result"]
    assert contribution.value.pdl__result == "TINY-SUMMARY"


def test_contribute_selective_values_are_streamed():
    selective_result = """
text: "FULL-RESULT-BODY"
contribute:
  - result:
      value: "TINY-RESULT"
"""
    with io.StringIO() as stdout, redirect_stdout(stdout):
        exec_str(selective_result, config={"yield_result": True})
        result_output = stdout.getvalue()
    assert result_output == "TINY-RESULT"

    selective_context = """
text: "FULL-RESULT-BODY"
contribute:
  - context:
      value: "TINY-CONTEXT"
"""
    with io.StringIO() as stdout, redirect_stdout(stdout):
        exec_str(selective_context, config={"yield_background": True})
        context_output = stdout.getvalue()
    assert "TINY-CONTEXT" in context_output
    assert "FULL-RESULT-BODY" not in context_output


def test_contribute_selective_value_to_named_aggregator(tmp_path):
    log_file = tmp_path / "log.txt"
    result = exec_str(
        f"""
defs:
  log:
    aggregator:
      file: "{log_file.as_posix()}"
text: "FULL-RESULT-BODY"
contribute:
  - result
  - log:
      value: "TINY-SUMMARY"
  - context:
      value: "TINY-CONTEXT"
""",
        output="all",
    )

    assert result["result"] == "FULL-RESULT-BODY"
    assert result["scope"]["pdl_context"].serialize(SerializeMode.LITELLM) == [
        {
            "role": "user",
            "content": "TINY-CONTEXT",
            "pdl__defsite": "text",
        }
    ]
    assert log_file.read_text(encoding="utf-8") == "TINY-SUMMARY\n"


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


def test_jinja4():
    prog_str = """
defs:
  name: World
lang: jinja
code: |
    Hello ${ "${" } name ${ "}" }!
parameters:
  variable_start_string:  ${ "${" }
  variable_end_string: ${ "}" }
"""
    result = exec_str(prog_str)
    assert result == "Hello World!"


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


def test_scope1():
    prog_str = """
lang: python
scope:
  x: 10
  y: 20
code: |
  result = x + y
"""
    result = exec_str(prog_str)
    assert result == 30


def test_scope2():
    prog_str = """
lang: jinja
scope:
  name: "Alice"
  age: 30
code: |
  Hello, my name is {{ name }} and I am {{ age }} years old.
"""
    result = exec_str(prog_str)
    assert result == "Hello, my name is Alice and I am 30 years old."


def test_scope3():
    prog_str = """
lang: pdl
scope:
  greeting: "Bonjour"
code: |
  text: ${ "${" } greeting ${ "}" }, World!
"""
    result = exec_str(prog_str)
    assert result == "Bonjour, World!"
