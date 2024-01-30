import os

from jinja2 import Template

BODY = """<!doctype html>
<html>
<head>
    <title>My Title</title>
</head>
<body>
{% for l in lines %}
<a href="content.html"> {{ l }} </a> <br>
{% endfor %}
</body>
</html>"""


def render(block, html):
    t = Template(BODY)
    with open(os.path.join("ui", html), "w", encoding="utf-8") as f:
        contents = block.result.split("\n")
        f.write(t.render(lines=contents))
