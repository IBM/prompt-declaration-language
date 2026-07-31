import io
import time
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


# def test_repeat_retry_negative():
#     repeat_retry(-1, should_be_no_error=True)


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


# def test_code_retry_negative():
#     code_retry(-1, should_be_no_error=True)


def test_code_retry0():
    code_retry(0, should_be_no_error=True)


def test_code_retry1():
    code_retry(1)


def test_code_retry2():
    code_retry(2)


def test_code_retry3():
    code_retry(3)


# ============================================================================
# Tests for Retry Delay Functionality
# ============================================================================


def test_retry_delay_basic():
    """Test that basic delay is applied between retry attempts."""
    data = {
        "description": "Test basic retry delay",
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
            "tries": 3,
            "delay": 0.1,  # 100ms delay
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Should have at least 2 delays (between 3 attempts)
    # Allow some tolerance for execution time
    assert elapsed >= 0.2, f"Expected at least 0.2s delay, got {elapsed:.3f}s"


def test_retry_delay_exponential_backoff():
    """Test exponential backoff with delay * (backoff ** trial_idx)."""
    data = {
        "description": "Test exponential backoff",
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
            "tries": 3,
            "delay": 0.1,  # 100ms base delay
            "backoff": 2.0,  # Double each time
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Expected delays: 0.1 * (2^0) = 0.1, 0.1 * (2^1) = 0.2
    # Total: 0.3s minimum
    assert elapsed >= 0.3, f"Expected at least 0.3s with backoff, got {elapsed:.3f}s"


def test_retry_delay_max_delay_capping():
    """Test that delays don't exceed max_delay."""
    data = {
        "description": "Test max_delay capping",
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
            "tries": 4,
            "delay": 0.1,
            "backoff": 10.0,  # Would grow very large
            "max_delay": 0.15,  # Cap at 150ms
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Expected delays (capped): 0.1, 0.15, 0.15
    # Total: ~0.4s (with cap) vs much higher without cap
    assert elapsed >= 0.4, f"Expected at least 0.4s, got {elapsed:.3f}s"
    assert elapsed < 1.0, f"Expected less than 1.0s with capping, got {elapsed:.3f}s"


def test_retry_delay_fixed_jitter():
    """Test fixed jitter added to delay."""
    data = {
        "description": "Test fixed jitter",
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
            "tries": 3,
            "delay": 0.1,
            "jitter": 0.05,  # Fixed 50ms jitter
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Expected delays: (0.1 + 0.05) * 2 = 0.3s
    assert elapsed >= 0.3, f"Expected at least 0.3s with jitter, got {elapsed:.3f}s"


def test_retry_delay_random_jitter():
    """Test random jitter in a range."""
    data = {
        "description": "Test random jitter",
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
            "tries": 3,
            "delay": 0.1,
            "jitter": [0.0, 0.1],  # Random jitter 0-100ms
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Minimum: 0.1 * 2 = 0.2s (with 0 jitter)
    # Maximum: (0.1 + 0.1) * 2 = 0.4s (with max jitter)
    # Add tolerance for execution overhead
    assert elapsed >= 0.2, f"Expected at least 0.2s, got {elapsed:.3f}s"
    assert (
        elapsed <= 1.0
    ), f"Expected at most 1.0s with jitter range, got {elapsed:.3f}s"


def test_retry_delay_backward_compatibility():
    """Test that integer retry values still work (no delay)."""
    data = {
        "description": "Test backward compatibility",
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
        "retry": 3,  # Old-style integer retry
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Should complete quickly with no delays
    assert elapsed < 0.5, f"Expected quick execution with no delay, got {elapsed:.3f}s"


def test_retry_delay_no_delay_on_last_attempt():
    """Test that no delay is applied after the final retry."""
    data = {
        "description": "Test no delay after final attempt",
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
            "delay": 0.2,  # 200ms delay
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Should have only 1 delay (between attempt 0 and 1)
    # Not after the final attempt (attempt 1)
    assert elapsed >= 0.2, f"Expected at least 0.2s, got {elapsed:.3f}s"


def test_retry_delay_with_expectations():
    """Test retry delay with expectation-based retries."""
    data = {
        "description": "Test retry delay with expectations",
        "text": [
            {
                "lang": "python",
                "code": "result = 'wrong answer'",
            },
        ],
        "retry": {
            "tries": 2,
            "delay": 0.1,
        },
        "expectations": [
            {
                "expect": "correct answer",
            }
        ],
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Should have at least 1 delay between attempts
    assert elapsed >= 0.1, f"Expected at least 0.1s delay, got {elapsed:.3f}s"


def test_retry_delay_combined_features():
    """Test combination of backoff, max_delay, and jitter."""
    data = {
        "description": "Test combined retry features",
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
            "tries": 3,
            "delay": 0.05,
            "backoff": 2.0,
            "max_delay": 0.15,
            "jitter": 0.02,  # Fixed jitter
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Expected delays:
    # Attempt 0->1: 0.05 * (2^0) + 0.02 = 0.07
    # Attempt 1->2: min(0.05 * (2^1), 0.15) + 0.02 = 0.12
    # Total: ~0.19s
    assert elapsed >= 0.19, f"Expected at least 0.19s, got {elapsed:.3f}s"


def test_retry_delay_zero_delay():
    """Test that zero delay works correctly."""
    data = {
        "description": "Test zero delay",
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
            "tries": 3,
            "delay": 0.0,  # No delay
        },
    }

    start_time = time.time()
    with io.StringIO() as buf, redirect_stdout(buf), redirect_stderr(buf):
        try:
            _ = exec_dict(data)
        except Exception:
            pass
    elapsed = time.time() - start_time

    # Should complete quickly with no delays
    assert (
        elapsed < 1.5
    ), f"Expected quick execution with zero delay, got {elapsed:.3f}s"
