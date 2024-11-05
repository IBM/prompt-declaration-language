import json

from .pdl_ast import FunctionBlock, Messages


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


def messages_concat(messages1: Messages, messages2: Messages) -> Messages:
    if len(messages1) == 0:
        return messages2
    if len(messages2) == 0:
        return messages1
    left = messages1[-1]
    right = messages2[0]
    if left["role"] == right["role"]:
        return (
            messages1[:-1]
            + [{"role": left["role"], "content": left["content"] + right["content"]}]
            + messages2[1:]
        )
    return messages1 + messages2


def messages_to_str(model_id: str, messages: Messages) -> str:
    if "granite-3b" not in model_id and "granite-8b" not in model_id:
        return "".join([(msg["content"]) for msg in messages])
    return (
        "".join(
            [
                (
                    str(msg["content"])
                    if msg["role"] is None
                    # else f"<|{msg['role']}|>{msg['content']}"
                    else f"<|start_of_role|>{msg['role']}<|end_of_role|>{msg['content']}<|end_of_text|>\n"
                )
                for msg in messages
            ]
        )
        + "<|start_of_role|>assistant<|end_of_role|>"
    )
