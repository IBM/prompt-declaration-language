# pylint: disable=import-outside-toplevel
import asyncio
import threading
from concurrent.futures import Future
from typing import Any, Callable, Generator, TypeVar

import httpx
from dotenv import load_dotenv

from .pdl_ast import (
    ErrorBlock,
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
                import litellm

                litellm.suppress_debug_info = True
            from litellm import acompletion

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
        from litellm import completion

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
