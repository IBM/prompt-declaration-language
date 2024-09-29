from dataclasses import dataclass
from enum import Enum
from typing import Any, Generator, Generic, Optional, TypeVar

from genai.schema import ModerationParameters, PromptTemplateData
from termcolor import colored
from termcolor._types import Color

from .pdl_ast import BamTextGenerationParameters, Message
from .pdl_llms import BamModel
from .pdl_utils import stringify

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
    RESULT = 0
    BACKGROUND = 1
    MODEL = 2


class YieldMessage:
    kind: MessageKind
    color: Optional[Color]


@dataclass
class YieldResultMessage(YieldMessage):
    result: Any
    kind: MessageKind = MessageKind.RESULT
    color: Optional[Color] = None


@dataclass
class ModelYieldResultMessage(YieldResultMessage):
    color: Optional[Color] = "green"


@dataclass
class CodeYieldResultMessage(YieldResultMessage):
    color: Optional[Color] = "magenta"


@dataclass
class YieldBackgroundMessage(YieldMessage):
    kind = MessageKind.BACKGROUND
    background: list[Message]


@dataclass
class ModelCallMessage(YieldMessage):
    kind = MessageKind.MODEL
    model_id: str
    model_input: str
    prompt_id: Optional[str]
    parameters: Optional[dict | BamTextGenerationParameters]
    moderations: Optional[ModerationParameters]
    data: Optional[PromptTemplateData]


_LAST_ROLE = None


def schedule(
    generators: list[Generator[YieldMessage, Any, GeneratorReturnT]]
) -> list[GeneratorReturnT]:
    global _LAST_ROLE  # pylint: disable= global-statement
    todo: list[tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]]
    todo_next: list[tuple[int, Generator[YieldMessage, Any, GeneratorReturnT], Any]] = (
        []
    )
    done: list[Optional[GeneratorReturnT]]
    todo = [(i, gen, None) for i, gen in enumerate(generators)]
    done = [None for _ in generators]
    while len(todo) > 0:
        for i, gen, v in todo:
            try:
                msg = gen.send(v)
                match msg:
                    case (
                        ModelYieldResultMessage(result=result)
                        | CodeYieldResultMessage(result=result)
                        | YieldResultMessage(result=result)
                    ):
                        if msg.color is None:
                            text = stringify(result)
                        else:
                            text = colored(stringify(result), msg.color)
                        print(text, end="")
                        todo_next.append((i, gen, None))
                    case YieldBackgroundMessage(background=background):
                        if len(background) > 0 and background[0]["role"] == _LAST_ROLE:
                            s = background[0]["content"]
                            _LAST_ROLE = background[-1]["role"]
                            background = background[1:]
                        else:
                            s = "\n"
                        s += "\n".join(
                            [f"{msg['role']}: {msg['content']}" for msg in background]
                        )
                        print(s, end="")
                        todo_next.append((i, gen, None))
                    case ModelCallMessage():
                        text_msg = BamModel.generate_text(
                            model_id=msg.model_id,
                            prompt_id=msg.prompt_id,
                            model_input=msg.model_input,
                            parameters=msg.parameters,
                            moderations=msg.moderations,
                            data=msg.data,
                        )
                        todo_next.append((i, gen, text_msg))
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
