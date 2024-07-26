import argparse
import json
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from enum import Enum
from functools import cached_property
from pathlib import Path
from threading import Thread

import numpy as np
import yaml
from datasets import Dataset, load_dataset, load_from_disk
from genai.schema import DecodingMethod, LengthPenalty, TextGenerationReturnOptions
from numpy.random import default_rng
from pydantic import BaseModel
from scipy.stats import entropy, gmean
from tqdm import tqdm

from pdl.pdl_dumper import dump_program, dump_yaml, program_to_dict
from pdl.pdl_llms import BamModel

from .pdl_ast import (
    Block,
    DocumentBlock,
    PDLTextGenerationParameters,
    Program,
    ScopeType,
    set_default_model_params,
)
from .pdl_interpreter import InterpreterState, empty_scope, process_prog

rng = default_rng()


def extract_math_answer(result: str) -> float:
    try:
        return float(result.split("####")[-1].strip().replace("$", "").replace(",", ""))
    except Exception:
        for r in reversed(result.split()):
            try:
                ret = r.replace("$", "")
                if ret.endswith("."):
                    ret = ret[:-1]
                return float(ret)
            except Exception:
                continue
        return 0.0


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
            raise ValueError("Logprob is none.")

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
        raise ValueError("Max new tokens has to be 1 or greater unfortunately.")

    if prepend:
        sequence = "<|endoftext|>" + sequence

    client = BamModel.get_model()
    params = PDLTextGenerationParameters(
        decoding_method=DecodingMethod.GREEDY,
        return_options=TextGenerationReturnOptions(
            generated_tokens=True,
            input_text=True,
            input_tokens=True,
            token_logprobs=True,
            token_ranks=True,
            # top_n_tokens=5,
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
                logprob=t.logprob or 0.0,
                rank=t.rank,
                text=t.text,
                top_tokens=t.top_tokens,
            )
            for t in result.input_tokens
        ]
        generated_tokens = [
            Token(
                logprob=t.logprob or 0.0,
                rank=t.rank,
                text=t.text,
                top_tokens=t.top_tokens,
            )
            for t in result.generated_tokens
        ]

        model_response = ModelResponse(
            input_text=result.input_text,
            input_tokens=input_tokens,
            generated_text=result.generated_text,
            generated_tokens=generated_tokens,
            input_token_count=result.input_token_count,
        )

        return model_response

    return None


