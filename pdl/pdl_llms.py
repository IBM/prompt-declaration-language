import os
from typing import Any, Generator, Optional

from dotenv import load_dotenv
from genai.client import Client as BamClient
from genai.credentials import Credentials as BamCredentials
from genai.schema import ModerationParameters as BamModerationParameters
from genai.schema import PromptTemplateData as BamPromptTemplateData
from ibm_watsonx_ai import Credentials as WatsonxCredentials
from ibm_watsonx_ai.foundation_models import ModelInference as WatsonxModelInference

from .pdl_ast import (
    BamTextGenerationParameters,
    set_default_model_parameters,
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
    def generate_text(  # pylint: disable=too-many-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[dict | BamTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> str:
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
        return text

    @staticmethod
    def generate_text_stream(  # pylint: disable=too-many-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[dict | BamTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> Generator[str, Any, None]:
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
                    yield result.generated_text

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
    ) -> str:
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
        return text

    @staticmethod
    def generate_text_stream(  # pylint: disable=too-many-arguments
        model_id: str,
        prompt: str,
        params: Optional[dict],
        guardrails: Optional[bool],
        guardrails_hap_params: Optional[dict],
    ) -> Generator[str, Any, None]:
        model_inference = WatsonxModel.get_model(model_id)
        parameters = params
        parameters = set_default_model_parameters(parameters)
        text_stream = model_inference.generate_text_stream(
            prompt=prompt,
            params=parameters,
            guardrails=guardrails or False,
            guardrails_hap_params=guardrails_hap_params,
        )
        return text_stream
