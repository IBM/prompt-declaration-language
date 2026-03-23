"""Tests for exception filtering in retry configuration."""

import io
from contextlib import redirect_stderr, redirect_stdout

from pdl.pdl import exec_dict


def test_retry_with_specific_exception_match():
    """Test that retry occurs when exception matches the specified type."""
    data = {
        "description": "Test retry with matching exception",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise ValueError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": "ValueError",  # Only retry on ValueError
        },
    }

    err_msg = ""
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
        err_msg = buf.getvalue()

    # Should see retry message since ValueError matches
    assert "[Retry 1/2]" in err_msg


def test_retry_with_specific_exception_no_match():
    """Test that retry does NOT occur when exception doesn't match."""
    data = {
        "description": "Test retry with non-matching exception",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise KeyError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": "ValueError",  # Only retry on ValueError
        },
    }

    err_msg = ""
    exception_raised = False
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except KeyError:
            exception_raised = True
        err_msg = buf.getvalue()

    # Should NOT see retry message since KeyError doesn't match ValueError
    assert "[Retry" not in err_msg
    # Exception should be raised immediately
    assert exception_raised


def test_retry_with_exception_list_match():
    """Test retry with a list of exception types - matching case."""
    data = {
        "description": "Test retry with exception list",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise KeyError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": ["ValueError", "KeyError"],  # Retry on either
        },
    }

    err_msg = ""
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
        err_msg = buf.getvalue()

    # Should see retry message since KeyError is in the list
    assert "[Retry 1/2]" in err_msg


def test_retry_with_exception_list_no_match():
    """Test retry with a list of exception types - non-matching case."""
    data = {
        "description": "Test retry with exception list no match",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise TypeError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": ["ValueError", "KeyError"],  # Retry on either
        },
    }

    err_msg = ""
    exception_raised = False
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except TypeError:
            exception_raised = True
        err_msg = buf.getvalue()

    # Should NOT see retry message since TypeError is not in the list
    assert "[Retry" not in err_msg
    # Exception should be raised immediately
    assert exception_raised


def test_retry_with_default_exception():
    """Test that default Exception catches all exception types."""
    data = {
        "description": "Test retry with default Exception",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise RuntimeError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            # exceptions field not specified, defaults to Exception
        },
    }

    err_msg = ""
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
        err_msg = buf.getvalue()

    # Should see retry message since default Exception catches all
    assert "[Retry 1/2]" in err_msg


def test_retry_backward_compatibility_integer():
    """Test backward compatibility with integer retry (catches all exceptions)."""
    data = {
        "description": "Test backward compatibility",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise RuntimeError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": 2,  # Old-style integer retry
    }

    err_msg = ""
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
        err_msg = buf.getvalue()

    # Should see retry message - integer retry catches all exceptions
    assert "[Retry 1/2]" in err_msg


def test_retry_with_exception_hierarchy():
    """Test that exception hierarchy is respected (subclass matching)."""
    data = {
        "description": "Test exception hierarchy",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise KeyError('test exception')\n",  # KeyError is subclass of LookupError
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": "LookupError",  # Parent class
        },
    }

    err_msg = ""
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
        err_msg = buf.getvalue()

    # Should see retry message since KeyError is a subclass of LookupError
    assert "[Retry 1/2]" in err_msg


def test_retry_with_fallback_and_exception_filter():
    """Test that exception filtering works with fallback."""
    data = {
        "description": "Test exception filter with fallback",
        "text": [
            {
                "lang": "python",
                "code": {
                    "text": [
                        "raise TypeError('test exception')\n",
                        "result = 'success'",
                    ]
                },
            },
        ],
        "retry": {
            "tries": 2,
            "exceptions": "ValueError",  # Only retry on ValueError
        },
        "fallback": {
            "text": "fallback result",
        },
    }

    # When exception doesn't match, it should go to fallback
    result = exec_dict(data)
    assert result == "fallback result"


# Made with Bob