def get_mutation(model: str, sequence: str):
    client = BamModel.get_model()
    params = PDLTextGenerationParameters(
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


class PDLThread(Thread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__()

    def run(self):
        raise NotImplemented("Base class does not implement")


class Gsm8kThread(PDLThread):
    def __init__(
        self,
        pdl_obj: any,
        qna: dict,
        demonstrations: list[dict],
        index: int,
        trial: int,
        model: str,
        input_variable_name: str,
    ):
        super().__init__()
        self.pdl_obj = pdl_obj
        self.qna = qna
        self.demonstrations = demonstrations
        self.index = index
        self.trial = trial
        self.model = model
        self.input_variable_name = input_variable_name

    def get_scope(self) -> ScopeType:
        scope = empty_scope
        scope["demonstrations"] = [
            {
                "question": q["question"],
                "reasoning": q["reasoning"],
                "answer": q["answer"],
            }
            for q in self.demonstrations
        ]
        scope["question"] = self.qna["question"]
        scope["reasoning"] = self.qna["reasoning"]
        scope["model"] = self.model
        return scope

    def run(
        self,
    ):
        # data = Program.model_validate(self.pdl_obj)
        document = ""
        answer = 0.0
        exception = 0
        match = 0
        truth = self.qna["answer"]
        input_logprobs = False
        try:
            state = InterpreterState(yield_output=False)
            scope = self.get_scope()

            result, document, scope, trace = process_prog(state, scope, self.pdl_obj)
            if self.index == 0:
                model_input = get_seq_logprobs(
                    self.model,
                    scope[self.input_variable_name],
                )
                input_logprobs = model_input.input_probs
            answer = extract_math_answer(document)
        except Exception as e:
            print(e)
            exception = 1

        if answer == truth or document.endswith(str(truth)):
            match = 1
        tqdm.write("True answer: %d" % truth)
        tqdm.write("Given answer: %d" % answer)
        return match, exception, input_logprobs, scope, self.pdl_obj


def execute_threads(max_threads: int, pdl_threads: list):
    with ThreadPoolExecutor(max_workers=max_threads) as service:
        futures = [
            service.submit(
                thread.run,
            )
            for thread in pdl_threads
        ]
        for future in futures:
            yield future.result(timeout=259200)

        service.shutdown()


class SamplingMethods(Enum):
    IDENTITY = 1
    REVERSED = 2
    RANDOM_INDICES = 3
    UNCERTAINTY = 4


class Optimizer:
    def __init__(
        self, dataset: Dataset, pdl_file: Path, trials: int, k: int, test_set_size: int
    ) -> None:
        self.dataset = dataset
        self.pdl_file = pdl_file
        self.trials = trials
        self.k = k
        self.model = (
            "ibm/granite-34b-code-instruct"  # "ibm/granite-20b-code-instruct-v2"
        )
        self.best_demos = []
        self.budget = "1"
        self.test_set_size = test_set_size
        self.test_set = self.dataset["test"].select(range(self.test_set_size))
        self.trial_metrics = []
        self.trial_logprobs = []
        # self.trials = {}

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        return extract_math_answer(document)

    def traverse(self, program: Program):
        if program is None:
            return

        if isinstance(program, str):
            print(program)
            return

        if isinstance(program, tuple):
            print(program)
            name, value = program
            self.traverse(value)

        if isinstance(program, list | Block):
            for i in program:
                self.traverse(i)

    def evolve(self):
        pdl_obj = self.load_pdl()

        program = Program.model_validate(pdl_obj)
        print("Original:", program.root.document[1])
        # for i in range(10):
        #     print(get_mutation(self.model, program.root.document[1]))
        # for p in mutation_prompts:
        #     print("----", p + " " + program.root.document[1], "----")
        #     print(p, get_mutation(self.model, p + " " + program.root.document[1]))
        # program.root.document[1] = get_mutation(self.model, program.root.document[1])
        # Path("test_evolve.pdl").write_text(dump_program(program))
        # print(program)

    def load_pdl(self) -> Program:
        with (self.pdl_file.open(encoding="utf-8") as pdl,):
            return Program.model_validate(yaml.safe_load(pdl))

    def sample(self, dataset, method: SamplingMethods):
        match method:
            case SamplingMethods.IDENTITY:
                return dataset
            case SamplingMethods.REVERSED:
                return list(reversed(dataset))
            case SamplingMethods.RANDOM_INDICES:
                return self.sample_random_indices(dataset)
            case SamplingMethods.UNCERTAINTY:
                # filtered = dataset.sort("entropy", reverse=True)[:self.k*3]#.filter(lambda x: x["entropy"] < 4.5, num_proc=32)
                filtered = dataset.sort("entropy", reverse=True).select(
                    range(self.k * 3)
                )  # [:self.k*3]#.filter(lambda x: x["entropy"] < 4.5, num_proc=32)
                return self.sample_random_indices(filtered)

        raise ValueError("Invalid sampling method!")

    def sample_random_indices(self, dataset) -> Dataset:
        demo_indices = rng.choice(
            len(dataset),
            size=self.k,
            replace=False,
        )
        return dataset.select(demo_indices)

    def save_pdl_program(self, pdl_program: Program) -> int:
        output_file = Path(self.pdl_file.parent, "optimized_" + self.pdl_file.name)
        return output_file.write_text(dump_program(pdl_program))

    def process(self, parallelism: int = 5):
        """
        1. Should figure out all mutable parts: the input variables, the text instructions, any "optimize" blocks.
        2. Set values for each part, in each trial
        """
        input_variable_name = "demos"

        train_ds = self.dataset["train"]
        pdl_obj = self.load_pdl()
        max_percent_passing = -1
        total = self.trials * self.test_set_size
        with tqdm(
            total=total,
            colour="green",
            smoothing=0.3,
        ) as t:
            t.write(
                f"Starting optimization: {self.trials:,} trials, "
                f"{self.test_set_size:,} test set, "
                f"{self.k:,} demonstrations, {len(train_ds):,} training examples"
            )
            for trial in range(self.trials):  # TODO: work with a time budget?
                demonstrations = self.sample(train_ds, SamplingMethods.UNCERTAINTY)
                threads = []
                for index, qna in enumerate(self.test_set):
                    threads.append(
                        Gsm8kThread(
                            pdl_obj.model_copy(),
                            qna,
                            demonstrations,
                            index,
                            trial,
                            self.model,
                            input_variable_name,
                        )
                    )
                matches = 0
                exceptions = 0
                for index, result in enumerate(execute_threads(parallelism, threads)):
                    # TODO: it would be nice if different trials can run in parallel
                    match, exception, logprobs, scope, pdl_program = result
                    matches += match
                    exceptions += exception
                    if logprobs is not False:
                        self.trial_logprobs.append(logprobs)
                    p_passing = matches / (index + 1)
                    t.update(1)
                t.write(f"----\nTrial ({trial} / {self.trials})")
                t.write(
                    f"Percentage passing: {p_passing:.0%} ({exceptions} exceptions)"
                )
                self.trial_metrics.append(p_passing)
                # self.trial_demo_logprobs.append()

                if p_passing > max_percent_passing:
                    self.best_demos = scope[input_variable_name]

        pdl_program.root.defs[input_variable_name] = self.best_demos
        self.save_pdl_program(pdl_program)
        tqdm.write("Best few shots")
        tqdm.write(self.best_demos)
        tqdm.write(
            f"Starting optimization: {self.trials:,} trials, "
            f"{self.test_set_size:,} test set, "
            f"{self.k:,} demonstrations, {len(train_ds):,} training examples"
        )
        tqdm.write(f"accuracies = {self.trial_metrics}")
        input_probs = self.trial_logprobs
        print("Shape =", [s.shape[0] for s in input_probs])
        print("Min =", [np.min(s) for s in input_probs])
        # print("Max =", [ np.max(s) for s in input_probs])
        print("Mean =", [np.mean(s) for s in input_probs])
        print("Gmean =", [gmean(s) for s in input_probs])
        print("Entropy =", [entropy(s) for s in input_probs])

        input_probs = [s / s.sum(0) for s in input_probs]
        print("norm_Min =", [np.min(s) for s in input_probs])
        print("norm_Max =", [np.max(s) for s in input_probs])
        print("norm_Mean =", [np.mean(s) for s in input_probs])
        print("norm_Gmean =", [gmean(s) for s in input_probs])
        print("norm_Entropy =", [entropy(s) for s in input_probs])

    def process_single(self):
        return self.process_parallel(1)


class TrialResults(list):
    pass


@dataclass
class Trial:
    demos: list | str | None
    input_model_response: ModelResponse | None
    results: TrialResults | None


class Gsm8kOptimizer(Optimizer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--bench",
        "-b",
        help="benchmark",
    )
    parser.add_argument(
        "--trials",
        "-t",
        type=int,
        help="Number of trials (samples) of demonstrations to evaluate.",
        default=3,
    )
    parser.add_argument(
        "--num_demos",
        "-k",
        type=int,
        help="Number of demonstrations (examples) in fewshot.",
        default=1,
    )
    parser.add_argument(
        "--test_set_size",
        "-s",
        type=int,
        help="Size of test set to evaluate against",
        default=1,
    )
    parser.add_argument(
        "pdl_file",
        type=Path,
        help="Path to a PDL file to optimize",
    )

    # pdl_file: Path, trials: int, k: int, test_set_size: int
    args = parser.parse_args()

    if args.bench == "gsm-fewshot":
        Gsm8kOptimizer(
            dataset=load_from_disk("gsm8k_logprobs_agg"),
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process()
    if args.bench == "gsm-pal":
        gsm8k = load_from_disk("gsm8k")
        gsm8k["train"] = Dataset.from_json("examples/gsm8k/demos.json")

        Gsm8kOptimizer(
            dataset=gsm8k,
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process()
    if args.bench == "gsm-evolve":
        Gsm8kOptimizer(
            dataset=load_from_disk("gsm8k"),
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).evolve()
    if args.bench == "logprobs":
        gsm8k = load_from_disk("var/gsm8k_logprobs_agg")
        # gsm8k["cot"] = Dataset.from_json("examples/gsm8k/demos.json")

        def mapper(row):
            seq = f"Question: {row['question']}\nAnswer: Let's think step by step. "
            lp = get_seq_logprobs(
                "ibm/granite-34b-code-instruct", seq, max_new_tokens=None
            )
            answer = extract_math_answer(lp.generated_text)
            return {
                "generated_probs": lp.generated_probs,
                "generated_text": lp.generated_text,
                "generated_tokens": [t.text for t in lp.generated_tokens],
                "gen_answer": answer,
            }

        gsm8k["test"] = gsm8k["test"].map(mapper, num_proc=10)
        gsm8k.save_to_disk("var/gsm8k_logprobs_answered_34b")

    # from datasets import load_dataset
    # ds = load_dataset("openai/gsm8k", "main")

    # def parse_answers(row):
    # answer = extract_math_answer(row["answer"])
    # reasoning = "###".join(row["answer"].split("####")[:-1])
    # return {"answer": answer, "reasoning": reasoning}
    # ds = ds.map(parse_answers)
    # ds.save_to_disk("gsm8k")


@dataclass
class Tool:
    name: str
    description: str
    parameters: str | dict
    examples: list[str]


class PDLOptimizer:
    def __init__(
        self,
        pdl_program: Path,
        dataset_name: str,
        split: str,
        signature: str,
        metric: callable[[str], float],  # metric takes model output
        prompt_patterns: list[str],
        tools: list[Tool],
    ):
        self.pdl_program = pdl_program
        self.dataset_name = dataset_name
        self.split = split
        self.signature = signature
        self.metric = metric
        self.prompt_patterns = prompt_patterns
        self.tools = tools

        # Load
        self.dataset = load_dataset(self.dataset_name, split=self.split)
        self.parse_signature()

    def parse_signature(self):
        inputs, _, outputs = self.signature.partition("->")
        self._inputs = [i.trim() for i in inputs.split(",")]
        self._outputs = [i.trim() for i in inputs.split(",")]

    def verify_dataset(self):
        cols = [*self._inputs, *self._outputs]
        assert all(c in self.dataset["train"].column_names for c in cols)
        assert all(c in self.dataset["test"].column_names for c in cols)

    def run(self):
        """
        1. Determine all optimizable parts of input
        2. Sample a random combination
        3. Run the PDL program i.e. evaluate it (threaded) against subset of test
        4. Run the output through the metric function
        5. Discard half the combinations, double the test set size
        6. Repeat
        """
        pass
