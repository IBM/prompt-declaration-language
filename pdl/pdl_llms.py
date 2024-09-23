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
    ) -> Message:
        client = BamModel.get_model()
        params = set_default_model_params(parameters)
        text = ""
        for response in client.text.generation.create(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params,
            moderations=moderations,
            data=data,
        ):
            # XXX TODO: moderation
            for result in response.results:
                if result.generated_text:
                    text += result.generated_text
        return {"role": None, "content": text}

    @staticmethod
    def generate_text_stream(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[dict | BamTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> Generator[Message, Any, None]:
        client = BamModel.get_model()
        params = set_default_model_params(parameters)
        for response in client.text.generation.create_stream(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params,
            moderations=moderations,
            data=data,
        ):
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
        parameters: dict[str, Any],
    ) -> Message:
        if "granite" in model_id and "granite-20b-code-instruct-r1.1" not in model_id:
            parameters = set_default_granite_model_parameters(parameters)
        if parameters.get("mock_response") is not None:
            litellm.suppress_debug_info = True
        response = completion(
            model=model_id, messages=messages, stream=False, **parameters
        )
        msg = response.choices[0].message  # pyright: ignore
        if msg.content is None:
            assert False, "TODO"  # XXX TODO XXX
        return {"role": msg.role, "content": msg.content}

    @staticmethod
    def generate_text_stream(
        model_id: str,
        messages: list[Message],
        parameters: dict[str, Any],
    ) -> Generator[Message, Any, None]:
        if "granite" in model_id and "granite-20b-code-instruct-r1.1" not in model_id:
            parameters = set_default_granite_model_parameters(parameters)
        response = completion(
            model=model_id,
            messages=messages,
            stream=True,
            **parameters,
        )
        for chunk in response:
            msg = chunk.choices[0].delta  # pyright: ignore
            if msg.content is None:
                break
            yield {"role": msg.role, "content": msg.content}
