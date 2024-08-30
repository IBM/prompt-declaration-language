import os
from typing import Any, Generator, Optional

from dotenv import load_dotenv
from genai.client import Client as BamClient
from genai.credentials import Credentials as BamCredentials
from genai.schema import ModerationParameters as BamModerationParameters
from genai.schema import PromptTemplateData as BamPromptTemplateData
from ibm_watsonx_ai import Credentials as WatsonxCredentials
from ibm_watsonx_ai.foundation_models import ModelInference as WatsonxModelInference
from litellm import completion

from .pdl_ast import (
    BamTextGenerationParameters,
    Message,
    set_default_model_parameters,
    set_default_model_params,
    set_default_granite_model_parameters,
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
    def generate_text(  # pylint: disable=too-many-arguments
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
    def generate_text_stream(  # pylint: disable=too-many-arguments
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


class WatsonxModel:
    watsonx_models: dict[str, WatsonxModelInference] = {}

    @staticmethod
    def get_model(model_id: str) -> WatsonxModelInference:
        model_inference = WatsonxModel.watsonx_models.get(model_id)
        if model_inference is not None:
            return model_inference
        credentials = WatsonxCredentials(
            api_key=os.getenv("WATSONX_KEY"), url=os.getenv("WATSONX_API")
        )
        model_inference = WatsonxModelInference(
            model_id=model_id,
            credentials=credentials,
            project_id=os.getenv("WATSONX_PROJECT_ID"),
        )
        WatsonxModel.watsonx_models[model_id] = model_inference
        return model_inference

    @staticmethod
    def generate_text(
        model_id: str,
        prompt: str,
        params: Optional[dict],
        guardrails: Optional[bool],
        guardrails_hap_params: Optional[dict],
    ) -> Message:
        model_inference = WatsonxModel.get_model(model_id)
        parameters = params
        parameters = set_default_model_parameters(parameters)
        text = model_inference.generate_text(
            prompt=prompt,
            params=parameters,
            guardrails=guardrails or False,
            guardrails_hap_params=guardrails_hap_params,
        )
        assert isinstance(text, str)
        return {"role": None, "content": text}

    @staticmethod
    def generate_text_stream(  # pylint: disable=too-many-arguments
        model_id: str,
        prompt: str,
        params: Optional[dict],
        guardrails: Optional[bool],
        guardrails_hap_params: Optional[dict],
    ) -> Generator[Message, None, None]:
        model_inference = WatsonxModel.get_model(model_id)
        parameters = params
        parameters = set_default_model_parameters(parameters)
        text_stream = model_inference.generate_text_stream(
            prompt=prompt,
            params=parameters,
            guardrails=guardrails or False,
            guardrails_hap_params=guardrails_hap_params,
        )
        return (Message(role=None, content=chunk) for chunk in text_stream)


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
        params = parameters
        if "granite" in model_id:
            params = set_default_granite_model_parameters(params)
        response = completion(
            model=model_id, messages=messages, stream=False, **params
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
        params = parameters
        if "granite" in model_id:
            params = set_default_granite_model_parameters(params)
        response = completion(
            model=model_id, messages=messages, stream=True, **params
        )
        for chunk in response:
            msg = chunk.choices[0].delta  # pyright: ignore
            if msg.content is None:
                break
            yield {"role": msg.role, "content": msg.content}
