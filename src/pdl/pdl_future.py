from abc import abstractmethod
from collections.abc import Mapping, Sequence
from concurrent.futures import Future
from typing import Any, Callable, Generic, TypeVar, Union

FutureDataT = TypeVar("FutureDataT")


class PdlFuture(Generic[FutureDataT]):
    """A value of this type `PdlFuture[T]` is a suspended computation that returns a value of `T` type."""

    @abstractmethod
    def result(self) -> FutureDataT:
        """Recursively force the execution of the suspended computation."""

    @property
    @abstractmethod
    def data(self) -> Any:
        """Returns the underlying data structure without recursively executing the underlying suspended computations."""


PdlConstT = TypeVar("PdlConstT")


class PdlConst(PdlFuture[PdlConstT]):
    def __init__(self, data: PdlConstT | Future[PdlConstT]):
        self._data = data

    @property
    def data(self):
        return self._data

    def __repr__(self):
        return self.result().__repr__()

    def result(self) -> PdlConstT:
        while isinstance(self._data, (Future, PdlFuture)):
            self._data = self._data.result()
        return self._data  # pyright: ignore


PdlListElemT = TypeVar("PdlListElemT")


class PdlList(Sequence[PdlListElemT], PdlFuture[list[PdlListElemT]]):
    def __init__(
        self,
        data: (
            list[PdlListElemT]
            | Future[list[PdlListElemT]]
            | PdlFuture[list[PdlListElemT]]
        ),
    ):
        self._data = data

    @property
    def data(self) -> Union[list[PdlListElemT], "PdlList"]:
        while not isinstance(self._data, (list, PdlList)):
            if isinstance(self._data, Future):
                self._data = self._data.result()
            if isinstance(self._data, PdlFuture):
                self._data = self._data.data
        return self._data

    def __getitem__(self, index: int | slice):  # pyright: ignore
        if isinstance(index, slice):
            return PdlList(self.data[index])  # pyright: ignore
        v = self.data[index]
        if isinstance(v, PdlFuture):
            v = v.result()
        return v

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return self.result().__repr__()

    def __add__(self, value: Union["PdlList", list]):
        if isinstance(value, PdlList):
            other = value.data
        else:
            other = value
        return PdlList(self.data + other)  # type: ignore

    def result(self):
        return list(self)


PdlDictKeyT = TypeVar("PdlDictKeyT")
PdlDictElemT = TypeVar("PdlDictElemT")


class PdlDict(
    Mapping[PdlDictKeyT, PdlDictElemT], PdlFuture[dict[PdlDictKeyT, PdlDictElemT]]
):
    def __init__(
        self,
        data: (
            dict[PdlDictKeyT, PdlDictElemT]
            | Future[dict[PdlDictKeyT, PdlDictElemT]]
            | PdlFuture[dict[PdlDictKeyT, PdlDictElemT]]
        ),
    ):
        self._data = data

    @property
    def data(self):
        while not isinstance(self._data, Mapping):
            if isinstance(self._data, Future):
                self._data = self._data.result()
            if isinstance(self._data, PdlFuture):
                self._data = self._data.data
        return self._data

    def __getitem__(self, key):  # pyright: ignore
        v = self.data[key]
        if isinstance(v, PdlFuture):
            result = v.result()
        else:
            result = v
        return result

    def __iter__(self):
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return self.result().__repr__()

    def __or__(self, value: Union["PdlDict", dict]):
        if isinstance(value, PdlDict):
            d = value.data
        else:
            d = value
        return PdlDict(self.data | d)  # pyright: ignore

    def result(self):  # pyright: ignore
        return dict(self)


ApplyInputT = TypeVar("ApplyInputT")
ApplyOutputT = TypeVar("ApplyOutputT")


class PdlApply(PdlFuture[ApplyOutputT]):
    def __init__(
        self, f: Callable[[ApplyInputT], ApplyOutputT], x: PdlFuture[ApplyInputT]
    ):
        self._data: ApplyOutputT
        self.f = f
        self.x = x
        self._done = False

    @property
    def data(self):
        return self.result()

    def result(self) -> ApplyOutputT:
        if self._done:
            return self._data
        v = self.x.result()
        self._data = self.f(v)
        self._done = True
        return self._data


LazyApplyInputT = TypeVar("LazyApplyInputT")
LazyApplyOutputT = TypeVar("LazyApplyOutputT")


def lazy_apply(
    f: Callable[[LazyApplyInputT], LazyApplyOutputT], x: PdlFuture[LazyApplyInputT]
) -> PdlFuture[LazyApplyOutputT]:
    future = PdlApply(f, x)
    return future


Apply2Input1T = TypeVar("Apply2Input1T")  # pylint: disable=invalid-name
Apply2Input2T = TypeVar("Apply2Input2T")  # pylint: disable=invalid-name
Apply2OutputT = TypeVar("Apply2OutputT")  # pylint: disable=invalid-name


class PdlApply2(PdlFuture[Apply2OutputT]):
    def __init__(
        self,
        f: Callable[[Apply2Input1T, Apply2Input2T], Apply2OutputT],
        x1: PdlFuture[Apply2Input1T],
        x2: PdlFuture[Apply2Input2T],
    ):
        self._data: Apply2OutputT
        self.f = f
        self.x1 = x1
        self.x2 = x2
        self._done = False

    @property
    def data(self):
        return self.result()

    def result(self) -> Apply2OutputT:
        if self._done:
            return self._data
        v1 = self.x1.result()
        v2 = self.x2.result()
        self._data = self.f(v1, v2)
        self._done = True
        return self._data


LazyApply2Input1T = TypeVar("LazyApply2Input1T")  # pylint: disable=invalid-name
LazyApply2Input2T = TypeVar("LazyApply2Input2T")  # pylint: disable=invalid-name
LazyApply2OutputT = TypeVar("LazyApply2OutputT")  # pylint: disable=invalid-name


def lazy_apply2(
    f: Callable[[LazyApply2Input1T, LazyApply2Input2T], LazyApply2OutputT],
    x1: PdlFuture[LazyApply2Input1T],
    x2: PdlFuture[LazyApply2Input2T],
) -> PdlFuture[LazyApply2OutputT]:
    future = PdlApply2(f, x1, x2)
    return future
