from abc import ABC, abstractmethod
from collections.abc import Sequence
from enum import StrEnum
from typing import Any, Callable

from .pdl_lazy import PdlApply, PdlConst, PdlDict, PdlLazy, PdlList

# def _default(self, obj):
#    return getattr(obj.__class__, "to_json", _default.default)(obj) # pyright: ignore

# _default.default = JSONEncoder().default  # pyright: ignore
# JSONEncoder.default = _default   # pyright: ignore

# TODO:
# We could make only DependentContext implement Sequence, IndependentContext could implement Set instead. Review how getItem should be implemented.
# Should single message (result of a block) be flattened in the interpreter?
# Serialization


class SerializeMode(StrEnum):
    LITELLM = "litellm"
    GRANITEIO = "graniteio"


class PDLContext(ABC, Sequence):

    @abstractmethod
    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]: ...

    def __add__(self, value: "PDLContext"):
        return IndependentContext([self, value])

    def __mul__(self, value: "PDLContext"):
        return DependentContext([self, value])

    # def to_json(self):
    #    return json.dumps(self.serialize(SerializeMode.LITELLM))


class SingletonContext(PDLContext):
    message: PdlLazy[dict[str, Any]]

    def __init__(self, message: PdlLazy[dict[str, Any]]):
        self.message = message

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.message.result()
        return [result]

    def __len__(self):
        return 1

    def __getitem__(self, index: int | slice):  # pyright: ignore
        return [self.message.result()][index]

    def __repr__(self):  # pyright: ignore
        return self.message.result().__repr__()


class IndependentContext(PDLContext):
    context: PdlLazy[list[PDLContext]]

    def __init__(self, context: list[PDLContext]):
        ret: list[PDLContext] = []
        for item in context:
            if isinstance(item, IndependentContext):
                ret += item.context.data
            elif isinstance(item, SingletonContext):
                ret += [item]
            elif isinstance(item, DependentContext) and len(item) == 0:
                pass
            else:
                # Not all elements of the list are Independent, so return
                self.context = PdlList(context)
                return
        # All elements of the list are Independent
        self.context = PdlList(ret)

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.context.result()
        contexts = [m.serialize(mode) for m in result]
        flat = [x for xs in contexts for x in xs]
        if mode == SerializeMode.GRANITEIO:
            return [{"independent": flat}]
        return flat

    def __len__(self):  # pyright: ignore
        return len(self.context.result())

    def __getitem__(self, index: int | slice):  # pyright: ignore
        return self.serialize(SerializeMode.LITELLM)[index]

    def __repr__(self):  # pyright: ignore
        ret = "{"
        ret += ",".join([i.__repr__() for i in self.context.result()])
        return ret + "}"


class DependentContext(PDLContext):
    context: PdlLazy[list[PDLContext]]

    def __init__(self, context: list[PDLContext]):
        ret: list[PDLContext] = []
        for item in context:
            if isinstance(item, DependentContext):
                ret += item.context.data
            elif isinstance(item, SingletonContext):
                ret += [item]
            elif isinstance(item, IndependentContext) and len(item) == 0:
                pass
            else:
                # Not all elements of the list are Dependent, so return
                self.context = PdlList(context)
                return
        # All elements of the list are Dependent
        self.context = PdlList(ret)

    def serialize(self, mode: SerializeMode) -> list[dict[str, Any]]:
        result = self.context.result()
        contexts = [m.serialize(mode) for m in result]
        res = [x for xs in contexts for x in xs]
        return res

    def __len__(self):  # pyright: ignore
        return len(self.context.result())

    def __getitem__(self, index: int | slice):  # pyright: ignore
        return self.serialize(SerializeMode.LITELLM)[index]

    def __repr__(self):  # pyright: ignore
        ret = "["
        ret += ",".join([i.__repr__() for i in self.context.result()])
        return ret + "]"


def ensure_context(context: dict | list | PDLContext) -> PDLContext:
    ctx: PDLContext
    match context:
        case dict():
            ctx = SingletonContext(PdlConst(context))
        case list():
            ctx = DependentContext([ensure_context(c) for c in context])
        case PDLContext():
            ctx = context
        case _:
            raise TypeError(f"'{type(context)}' object is not a valid context")
    return ctx


def deserialize(
    context: list[dict[str, Any]],
) -> DependentContext:  # Only support dependent for now
    ret: DependentContext = DependentContext([])
    for message in context:
        if isinstance(message, dict):
            ret = ret * SingletonContext(PdlDict(message))
        else:
            ret = ret * message
    return ret


def add_done_callback(
    f: Callable, p: PDLContext
):  # Assuming that f is the identity function
    match p:
        case SingletonContext(message=m):
            p.message = PdlApply(f, m)
        case DependentContext(context=c):
            p.context = PdlApply(f, c)
        case IndependentContext(context=c):
            p.context = PdlApply(f, c)
        case _:
            assert False
