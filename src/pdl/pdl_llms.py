import os
from typing import Any, Generator, Optional

import litellm
from dotenv import load_dotenv
from litellm import completion

from .pdl_ast import Message, set_structured_decoding_parameters
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


class LitellmModel:
    litellm_client: Optional[None] = None

    @staticmethod
    def get_model() -> None:
        return None

    @staticmethod
    def generate_text(
        model_id: str,
        messages: list[Message],
        spec: Any,
        parameters: dict[str, Any],
    ) -> tuple[Message, Any]:
        parameters = set_structured_decoding_parameters(spec, parameters)
        if parameters.get("mock_response") is not None:
            litellm.suppress_debug_info = True
        response = completion(
            model=model_id, messages=messages, stream=False, **parameters
        )
        msg = response.choices[0].message  # pyright: ignore
        if msg.role is None:
            msg.role = "assistant"
        return (
            remove_none_values_from_message(msg.json()),
            response.json(),  # pyright: ignore
        )

    @staticmethod
    def generate_text_stream(
        model_id: str,
        messages: list[Message],
        spec: Any,
        parameters: dict[str, Any],
    ) -> Generator[Message, Any, Any]:
        parameters = set_structured_decoding_parameters(spec, parameters)
        response = completion(
            model=model_id,
            messages=messages,
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
