import asyncio
import os
import threading
from concurrent.futures import Future
from typing import Any, Callable, Generator, Optional, TypeVar

import httpx
import litellm
from dotenv import load_dotenv
from granite_io import make_backend, make_io_processor
from granite_io.types import ChatCompletionInputs
from litellm import acompletion, completion

from .pdl_ast import (
    ErrorBlock,
    GraniteioModelBlock,
    LazyMessage,
    LitellmModelBlock,
    ModelInput,
    PDLRuntimeError,
    set_structured_decoding_parameters,
)
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
        block: LitellmModelBlock,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[dict[str, Any], Any]:
        try:
            assert isinstance(block.model, str)
            model_id = block.model
            spec = block.spec
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
        except httpx.RequestError as exc:
            message = f"model '{block.model}' encountered {repr(exc)} trying to {exc.request.method} against {exc.request.url}"
            loc = block.location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, location=loc, program=block),
            ) from exc
        except Exception as exc:
            message = f"Error during '{block.model}' model call: {repr(exc)}"
            loc = block.location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, location=loc, program=block),
            ) from exc

    @staticmethod
    def generate_text(
        block: LitellmModelBlock,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        # global _BACKGROUND_TASKS
        future = asyncio.run_coroutine_threadsafe(
            LitellmModel.async_generate_text(
                block,
                messages,
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


class GraniteioModel:
    @staticmethod
    def processor_of_block(block: GraniteioModelBlock):
        assert isinstance(
            block.model, str
        ), f"The model should be a string: {block.model}"
        assert isinstance(
            block.backend, (dict, str)
        ), f"The backend should be a string or a dictionnary: {block.backend}"
        match block.backend:
            case {"transformers": device}:
                assert isinstance(block.backend, dict)
                backend = make_backend(
                    "transformers",
                    {
                        "model_name": block.model,
                        "device": device,
                    },
                )
            case backend_name if isinstance(backend_name, str):
                backend = make_backend(
                    backend_name,
                    {
                        "model_name": block.model,
                    },
                )
            case _:
                assert False, f"Unexpected backend: {block.backend}"
        processor_name = block.processor
        if processor_name is None:
            processor_name = block.model
        assert isinstance(
            processor_name, str
        ), f"The processor should be a string: {processor_name}"
        io_processor = make_io_processor(processor_name, backend=backend)
        return io_processor

    @staticmethod
    def build_message(
        messages: ModelInput,
        parameters: Optional[dict[str, Any]],
    ) -> ChatCompletionInputs:
        if parameters is None:
            parameters = {}
        inputs = {"messages": messages} | parameters
        return ChatCompletionInputs.model_validate(inputs)

    @staticmethod
    async def async_generate_text(
        block: GraniteioModelBlock,
        messages: ModelInput,
    ) -> tuple[dict[str, Any], Any]:
        try:
            assert block.parameters is None or isinstance(block.parameters, dict)
            io_processor = GraniteioModel.processor_of_block(block)
            inputs = GraniteioModel.build_message(messages, block.parameters)
            result = io_processor.create_chat_completion(inputs)  # pyright: ignore
            message = result.next_message.model_dump()
            raw_result = result.model_dump()
            return (
                message,
                raw_result,
            )
        except Exception as exc:
            message = f"Error during '{block.model}' model call: {repr(exc)}"
            loc = block.location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, location=loc, program=block),
            ) from exc

    @staticmethod
    def generate_text(
        block: GraniteioModelBlock,
        messages: ModelInput,
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        future = asyncio.run_coroutine_threadsafe(
            GraniteioModel.async_generate_text(
                block,
                messages,
            ),
            _LOOP,
        )
        pdl_future: PdlLazy[tuple[dict[str, Any], Any]] = PdlConst(future)
        message = lazy_apply((lambda x: x[0]), pdl_future)
        response = lazy_apply((lambda x: x[1]), pdl_future)
        return message, response

    # @staticmethod
    # def generate_text_stream(
    #     model_id: str,
    #     messages: ModelInput,
    #     spec: Any,
    #     parameters: dict[str, Any],
    # ) -> Generator[dict[str, Any], Any, Any]:
    #     parameters = set_structured_decoding_parameters(spec, parameters)
    #     response = completion(
    #         model=model_id,
    #         messages=list(messages),
    #         stream=True,
    #         **parameters,
    #     )
    #     result = []
    #     for chunk in response:
    #         result.append(chunk.json())  # pyright: ignore
    #         msg = chunk.choices[0].delta  # pyright: ignore
    #         if msg.role is None:
    #             msg.role = "assistant"
    #         yield remove_none_values_from_message(msg.model_dump())
    #     return result


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
