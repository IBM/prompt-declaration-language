from typing import Any, Optional

from termcolor import colored
from termcolor._types import Color

from .pdl_ast import BlockKind
from .pdl_utils import stringify


def color_of(kind: BlockKind):
    color: Optional[Color]
    match kind:
        case BlockKind.FUNCTION:
            color = None
        case BlockKind.CALL:
            color = None
        case BlockKind.MODEL:
            color = "green"
        case BlockKind.CODE:
            color = "magenta"
        case BlockKind.GET:
            color = None
        case BlockKind.DATA:
            color = None
        case BlockKind.TEXT:
            color = None
        case BlockKind.LASTOF:
            color = None
        case BlockKind.ARRAY:
            color = None
        case BlockKind.OBJECT:
            color = None
        case BlockKind.MESSAGE:
            color = None
        case BlockKind.IF:
            color = None
        case BlockKind.MATCH:
            color = None
        case BlockKind.REPEAT:
            color = None
        case BlockKind.READ:
            color = None
        case BlockKind.INCLUDE:
            color = None
        case BlockKind.IMPORT:
            color = None
        case BlockKind.EMPTY:
            color = None
        case BlockKind.ERROR:
            color = "red"
    return color


def color_of_role(role: str):
    color: Optional[Color] = None
    match role:
        case "assistant":
            color = "green"
        case "user":
            color = None
        case "system":
            color = "cyan"
        case "available_tools":
            color = "magenta"
    return color


def yield_result(result: Any, kind: BlockKind) -> None:
    if color_of(kind) is None:
        text = stringify(result)
    else:
        text = colored(stringify(result), color_of(kind))
    print(text, end="", flush=True)


_LAST_ROLE = None
ROLE_COLOR = "blue"


def yield_background(background) -> None:
    global _LAST_ROLE  # pylint: disable= global-statement
    if len(background) > 0 and background[0]["role"] == _LAST_ROLE:
        s = background[0]["content"]
        _LAST_ROLE = background[-1]["role"]
        background = background[1:]
    else:
        s = "\n"
    s += "\n".join(
        [
            f"{colored(msg['role'], ROLE_COLOR)}: {colored(msg['content'], color_of_role(msg['role']))}"
            for msg in background
        ]
    )
    print(s, end="", flush=True)
