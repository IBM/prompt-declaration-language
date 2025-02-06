import asyncio
import os
import threading
from concurrent.futures import Future
from typing import Any, Callable, Generator, TypeVar

import litellm
from dotenv import load_dotenv
from litellm import acompletion

from .pdl_ast import Message, Messages, set_structured_decoding_parameters
from .pdl_future import PdlConst, PdlDict, PdlFuture
from .pdl_utils import remove_none_values_from_message

# Load environment variables
load_dotenv()

# If the environment has a configured OpenTelemetry exporter, tell LiteLLM
# to do OpenTelemetry callbacks for that exporter.  Note that this may
# require optional OpenTelemetry Python libraries that are not pyproject.toml,
# typically opentelemetry-api, opentelemetry-sdk,
# opentelemetry-exporter-otlp-proto-http, and opentelemetry-exporter-otlp-proto-grpc
if os.getenv("OTEL_EXPORTER") and os.getenv("OTEL_ENDPOINT"):
    litellm.callbacks = ["otel"]


def _start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


_LOOP = asyncio.new_event_loop()
_LOOP_THREAD = threading.Thread(
    target=_start_background_loop, args=(_LOOP,), daemon=True
)
_LOOP_THREAD.start()


class LitellmModel:
    @staticmethod
    async def async_generate_text(
        model_id: str,
        messages: Messages,
        spec: Any,
        parameters: dict[str, Any],
    ):
        parameters = set_structured_decoding_parameters(spec, parameters)
        if parameters.get("mock_response") is not None:
            litellm.suppress_debug_info = True
        response = await acompletion(
            model=model_id, messages=messages.result(), stream=False, **parameters
        )
        msg = response.choices[0].message  # pyright: ignore
        if msg.role is None:
            msg.role = "assistant"
        return (
            remove_none_values_from_message(msg.json()),
            response.json(),  # pyright: ignore
        )

    @staticmethod
    def generate_text(
        model_id: str,
        messages: Messages,
        spec: Any,
        parameters: dict[str, Any],
    ) -> tuple[Message, PdlFuture[Any]]:
        future = asyncio.run_coroutine_threadsafe(
            LitellmModel.async_generate_text(
                model_id,
                messages,
                spec,
                parameters,
            ),
            _LOOP,
        )
        message = map_future(lambda x: x[0], future)
        response = map_future(lambda x: x[1], future)
        return PdlDict(message), PdlConst(response)

    @staticmethod
    def generate_text_stream(
        model_id: str,
        messages: list[Message],
        spec: Any,
        parameters: dict[str, Any],
    ) -> Generator[Message, Any, Any]:
        # parameters = set_structured_decoding_parameters(spec, parameters)
        # response = completion(
        #     model=model_id,
        #     messages=messages,
        #     stream=True,
        #     **parameters,
        # )
        # result = []
        # for chunk in response:
        #     result.append(chunk.json())  # pyright: ignore
        #     msg = chunk.choices[0].delta  # pyright: ignore
        #     if msg.role is None:
        #         msg.role = "assistant"
        #     yield remove_none_values_from_message(msg.model_dump())
        # return result
        assert False, "XXX TODO XXX"  # TODO


MapInputT = TypeVar("MapInputT")
MapOutputT = TypeVar("MapOutputT")


def map_future(
    f: Callable[[MapInputT], MapOutputT], x: Future[MapInputT] | PdlFuture[MapInputT]
) -> Future[MapOutputT]:
    future = asyncio.run_coroutine_threadsafe(_async_call(f, x), _LOOP)
    return future


async def _async_call(f, x):
    v = await x
    return f(v)
