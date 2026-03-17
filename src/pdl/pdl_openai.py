# pylint: disable=import-outside-toplevel
from asyncio import run_coroutine_threadsafe
from os import environ
from sys import stderr
from typing import Any, Generator

import httpx
from dotenv import load_dotenv

from .pdl_ast import (
    ErrorBlock,
    LazyMessage,
    ModelInput,
    OpenaiModelBlock,
    PDLRuntimeError,
)
from .pdl_interpreter_state import InterpreterState
from .pdl_lazy import PdlConst, PdlLazy, lazy_apply
from .pdl_schema_utils import pdltype_to_jsonschema
from .pdl_utils import message_post_processing

# Load environment variables
load_dotenv()


class OpenaiModel:
    @staticmethod
    def _get_client_config(parameters: dict[str, Any]) -> dict[str, Any]:
        """Extract client configuration from parameters."""
        config = {}

        # Extract client config fields
        if "api_key" in parameters and parameters["api_key"] is not None:
            config["api_key"] = parameters.pop("api_key")
        elif "OPENAI_API_KEY" in environ:
            config["api_key"] = environ["OPENAI_API_KEY"]

        if "base_url" in parameters and parameters["base_url"] is not None:
            config["base_url"] = parameters.pop("base_url")

        if "organization" in parameters:
            if parameters["organization"] is not None:
                config["organization"] = parameters.pop("organization")
            else:
                parameters.pop("organization")

        return config

    @staticmethod
    def _get_client(config: dict[str, Any]):
        """Create and return an OpenAI client with the given configuration."""
        from openai import OpenAI

        return OpenAI(**config)

    @staticmethod
    def _prepare_parameters(
        block: OpenaiModelBlock,
        parameters: dict[str, Any],
    ) -> dict[str, Any]:
        """Prepare parameters for the OpenAI API call."""
        spec = block.spec
        if block.structuredDecoding and spec is not None:
            if (
                "response_format" not in parameters
                or parameters["response_format"] is None
            ):
                schema = pdltype_to_jsonschema(spec, True)
                parameters["response_format"] = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "schema",
                        "schema": schema,
                        "strict": True,
                    },
                }
        return parameters

    @staticmethod
    async def async_generate_text(
        block: OpenaiModelBlock,
        model_id: str,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[dict[str, Any], Any]:
        try:
            # Extract client configuration
            client_config = OpenaiModel._get_client_config(parameters)
            client = OpenaiModel._get_client(client_config)

            # Prepare parameters
            parameters = OpenaiModel._prepare_parameters(block, parameters)

            # Make the API call
            response = client.chat.completions.create(
                model=model_id,
                messages=list(messages),  # pyright: ignore
                stream=False,
                **parameters,
            )

            msg = response.choices[0].message
            message_dict = {
                "role": msg.role if msg.role else "assistant",
                "content": msg.content,
            }
            if msg.tool_calls:
                message_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in msg.tool_calls
                ]

            return (
                message_post_processing(message_dict),
                response.model_dump(),
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
        state: InterpreterState,
        block: OpenaiModelBlock,
        model_id: str,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        if "PDL_VERBOSE_ASYNC" in environ:
            print(f"Asynchronous model call started to {model_id}", file=stderr)
        future = run_coroutine_threadsafe(
            OpenaiModel.async_generate_text(
                block,
                model_id,
                messages,
                parameters,
            ),
            state.event_loop,
        )
        pdl_future: PdlLazy[tuple[dict[str, Any], Any]] = PdlConst(future)
        message = lazy_apply((lambda x: x[0]), pdl_future)
        response = lazy_apply((lambda x: x[1]), pdl_future)

        # update the end timestamp when the future is done
        def update_end_nanos(future):
            import time

            result = future.result()[1]
            if (
                block.pdl__usage is not None
                and result.get("usage") is not None
                and result["usage"].get("completion_tokens") is not None
                and result["usage"].get("prompt_tokens") is not None
            ):
                block.pdl__usage.model_calls = 1
                block.pdl__usage.completion_tokens = result["usage"][
                    "completion_tokens"
                ]
                block.pdl__usage.prompt_tokens = result["usage"]["prompt_tokens"]
                state.add_usage(block.pdl__usage)

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
                    if msg.get("content") is not None:
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
        block: OpenaiModelBlock,
        model_id: str,
        messages: ModelInput,
        parameters: dict[str, Any],
    ) -> Generator[dict[str, Any], Any, Any]:
        # Extract client configuration
        client_config = OpenaiModel._get_client_config(parameters)
        client = OpenaiModel._get_client(client_config)

        # Prepare parameters
        parameters = OpenaiModel._prepare_parameters(block, parameters)

        # Make the streaming API call
        response = client.chat.completions.create(
            model=model_id,
            messages=list(messages),  # pyright: ignore
            stream=True,
            stream_options={"include_usage": True},
            **parameters,
        )

        result = []
        for chunk in response:
            chunk_dict = chunk.model_dump()
            result.append(chunk_dict)
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                delta_dict = {
                    "role": delta.role if delta.role else "assistant",
                    "content": delta.content if delta.content else "",
                }
                if delta.tool_calls:
                    delta_dict["tool_calls"] = [
                        {
                            "index": tc.index,
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name if tc.function else None,
                                "arguments": (
                                    tc.function.arguments if tc.function else None
                                ),
                            },
                        }
                        for tc in delta.tool_calls
                    ]
                yield message_post_processing(delta_dict)
        return result
