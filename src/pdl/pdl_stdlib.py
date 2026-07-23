import math


def _get_logprob(value: str, top_logprobs):
    min_logprob = math.inf
    for logprob in top_logprobs:
        if value.startswith(logprob["token"]):
            return logprob["logprob"]
        min_logprob = min(min_logprob, logprob["logprob"])
    return min_logprob


def _find_first_token(content: str, logprobs):
    for logprob in reversed(logprobs):
        if content.startswith(logprob["token"]):
            return logprob
    assert False


def reward(response):
    content = response["choices"][0]["message"]["content"]
    if content not in ["true", "false"]:
        raise ValueError(f"Wrong value: {content}")

    first_token_logprob = _find_first_token(
        content, response["choices"][0]["logprobs"]["content"]
    )
    top_logprobs = first_token_logprob["top_logprobs"]

    lp_true = _get_logprob("true", top_logprobs)
    lp_false = _get_logprob("false", top_logprobs)
    p_true = math.exp(lp_true)
    p_false = math.exp(lp_false)
    if p_true == 0.0:
        result = -math.inf
    else:
        result = math.log(p_true / (p_true + p_false))

    return result


def bool_confidence(response):
    content = response["choices"][0]["message"]["content"]
    if content not in ["true", "false"]:
        raise ValueError(f"Wrong value: {content}")

    first_token_logprob = _find_first_token(
        content, response["choices"][0]["logprobs"]["content"]
    )
    top_logprobs = first_token_logprob["top_logprobs"]

    lp_true = _get_logprob("true", top_logprobs)
    lp_false = _get_logprob("false", top_logprobs)
    p_true = math.exp(lp_true)
    p_false = math.exp(lp_false)
    match content:
        case "true":
            p_content = p_true
        case "false":
            p_content = p_false
        case _:
            assert False
    if p_content == 0.0:
        result = -math.inf
    else:
        result = math.log(p_content / (p_true + p_false))

    return result
