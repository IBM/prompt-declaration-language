import io
from contextlib import redirect_stderr, redirect_stdout

from pdl.pdl import exec_dict


def repeat_retry_data(n: int):
    return {
        "description": "Example of retry code within a repeat block",
        "repeat": {
            "text": [
                "Hello, ",
                {
                    "lang": "python",
                    "code": {
                        "text": [
                            "raise ValueError('dummy exception')\n",
                            "result = 'World'",
                        ]
                    },
                },
                "!\n",
            ],
            "retry": n,
        },
        "maxIterations": 2,
    }


def repeat_retry(n: int, should_be_no_error: bool = False):
    err_msg = ""
    # catch stdout string
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(repeat_retry_data(n))
        except Exception:
            pass
        err_msg = buf.getvalue()

    if should_be_no_error:
        assert err_msg == ""
    else:
        assert f"[Retry 1/{n}]" in err_msg


def test_repeat_retry_negative():
    repeat_retry(-1, should_be_no_error=True)


def test_repeat_retry0():
    repeat_retry(0, should_be_no_error=True)


def test_repeat_retry1():
    repeat_retry(1)


def test_repeat_retry2():
    repeat_retry(2)


def test_repeat_retry3():
    repeat_retry(3)


def code_retry_data(n: int):
    return {
        "description": "Example of retry code within a code block",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise ValueError('dummy exception')\n",
                        "result = 'hello, world!'",
                    ]
                },
            },
        ],
        "retry": n,
    }


def code_retry(n: int, should_be_no_error: bool = False):
    err_msg = ""
    # catch stdout string
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(code_retry_data(n))
        except Exception:
            pass
        err_msg = buf.getvalue()
    if should_be_no_error:
        assert err_msg == ""
    else:
        assert f"[Retry 1/{n}]" in err_msg


def test_code_retry_negative():
    code_retry(-1, should_be_no_error=True)


def test_code_retry0():
    code_retry(0, should_be_no_error=True)


def test_code_retry1():
    code_retry(1)


def test_code_retry2():
    code_retry(2)


def test_code_retry3():
    code_retry(3)
