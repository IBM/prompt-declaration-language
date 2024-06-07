from typing import Any, Generator, Optional

from genai.client import Client as BamClient
from genai.credentials import Credentials as BamCredentials
from genai.schema import ModerationParameters as BamModerationParameters
from genai.schema import PromptTemplateData as BamPromptTemplateData

from .pdl_ast import PDLTextGenerationParameters, set_default_model_params

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
    bam_model: Optional[BamClient] = None

    @staticmethod
    def get_model() -> BamClient:
        if BamModel.bam_model is not None:
            return BamModel.bam_model
        credentials = BamCredentials.from_env()
        BamModel.bam_model = BamClient(credentials=credentials)
        return BamModel.bam_model

    @staticmethod
    def generate_text(  # pylint: disable=too-many-arguments
        model_id: str,
        prompt_id: Optional[str],
        model_input: Optional[str],
        parameters: Optional[PDLTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> str:
        client = BamModel.get_model()
        params = parameters
        params = set_default_model_params(params)
        text = ""
        for response in client.text.generation.create(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params.__dict__,
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
        parameters: Optional[PDLTextGenerationParameters],
        moderations: Optional[BamModerationParameters],
        data: Optional[BamPromptTemplateData],
    ) -> Generator[str, Any, None]:
        client = BamModel.get_model()
        params = parameters
        params = set_default_model_params(params)
        for response in client.text.generation.create_stream(
            model_id=model_id,
            prompt_id=prompt_id,
            input=model_input,
            parameters=params.__dict__,
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
