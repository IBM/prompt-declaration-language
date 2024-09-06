from dataclasses import dataclass
from functools import cached_property

import numpy as np
from datasets import load_from_disk
from genai.schema import DecodingMethod, TextGenerationReturnOptions
from scipy.stats import entropy, gmean

from pdl.pdl_ast import BamTextGenerationParameters, set_default_model_params
from pdl.pdl_llms import BamModel


@dataclass
class Token:
    logprob: float | None
    rank: int | None
    text: str
    top_tokens: list

    def __len__(self) -> int:
        return len(self.text)

    @cached_property
    def prob(self) -> float:
        if self.logprob is None:
            msg = "Logprob is none."
            raise ValueError(msg)

        return np.exp(self.logprob)


@dataclass
class ModelResponse:
    input_text: str
    input_tokens: list[Token]

    generated_text: str
    generated_tokens: list[Token]

    input_token_count: int

    @cached_property
    def input_logprobs(self) -> np.ndarray:
        return np.array([t.logprob for t in self.input_tokens]).astype(float)

    @cached_property
    def generated_logprobs(self) -> np.ndarray:
        return np.array([t.logprob for t in self.generated_tokens]).astype(float)

    @cached_property
    def input_perplexity(self) -> np.ndarray:
        return np.exp(np.mean(self.input_logprobs))

    @cached_property
    def generated_perplexity(self) -> np.ndarray:
        return np.exp(np.mean(self.generated_logprobs))

    @cached_property
    def input_probs(self) -> np.ndarray:
        return np.exp(self.input_logprobs)

    @cached_property
    def generated_probs(self) -> np.ndarray:
        return np.exp(self.generated_logprobs)

    @cached_property
    def norm_input_probs(self) -> np.ndarray:
        return self.input_probs / self.input_probs.sum(0)

    @cached_property
    def norm_generated_probs(self) -> np.ndarray:
        return self.generated_probs / self.generated_probs.sum(0)

    @cached_property
    def length(self) -> int:
        return self.input_token_count

    @cached_property
    def input_min(self) -> float:
        return np.min(self.input_probs)

    @cached_property
    def input_mean(self) -> float:
        return np.mean(self.input_probs)

    @cached_property
    def input_gmean(self) -> float:
        return gmean(self.input_probs)

    @cached_property
    def input_entropy(self) -> float:
        return entropy(self.input_probs)

    @cached_property
    def input_norm_min(self) -> float:
        return np.min(self.norm_input_probs)

    @cached_property
    def input_norm_mean(self) -> float:
        return np.mean(self.norm_input_probs)

    @cached_property
    def input_norm_gmean(self) -> float:
        return gmean(self.norm_input_probs)

    @cached_property
    def input_norm_entropy(self) -> float:
        return entropy(self.norm_input_probs)


def get_seq_logprobs(
    model: str,
    sequence: str,
    prepend: bool = False,
    max_new_tokens: int | None = 1,
):
    if max_new_tokens is not None and max_new_tokens < 1:
        msg = "Max new tokens has to be 1 or greater unfortunately."
        raise ValueError(msg)

    if prepend:
        sequence = "<|endoftext|>" + sequence

    client = BamModel.get_model()
    params = BamTextGenerationParameters(
        decoding_method=DecodingMethod.GREEDY,
        return_options=TextGenerationReturnOptions(
            generated_tokens=True,
            input_text=True,
            input_tokens=True,
            token_logprobs=True,
            token_ranks=True,
        ),
        max_new_tokens=max_new_tokens,
        stop_sequences=["<|endoftext|>"],
        include_stop_sequence=False,
    )

    params = set_default_model_params(params)
    for response in client.text.generation.create(
        model_id=model,
        input=sequence,
        parameters=params.__dict__,
    ):
        result = response.results[0]

        input_tokens = [
            Token(
                logprob=-100 if t.logprob is None else t.logprob,
                rank=t.rank,
                text=t.text,
                top_tokens=t.top_tokens,
            )
            for t in result.input_tokens
        ]
        generated_tokens = [
            Token(
                logprob=-100 if t.logprob is None else t.logprob,
                rank=t.rank,
                text=t.text,
                top_tokens=t.top_tokens,
            )
            for t in result.generated_tokens
        ]

        return ModelResponse(
            input_text=result.input_text,
            input_tokens=input_tokens,
            generated_text=result.generated_text,
            generated_tokens=generated_tokens,
            input_token_count=result.input_token_count,
        )

    return None


def process_logprobs():
    gsm8k = load_from_disk("var/gsm8k_logprobs_agg")

    def mapper(row):
        seq = f"Question: {row['question']}\nAnswer: Let's think step by step. "
        lp = get_seq_logprobs(
            "ibm/granite-34b-code-instruct",
            seq,
            max_new_tokens=None,
        )
        answer = lp.generated_text
        return {
            "generated_probs": lp.generated_probs,
            "generated_text": lp.generated_text,
            "generated_tokens": [t.text for t in lp.generated_tokens],
            "gen_answer": answer,
        }

    gsm8k["test"] = gsm8k["test"].map(mapper, num_proc=10)
    gsm8k.save_to_disk("var/gsm8k_logprobs_answered_34b")
