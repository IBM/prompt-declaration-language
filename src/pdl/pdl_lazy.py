from abc import abstractmethod
from collections.abc import Mapping, Sequence
from concurrent.futures import Future
from typing import Any, Callable, Generic, TypeVar, Union

LazyDataT = TypeVar("LazyDataT")


class PdlLazy(Generic[LazyDataT]):
    """A value of this type `PdlLazy[T]` is a suspended computation that returns a value of `T` type."""

    @abstractmethod
    def result(self) -> LazyDataT:
        """Recursively force the execution of the suspended computation."""

    @property
    @abstractmethod
    def data(self) -> Any:
        """Returns the underlying data structure without recursively executing the underlying suspended computations."""


PdlConstT = TypeVar("PdlConstT")


class PdlConst(PdlLazy[PdlConstT]):
    def __init__(self, data: PdlConstT | Future[PdlConstT]):
        self._data = data

    @property
    def data(self):
        return self._data

    def __repr__(self):
        return self.result().__repr__()

    def result(self) -> PdlConstT:
        while isinstance(self._data, (Future, PdlLazy)):
            self._data = self._data.result()
        return self._data  # pyright: ignore


PdlListElemT = TypeVar("PdlListElemT")


class PdlList(Sequence[PdlListElemT], PdlLazy[list[PdlListElemT]]):
    def __init__(
        self,
        data: (
            list[PdlListElemT]
            | Future[list[PdlListElemT]]
            | PdlLazy[list[PdlListElemT]]
        ),
    ):
        self._data = data

    @property
    def data(self) -> Union[list[PdlListElemT], "PdlList"]:
        while not isinstance(self._data, (list, PdlList)):
            if isinstance(self._data, Future):
                self._data = self._data.result()
            if isinstance(self._data, PdlLazy):
                self._data = self._data.data
        return self._data

    def __getitem__(self, index: int | slice):  # pyright: ignore
        if isinstance(index, slice):
            return PdlList(self.data[index])  # pyright: ignore
        v = self.data[index]
        if isinstance(v, PdlLazy):
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
    Mapping[PdlDictKeyT, PdlDictElemT], PdlLazy[dict[PdlDictKeyT, PdlDictElemT]]
):
    def __init__(
        self,
        data: (
            dict[PdlDictKeyT, PdlDictElemT]
            | Future[dict[PdlDictKeyT, PdlDictElemT]]
            | PdlLazy[dict[PdlDictKeyT, PdlDictElemT]]
        ),
    ):
        self._data = data

    @property
    def data(self):
        while not isinstance(self._data, Mapping):
            if isinstance(self._data, Future):
                self._data = self._data.result()
            if isinstance(self._data, PdlLazy):
                self._data = self._data.data
        return self._data

    def __getitem__(self, key):  # pyright: ignore
        v = self.data[key]
        if isinstance(v, PdlLazy):
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

    def __or__(self, value: Union["PdlLazy", dict]):
        if isinstance(value, PdlLazy):
            d = value.data
        else:
            d = value
        return PdlDict(self.data | d)  # pyright: ignore

    def result(self):  # pyright: ignore
        return dict(self)


ApplyInputT = TypeVar("ApplyInputT")
ApplyOutputT = TypeVar("ApplyOutputT")


class PdlApply(PdlLazy[ApplyOutputT]):
    def __init__(
        self, f: Callable[[ApplyInputT], ApplyOutputT], x: PdlLazy[ApplyInputT]
    ):
        self._data: ApplyOutputT
        self.f = f
        self.x = x
        self._done = False

    @property
    def data(self):
        return self.result()

    def __repr__(self):
        return self.result().__repr__()

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
    f: Callable[[LazyApplyInputT], LazyApplyOutputT], x: PdlLazy[LazyApplyInputT]
) -> PdlLazy[LazyApplyOutputT]:
    return PdlApply(f, x)


Apply2Input1T = TypeVar("Apply2Input1T")  # pylint: disable=invalid-name
Apply2Input2T = TypeVar("Apply2Input2T")  # pylint: disable=invalid-name
Apply2OutputT = TypeVar("Apply2OutputT")  # pylint: disable=invalid-name


class PdlApply2(PdlLazy[Apply2OutputT]):
    def __init__(
        self,
        f: Callable[[Apply2Input1T, Apply2Input2T], Apply2OutputT],
        x1: PdlLazy[Apply2Input1T],
        x2: PdlLazy[Apply2Input2T],
    ):
        self._data: Apply2OutputT
        self.f = f
        self.x1 = x1
        self.x2 = x2
        self._done = False

    @property
    def data(self):
        return self.result()

    def __repr__(self):
        return self.result().__repr__()

    def result(self) -> Apply2OutputT:
        if self._done:
            return self._data
        if isinstance(self.x1, PdlLazy):
            v1 = self.x1.result()
        else:
            v1 = self.x1
        if isinstance(self.x2, PdlLazy):
            v2 = self.x2.result()
        else:
            v2 = self.x2
        self._data = self.f(v1, v2)
        self._done = True
        return self._data


LazyApply2Input1T = TypeVar("LazyApply2Input1T")  # pylint: disable=invalid-name
LazyApply2Input2T = TypeVar("LazyApply2Input2T")  # pylint: disable=invalid-name
LazyApply2OutputT = TypeVar("LazyApply2OutputT")  # pylint: disable=invalid-name


def lazy_apply2(
    f: Callable[[LazyApply2Input1T, LazyApply2Input2T], LazyApply2OutputT],
    x1: PdlLazy[LazyApply2Input1T],
    x2: PdlLazy[LazyApply2Input2T],
) -> PdlLazy[LazyApply2OutputT]:
    return PdlApply2(f, x1, x2)
