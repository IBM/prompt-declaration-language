import json
from typing import Any, Generator, Optional

import litellm
from dotenv import load_dotenv
from genai.client import Client as BamClient
from genai.credentials import Credentials as BamCredentials
from genai.schema import ModerationParameters as BamModerationParameters
from genai.schema import PromptTemplateData as BamPromptTemplateData
from litellm import completion

from .pdl_ast import (
    BamTextGenerationParameters,
    Message,
    set_default_granite_model_parameters,
    set_default_model_params,
)

# Load environment variables
load_dotenv()

# class Model(ABC):
#     @staticmethod
#     @abstractmethod
#     def generate_text(*args, **kargs):
#         pass

#     @staticmethod
#     @abstractmethod
#     def generate_text_stream(*args, **kargs):
#         pass


# class BamModel(Model):
class BamModel:
    bam_client: Optional[BamClient] = None

    @staticmethod
    def get_model() -> BamClient:
        if BamModel.bam_client is not None:
            return BamModel.bam_client
        credentials = BamCredentials.from_env()
        BamModel.bam_client = BamClient(credentials=credentials)
        return BamModel.bam_client

    @staticmethod
    def generate_text(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[dict | BamTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> tuple[Message, Any]:
        client = BamModel.get_model()
        params = set_default_model_params(parameters)
        text = ""
        responses = []
        for response in client.text.generation.create(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params,
            moderations=moderations,
            data=data,
        ):
            # XXX TODO: moderation
            responses.append(response)
            for result in response.results:
                if result.generated_text:
                    text += result.generated_text
        return {"role": None, "content": text}, responses

    @staticmethod
    def generate_text_stream(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[dict | BamTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> Generator[Message, Any, Any]:
        client = BamModel.get_model()
        params = set_default_model_params(parameters)
        responses = []
        for response in client.text.generation.create_stream(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params,
            moderations=moderations,
            data=data,
        ):
            responses.append(json.loads(response.model_dump_json()))
            if response.results is None:
                # append_log(
                #     state,
                #     "Moderation",
                #     f"Generate from: {model_input}",
                # )
                continue
            for result in response.results:
                if result.generated_text:
                    yield {"role": None, "content": result.generated_text}
        return responses

    # @staticmethod
    # def generate_text_lazy(  # pylint: disable=too-many-arguments
    #     model_id: str,
    #     prompt_id: Optional[str],
    #     model_input: Optional[str],
    #     parameters: Optional[PDLTextGenerationParameters],
    #     moderations: Optional[BamModerationParameters],
    #     data: Optional[BamPromptTemplateData],
    # ) -> Generator[None, Any, str]:
    #     client = BamModel.get_model()
    #     params = parameters
    #     params = set_default_model_params(params)
    #     gen = client.text.generation.create(
    #         model_id=model_id,
    #         prompt_id=prompt_id,
    #         input=model_input,
    #         parameters=params.__dict__,
    #         moderations=moderations,
    #         data=data,
    #     )

    #     def get_text():
    #         text = ""
    #         for response in gen:
    #             # XXX TODO: moderation
    #             for result in response.results:
    #                 if result.generated_text:
    #                     text += result.generated_text
    #         return text

    #     return gen_text


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
        if "granite" in model_id and "granite-20b-code-instruct-r1.1" not in model_id:
            parameters = set_default_granite_model_parameters(
                model_id, spec, parameters
            )
        if parameters.get("mock_response") is not None:
            litellm.suppress_debug_info = True
        response = completion(
            model=model_id, messages=messages, stream=False, **parameters
        )
        msg = response.choices[0].message  # pyright: ignore
        if msg.content is None:
            return {
                "role": msg.role,
                "content": "",
            }, response.json()  # pyright: ignore
        return {
            "role": msg.role,
            "content": msg.content,
        }, response.json()  # pyright: ignore

    @staticmethod
    def generate_text_stream(
        model_id: str,
        messages: list[Message],
        spec: Any,
        parameters: dict[str, Any],
    ) -> Generator[Message, Any, Any]:
        if "granite" in model_id and "granite-20b-code-instruct-r1.1" not in model_id:
            parameters = set_default_granite_model_parameters(
                model_id, spec, parameters
            )
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
            if msg.content is None:
                continue
            yield {"role": msg.role, "content": msg.content}
        return result
