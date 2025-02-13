import asyncio
import os
import threading
from concurrent.futures import Future
from typing import Any, Callable, Generator, TypeVar

import litellm
from dotenv import load_dotenv
from litellm import acompletion, completion

from .pdl_ast import LazyMessage, ModelInput, set_structured_decoding_parameters
from .pdl_lazy import PdlConst, PdlLazy, lazy_apply
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
# _BACKGROUND_TASKS = set()


class LitellmModel:
    @staticmethod
    async def async_generate_text(
        model_id: str,
        messages: ModelInput,
        spec: Any,
        parameters: dict[str, Any],
    ) -> tuple[dict[str, Any], Any]:
        parameters = set_structured_decoding_parameters(spec, parameters)
        if parameters.get("mock_response") is not None:
            litellm.suppress_debug_info = True
        response = await acompletion(
            model=model_id, messages=list(messages), stream=False, **parameters
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
        messages: ModelInput,
        spec: Any,
        parameters: dict[str, Any],
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        # global _BACKGROUND_TASKS
        future = asyncio.run_coroutine_threadsafe(
            LitellmModel.async_generate_text(
                model_id,
                messages,
                spec,
                parameters,
            ),
            _LOOP,
        )
        # _BACKGROUND_TASKS.add(future)
        # future.add_done_callback(_BACKGROUND_TASKS.discard)
        pdl_future: PdlLazy[tuple[dict[str, Any], Any]] = PdlConst(future)
        message = lazy_apply((lambda x: x[0]), pdl_future)
        response = lazy_apply((lambda x: x[1]), pdl_future)
        return message, response

    @staticmethod
    def generate_text_stream(
        model_id: str,
        messages: ModelInput,
        spec: Any,
        parameters: dict[str, Any],
    ) -> Generator[dict[str, Any], Any, Any]:
        parameters = set_structured_decoding_parameters(spec, parameters)
        response = completion(
            model=model_id,
            messages=list(messages),
            stream=True,
            **parameters,
        )
        result = []
        for chunk in response:
            result.append(chunk.json())  # pyright: ignore
            msg = chunk.choices[0].delta  # pyright: ignore
            if msg.role is None:
                msg.role = "assistant"
            yield remove_none_values_from_message(msg.model_dump())
        return result


MapInputT = TypeVar("MapInputT")
MapOutputT = TypeVar("MapOutputT")


def map_future(
    f: Callable[[MapInputT], MapOutputT], x: Future[MapInputT]
) -> Future[MapOutputT]:
    future = asyncio.run_coroutine_threadsafe(_async_call(f, x), _LOOP)
    return future


async def _async_call(f, x):
    v = x.result()
    return f(v)
