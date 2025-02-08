from abc import abstractmethod
from collections.abc import Mapping, Sequence
from concurrent.futures import Future
from typing import Callable, Generic, TypeVar, Union

FutureDataT = TypeVar("FutureDataT")


class PdlFuture(Generic[FutureDataT]):
    @abstractmethod
    def result(self) -> FutureDataT:
        pass

    @property
    @abstractmethod
    def data(self) -> FutureDataT:
        pass


PdlConstT = TypeVar("PdlConstT")


class PdlConst(PdlFuture[PdlConstT]):
    def __init__(self, data: PdlConstT | Future[PdlConstT]):
        if isinstance(data, Future):
            self._data = None
            self._future_data = data
        else:
            self._data = data

    @property
    def data(self):
        if self._data is None:
            self._data = self._future_data.result()
        return self._data

    def result(self) -> PdlConstT:
        v = self.data
        if isinstance(v, PdlFuture):
            v = v.result()
        return v  # pyright: ignore


PdlListElemT = TypeVar("PdlListElemT")


class PdlList(Sequence[PdlListElemT], PdlFuture[list[PdlListElemT]]):
    def __init__(self, data: list[PdlListElemT] | Future[list[PdlListElemT]]):
        if isinstance(data, Future):
            self._data = None
            self._future_data = data
        else:
            self._data = data

    @property
    def data(self):
        if self._data is None:
            self._data = self._future_data.result()
        return self._data

    def __getitem__(self, index: int | slice):  # pyright: ignore
        if isinstance(index, slice):
            return PdlList(self.data[index])
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
        return PdlList(self.data + other)

    def result(self):
        return list(self)


PdlDictKeyT = TypeVar("PdlDictKeyT")
PdlDictElemT = TypeVar("PdlDictElemT")


class PdlDict(
    Mapping[PdlDictKeyT, PdlDictElemT], PdlFuture[dict[PdlDictKeyT, PdlDictElemT]]
):
    def __init__(
        self,
        data: dict[PdlDictKeyT, PdlDictElemT] | Future[dict[PdlDictKeyT, PdlDictElemT]],
    ):
        if isinstance(data, Future):
            self._data = None
            self._future_data = data
        else:
            self._data = data

    @property
    def data(self):
        if self._data is None:
            self._data = self._future_data.result()
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
        return PdlDict(self.data | d)

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
