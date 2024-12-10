import json
from typing import Any, Sequence

from .pdl_ast import ContributeTarget, ContributeValue, FunctionBlock, Message, Messages


def stringify(result):
    if isinstance(result, str):
        s = result
    elif isinstance(result, FunctionBlock):
        s = ""
    else:
        try:
            s = json.dumps(result)
        except TypeError:
            s = str(result)
    return s


def replace_contribute_value(
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]],
    value: ContributeValue,
):
    ret = []
    for item in contribute:
        if isinstance(item, dict) and isinstance(
            item[ContributeTarget.CONTEXT], ContributeValue
        ):
            item = value
        ret.append(item)
    return ret


def get_contribute_value(
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]] | None
):
    if contribute is None:
        return None
    for item in contribute:
        if isinstance(item, dict) and isinstance(
            item[ContributeTarget.CONTEXT], ContributeValue
        ):
            return item[ContributeTarget.CONTEXT].value
    return None


def messages_concat(messages1: Messages, messages2: Messages) -> Messages:
    if len(messages1) == 0:
        return messages2
    if len(messages2) == 0:
        return messages1
    left = messages1[-1]
    right = messages2[0]
    if (
        left["role"] == right["role"] and simple_message(left) and simple_message(right)
    ):  # test that there are no other keys
        return (
            messages1[:-1]
            + [{"role": left["role"], "content": left["content"] + right["content"]}]
            + messages2[1:]
        )
    return messages1 + messages2


def messages_to_str(messages: Messages) -> str:
    return "\n".join([str(msg) for msg in messages])


def simple_message(message: Message) -> bool:
    if message.keys() == {"role", "content"} and message["content"] is not None:
        return True
    return False


def remove_none_values_from_message(message: Any) -> dict[str, Any]:
    ret = {}
    for key, value in message.items():
        if key == "content":
            ret[key] = value
        if value is not None:
            if isinstance(value, dict):
                ret[key] = remove_none_values_from_message(value)
            else:
                ret[key] = value
    return ret
