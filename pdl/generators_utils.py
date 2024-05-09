from typing import Any, Generator, Generic, TypeVar

GeneratorWrapperYieldT = TypeVar("GeneratorWrapperYieldT")
GeneratorWrapperSendT = TypeVar("GeneratorWrapperSendT")
GeneratorWrapperReturnT = TypeVar("GeneratorWrapperReturnT")


class GeneratorWrapper(
    Generic[GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT]
):
    value: GeneratorWrapperReturnT

    def __init__(
        self,
        gen: Generator[
            GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT
        ],
    ):
        self.gen = gen

    def __iter__(self):
        self.value = yield from self.gen


GeneratorReturnT = TypeVar("GeneratorReturnT")


def step_to_completion(gen: Generator[Any, Any, GeneratorReturnT]) -> GeneratorReturnT:
    w = GeneratorWrapper(gen)
    for _ in w:
        pass
    return w.value
