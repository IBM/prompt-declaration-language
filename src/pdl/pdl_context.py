from enum import StrEnum
from typing import Any

from .pdl_lazy import (
    PdlDict,
    PdlList,
)


class SerializeMode(StrEnum):
    LITELLM = "litellm"
    GRANITEIO = "graniteio"


class PDLContext:

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        return []


class BaseMessage(PDLContext):
    message: PdlDict[str, Any]

    def __init__(self, message: dict[str, Any]):
        if "role" not in message:
            assert False
        if "content" not in message:
            assert False
        self.message = PdlDict(message)

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.message.result()
        return [result]


class IndependentContext(PDLContext):
    context: PdlList[PDLContext]

    def __init__(self, context: PdlList[PDLContext]):
        self.context = context

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.context.result()
        contexts = [m.serialize(mode) for m in result]
        flat = [x for xs in contexts for x in xs]
        if mode == SerializeMode.GRANITEIO:
            return [{"independent": flat}]
        return flat


class DependentContext(PDLContext):
    context: PdlList[PDLContext]

    def __init__(self, context: PdlList[PDLContext]):
        self.context = context

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.context.result()
        contexts = [m.serialize(mode) for m in result]
        return [x for xs in contexts for x in xs]


def deserialize(
    context: list[dict[str, Any]],
) -> DependentContext:  # Only support dependent for now
    ret: DependentContext = DependentContext(PdlList([]))
    for message in context:
        if isinstance(message, dict):
            if "role" not in message:
                assert False
            if "content" not in message:
                assert False
            ret = DependentContext(PdlList([ret, BaseMessage(message)]))
        else:
            ret = DependentContext(PdlList([ret, message]))

    return ret
