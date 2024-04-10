from pdl.pdl.pdl_interpreter import generate  # pyright: ignore


def do_test(t, capsys):
    generate(t["file"], None, "json", None, None, None)
    captured = capsys.readouterr()
    output = captured.out.split("\n")
    print(output)
    assert set(output) == set(t["errors"])


line = {
    "file": "tests/data/line/hello.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello.yaml:0 - Missing required field: return",
        "tests/data/line/hello.yaml:0 - Missing required field: function",
        "tests/data/line/hello.yaml:2 - Field not allowed: documents",
    ],
}


def test_line(capsys):
    do_test(line, capsys)


line1 = {
    "file": "tests/data/line/hello1.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello1.yaml:5 - Missing required field: num_iterations",
        "tests/data/line/hello1.yaml:7 - Field not allowed: num_iterationss",
    ],
}


def test_line1(capsys):
    do_test(line1, capsys)


line2 = {
    "file": "tests/data/line/hello2.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello2.yaml:9 - Field not allowed: decoding_methods",
        "tests/data/line/hello2.yaml:10 - Field not allowed: stop_sequencess",
    ],
}


def test_line2(capsys):
    do_test(line2, capsys)


line3 = {
    "file": "tests/data/line/hello3.yaml",
    "errors": [
        "",
        "Hello, world!",
        "tests/data/line/hello3.yaml:6 - Error: Type errors during spec checking",
        "tests/data/line/hello3.yaml:6 -  world! should be of type <class 'int'>",
    ],
}


def test_line3(capsys):
    do_test(line3, capsys)


line4 = {
    "file": "tests/data/line/hello4.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello4.yaml:5 - Missing required field: repeat",
        "tests/data/line/hello4.yaml:5 - Field not allowed: repeats",
    ],
}


def test_line4(capsys):
    do_test(line4, capsys)


line5 = {
    "file": "tests/data/line/hello5.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello5.yaml:19 - Field not allowed: include_stop_sequences",
    ],
}


def test_line5(capsys):
    do_test(line5, capsys)


line6 = {
    "file": "tests/data/line/hello6.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello6.yaml:7 - Field not allowed: foo",
        "tests/data/line/hello6.yaml:6 - Field not allowed: decoding_methoda",
        "tests/data/line/hello6.yaml:20 - Field not allowed: include_stop_sequences",
    ],
}


def test_line6(capsys):
    do_test(line6, capsys)


line7 = {
    "file": "tests/data/line/hello7.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello7.yaml:4 - Missing required field: lan",
        "tests/data/line/hello7.yaml:4 - Field not allowed: lans",
    ],
}


def test_line7(capsys):
    do_test(line7, capsys)


line8 = {
    "file": "tests/data/line/hello8.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello8.yaml:4 - Missing required field: code",
        "tests/data/line/hello8.yaml:5 - Field not allowed: codea",
    ],
}


def test_line8(capsys):
    do_test(line8, capsys)


line9 = {
    "file": "tests/data/line/hello9.yaml",
    "errors": [
        "",
        "hello",
        "tests/data/line/hello9.yaml:3 - Error: Type errors during spec checking",
        "tests/data/line/hello9.yaml:3 - hello should be of type <class 'int'>",
        "",
    ],
}


def test_line9(capsys):
    do_test(line9, capsys)


line10 = {
    "file": "tests/data/line/hello10.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello10.yaml:7 - QUESTION should be an object",
    ],
}


def test_line10(capsys):
    do_test(line10, capsys)


line11 = {
    "file": "tests/data/line/hello11.yaml",
    "errors": [
        "",
        "Invalid YAML",
        "tests/data/line/hello11.yaml:7 - Field not allowed: defss",
    ],
}


def test_line11(capsys):
    do_test(line11, capsys)


line12 = {
    "file": "tests/data/line/hello12.yaml",
    "errors": [
        "",
        "Hello! How are you?",
        "tests/data/line/hello12.yaml:9 - Error: Type errors during spec checking",
        "tests/data/line/hello12.yaml:9 - How are you? should be of type <class 'bool'>",
    ],
}


def test_line12(capsys):
    do_test(line12, capsys)


line13 = {
    "file": "tests/data/line/hello13.yaml",
    "errors": [
        "",
        "0",
        "1",
        "tests/data/line/hello13.yaml:9 - Error: Type errors during spec checking",
        "tests/data/line/hello13.yaml:9 - 1 should be of type <class 'str'>",
    ],
}


def test_line13(capsys):
    do_test(line13, capsys)


line14 = {
    "file": "tests/data/line/hello14.yaml",
    "errors": [
        "",
        "Hello, world!",
        "Translate the sentence 'Hello, world!' to French",
        "Hello, world!",
        "tests/data/line/hello14.yaml:18 - Error: Type errors in result of function call to translate",  # pylint: disable=line-too-long
        "tests/data/line/hello14.yaml:15 - Hello, world! should be of type <class 'int'>",
        "",
    ],
}


def test_line14(capsys):
    do_test(line14, capsys)


line15 = {
    "file": "tests/data/line/hello15.yaml",
    "errors": [
        "",
        "Hello World!",
        "",
        "tests/data/line/hello15.yaml:6 - Error: Variable is undefined: boolean",
        "",
        "",
        "tests/data/line/hello15.yaml:7 - Error: Error 'something' is undefined in {{ something }}",
        "",
        "{{ something }}",
    ],
}


def test_line15(capsys):
    do_test(line15, capsys)


line16 = {
    "file": "tests/data/line/hello16.yaml",
    "errors": [
        "",
        "",
        "{'bob': 20, 'carol': 30}",
        "tests/data/line/hello16.yaml:8 - Error: Type errors during spec checking",
        "tests/data/line/hello16.yaml:8 - 30 should be of type <class 'str'>",
        "",
        "",
    ],
}


def test_line16(capsys):
    do_test(line16, capsys)
