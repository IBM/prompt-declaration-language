# pylint: disable=import-outside-toplevel
import asyncio
import threading
from concurrent.futures import Future
from os import environ
from sys import stderr
from typing import Any, Callable, Generator, Optional, TypeVar

import httpx
from dotenv import load_dotenv

from .pdl_ast import (
    ErrorBlock,
    LazyMessage,
    LitellmModelBlock,
    ModelInput,
    PDLRuntimeError,
    PdlTypeType,
)
from .pdl_lazy import PdlConst, PdlLazy, lazy_apply
from .pdl_schema_utils import pdltype_to_jsonschema
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
        model_id: str,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[dict[str, Any], Any]:
        try:
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
            message = f"model '{model_id}' encountered {repr(exc)} trying to {exc.request.method} against {exc.request.url}"
            loc = block.pdl__location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, pdl__location=loc, program=block),
            ) from exc
        except Exception as exc:
            message = f"Error during '{model_id}' model call: {repr(exc)}"
            loc = block.pdl__location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, pdl__location=loc, program=block),
            ) from exc

    @staticmethod
    def generate_text(
        block: LitellmModelBlock,
        model_id: str,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        if "PDL_VERBOSE_ASYNC" in environ:
            print(f"Asynchronous model call started to {model_id}", file=stderr)
        # global _BACKGROUND_TASKS
        future = asyncio.run_coroutine_threadsafe(
            LitellmModel.async_generate_text(
                block,
                model_id,
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

        # update the end timestamp when the future is done
        def update_end_nanos(future):
            import time

            result = future.result()[1]
            if (
                block.pdl__usage is not None
                and result["usage"] is not None
                and result["usage"]["completion_tokens"] is not None
                and result["usage"]["prompt_tokens"] is not None
            ):
                block.pdl__usage.completion_tokens = result["usage"][
                    "completion_tokens"
                ]
                block.pdl__usage.prompt_tokens = result["usage"]["prompt_tokens"]

            if block.pdl__timing is not None:
                block.pdl__timing.end_nanos = time.time_ns()

                # report call completion and its duration
                start = (
                    block.pdl__timing.start_nanos
                    if block.pdl__timing.start_nanos is not None
                    else 0
                )
                exec_nanos = block.pdl__timing.end_nanos - start
                if "PDL_VERBOSE_ASYNC" in environ:
                    print(
                        f"Asynchronous model call to {model_id} completed in {(exec_nanos)/1000000}ms",
                        file=stderr,
                    )
                    msg = future.result()[0]
                    if msg["content"] is not None:
                        from termcolor import colored

                        from .pdl_ast import BlockKind
                        from .pdl_scheduler import color_of

                        print(
                            colored(msg["content"], color=color_of(BlockKind.MODEL)),
                            file=stderr,
                        )
                        print("\n", file=stderr)

        future.add_done_callback(update_end_nanos)

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
            stream_options={"include_usage": True},
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


def set_structured_decoding_parameters(
    spec: Optional[PdlTypeType],
    parameters: Optional[dict[str, Any]],
) -> dict[str, Any]:
    if parameters is None:
        parameters = {}

    if (
        spec is not None
        and "response_format" not in parameters
        and "guided_decoding_backend" not in parameters
    ):
        schema = pdltype_to_jsonschema(spec, True)

        parameters["guided_decoding_backend"] = "lm-format-enforcer"
        parameters["guided_json"] = schema
        parameters["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": "schema",
                "schema": schema,
                "strict": True,
            },
        }
    return parameters


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
