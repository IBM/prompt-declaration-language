from dataclasses import dataclass
from enum import Enum
from typing import Any, Generator, Generic, Optional, TypeVar

from genai.schema import ModerationParameters, PromptTemplateData

from .pdl_ast import BamTextGenerationParameters
from .pdl_llms import BamModel

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


class MessageKind(Enum):
    OUTPUT = 0
    MODEL = 1


class YieldMessage:
    kind: MessageKind


@dataclass
class OutputMessage(YieldMessage):
    kind = MessageKind.OUTPUT
    output: str


@dataclass
class ModelCallMessage(YieldMessage):
    kind = MessageKind.MODEL
    model_id: str
    model_input: str
    prompt_id: Optional[str]
    parameters: Optional[dict | BamTextGenerationParameters]
    moderations: Optional[ModerationParameters]
    data: Optional[PromptTemplateData]


def schedule(
    generators: list[Generator[YieldMessage, Any, GeneratorReturnT]]
) -> list[GeneratorReturnT]:
    todo: list[tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]]
    todo_next: list[
        tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]
    ] = []
    done: list[Optional[GeneratorReturnT]]
    todo = [(i, gen, None) for i, gen in enumerate(generators)]
    done = [None for _ in generators]
    while len(todo) > 0:
        for i, gen, v in todo:
            try:
                msg = gen.send(v)
                match msg:
                    case OutputMessage(output=output):
                        print(output, end="")
                        todo_next.append((i, gen, None))
                    case ModelCallMessage():
                        text = BamModel.generate_text(
                            model_id=msg.model_id,
                            prompt_id=msg.prompt_id,
                            model_input=msg.model_input,
                            parameters=msg.parameters,
                            moderations=msg.moderations,
                            data=msg.data,
                        )
                        todo_next.append((i, gen, text))
                    case _:
                        assert False
            except StopIteration as e:
                done[i] = e.value
        todo = todo_next
        todo_next = []
    return done  # type: ignore


# def schedule(
#     generators: list[Generator[YieldMessage, Any, GeneratorReturnT]]
# ) -> list[GeneratorReturnT]:
#     todo: list[tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]]
#     todo_next: list[
#         tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]
#     ] = []
#     done: list[Optional[GeneratorReturnT]]
#     todo = [(i, gen, None) for i, gen in enumerate(generators)]
#     to_call = {}
#     done = [None for _ in generators]
#     while len(todo) > 0:
#         for i, gen, v in todo:
#             try:
#                 msg = gen.send(v)
#                 match msg:
#                     case OutputMessage(output=output):
#                         print(output, end="")
#                         todo_next.append((i, gen, None))
#                     case ModelCallMessage():
#                         cfg = {
#                             "model_id": msg.model_id,
#                             "prompt_id": msg.prompt_id,
#                             "parameters": msg.parameters,
#                             "moderations": msg.moderations,
#                             "data": msg.data,
#                         }
#                         # l = to_call.get(cfg, [])
#                         # to_call[cfg] = l + [(i, gen, msg.input)]
#                         l = to_call.get("XXX", [])
#                         to_call["XXX"] = l + [(cfg, (i, gen, msg.client, msg.input))]
#                     case _:
#                         assert False
#             except StopIteration as e:
#                 done[i] = e.value
#         # for cfg, l in to_call.items():
#         for cfg_l in to_call.values():
#             cfg, l = cfg_l
#             inputs = [input for _, _, input in l]
#             responses = msg.client.text.generation.create(inputs=inputs, **cfg)
#             for (i, gen, _), response in zip(l, responses):
#                 todo_next.append((i, gen, response))
#         to_call = {}
#         todo = todo_next
#         todo_next = []
#         to_call = {}
#     return done  # type: ignore
