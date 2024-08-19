from pdl.pdl_ast import BamTextGenerationParameters, set_default_model_params
from pdl.pdl_llms import BamModel


from genai.schema import DecodingMethod


def get_mutation(model: str, sequence: str):
    client = BamModel.get_model()
    params = BamTextGenerationParameters(
        decoding_method=DecodingMethod.SAMPLE,
        temperature=0.8,
    )

    # sequence = f"Say that instruction again in another way. DON'T use any of the words in the original instruction there's a good chap. INSTRUCTION: {sequence} INSTRUCTION MUTANT: "

    params = set_default_model_params(params)
    text = ""
    for response in client.text.generation.create(
        model_id=model,
        input=sequence,
        parameters=params.__dict__,
    ):
        for result in response.results:
            if result.generated_text:
                text += result.generated_text

    return text