
from abc import abstractmethod
import asyncio
from collections.abc import Mapping, Sequence
from concurrent.futures import Future
from typing import Callable, Generic, TypeVar, Union


FutureDataT = TypeVar("FutureDataT")

class PdlFuture(Generic[FutureDataT]):
    @abstractmethod
    def result(self) -> FutureDataT:
        pass

PdlConstT = TypeVar("PdlConstT")

class PdlConst(PdlFuture[PdlConstT]):
    def __init__(self, data: PdlConstT):
        self.data = data
    
    def result(self) -> PdlConstT:
        v = self.data
        if isinstance(v, Future):
            v = v.result()
        if isinstance(v, PdlFuture):
            v = v.result()
        return v  # pyright: ignore


PdlListElemT = TypeVar("PdlListElemT")

class PdlList(Sequence[PdlListElemT], PdlFuture[list[PdlListElemT]]):
    def __init__(self, data: list[PdlListElemT]):
        self.data = data

    def __getitem__(self, index: int | slice):  # pyright: ignore
        if isinstance(index, slice):
            assert False, "'PdlArray' object does not support slice index"
        v = self.data[index]
        print(f"XXXX {index}: {v}")
        if isinstance(v, Future):
            v = v.result()
        if isinstance(v, PdlFuture):
            v = v.result()
        return v

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        return self.result().__repr__()

    def result(self):
        return list(self)



PdlDictKeyT = TypeVar("PdlDictKeyT")
PdlDictElemT = TypeVar("PdlDictElemT")


class PdlDict(Mapping[PdlDictKeyT, PdlDictElemT], PdlFuture[dict[PdlDictKeyT, PdlDictElemT]]):
    def __init__(self, data: dict[PdlDictKeyT, PdlDictElemT] | Future[dict[PdlDictKeyT, PdlDictElemT]]):
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
        print(f"XXXX {key}: {v}")
        if isinstance(v, Future):
            v = v.result()
        if isinstance(v, PdlFuture):
            v = v.result()
        return v

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


    def result(self): # pyright: ignore
        return dict(self)

