# pylint: disable=import-outside-toplevel
from asyncio import run_coroutine_threadsafe
from typing import Any, Optional

from granite_io.types import ChatCompletionInputs

from .pdl_ast import (
    ErrorBlock,
    GraniteioModelBlock,
    LazyMessage,
    ModelInput,
    PDLRuntimeError,
)
from .pdl_lazy import PdlConst, PdlLazy, lazy_apply
from .pdl_llms import _LOOP
from .pdl_utils import value_of_expr


class GraniteioModel:
    @staticmethod
    def processor_of_block(block: GraniteioModelBlock):
        model = value_of_expr(block.model)
        backend = value_of_expr(block.backend)
        assert isinstance(model, str), f"The model should be a string: {model}"
        assert isinstance(
            backend, (dict, str)
        ), f"The backend should be a string or a dictionary: {backend}"
        match backend:
            case {"transformers": device}:
                assert isinstance(backend, dict)
                from granite_io import make_backend

                backend = make_backend(
                    "transformers",
                    {
                        "model_name": model,
                        "device": device,
                    },
                )
            case backend_name if isinstance(backend_name, str):
                from granite_io import make_backend

                backend = make_backend(
                    backend_name,
                    {
                        "model_name": model,
                    },
                )
            case _:
                assert False, f"Unexpected backend: {backend}"
        if block.processor is None:
            processor_name = model
        else:
            processor_name = value_of_expr(block.processor)
        assert isinstance(
            processor_name, str
        ), f"The processor should be a string: {processor_name}"
        from granite_io import make_io_processor

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
        if block.parameters is None:
            parameters = None
        else:
            parameters = value_of_expr(block.parameters)
        try:
            assert parameters is None or isinstance(parameters, dict)
            io_processor = GraniteioModel.processor_of_block(block)
            inputs = GraniteioModel.build_message(messages, parameters)
            result = await io_processor.acreate_chat_completion(  # pyright: ignore
                inputs
            )
            try:  # TODO: update when new version of granite-io is released
                message = result.next_message.model_dump()
            except AttributeError:
                message = result.results[0].next_message.model_dump()
            raw_result = result.model_dump()
            return (
                message,
                raw_result,
            )
        except Exception as exc:
            message = (
                f"Error during '{value_of_expr(block.model)}' model call: {repr(exc)}"
            )
            loc = block.pdl__location
            raise PDLRuntimeError(
                message,
                loc=loc,
                trace=ErrorBlock(msg=message, pdl__location=loc, program=block),
            ) from exc

    @staticmethod
    def generate_text(
        block: GraniteioModelBlock,
        messages: ModelInput,
    ) -> tuple[LazyMessage, PdlLazy[Any]]:
        future = run_coroutine_threadsafe(
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
