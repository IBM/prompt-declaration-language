import argparse
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Thread

import numpy as np
from pydantic import BaseModel
import yaml
from genai.schema import DecodingMethod, LengthPenalty, TextGenerationReturnOptions
from scipy.stats import entropy, gmean
from tqdm import tqdm

from pdl.pdl_dumper import dump_program, dump_yaml, program_to_dict
from pdl.pdl_llms import BamModel

from .pdl_ast import (
    Block,
    DocumentBlock,
    PDLTextGenerationParameters,
    Program,
    set_default_model_params,
)
from .pdl_interpreter import InterpreterState, empty_scope, process_prog
from datasets import load_from_disk, Dataset
from numpy.random import default_rng

rng = default_rng()


class BaseProcessor:
    def __init__(self, dataset, pdl_file) -> None:
        self.dataset = dataset
        self.pdl_file = pdl_file

    def get_question(self, qna) -> str:
        return ""

    def get_truth_answer(self, qna) -> tuple[float, str]:
        return (0.0, "")

    def extract_answer(self, document) -> float:
        return 0.0

    def process(self):
        with open("log.out", "w", encoding="utf-8") as log:
            with open(self.dataset, encoding="utf-8") as json_file:
                json_list = list(json_file)
                with open(self.pdl_file, encoding="utf-8") as pdl:
                    obj = yaml.safe_load(pdl)
                    data = Program.model_validate(obj)
                    matches = 0  # pylint: disable=invalid-name
                    exceptions = 0  # pylint: disable=invalid-name
                    for index, json_str in enumerate(json_list):
                        qna = json.loads(json_str)
                        question = self.get_question(qna)
                        truth, solution = self.get_truth_answer(qna)
                        document = ""  # pylint: disable=invalid-name
                        answer = 0.0  # pylint: disable=invalid-name
                        try:
                            state = InterpreterState(yield_output=True)
                            scope = empty_scope
                            scope["question"] = question
                            _, document, _, _ = process_prog(state, scope, data)
                            answer = self.extract_answer(document)

                        except Exception as e:
                            exceptions += 1
                            write_log(
                                log,
                                index,
                                question,
                                truth,
                                answer,
                                solution,
                                document,
                                e,
                            )

                        if answer == truth or document.endswith(str(truth)):
                            matches += 1
                        else:
                            write_log(
                                log,
                                index,
                                question,
                                truth,
                                answer,
                                solution,
                                document,
                                None,
                            )


def write_log(  # pylint: disable=too-many-arguments
    log,
    index,
    question,
    truth,
    answer,
    solution,
    document,
    exc,
):
    log.write("\n\n------------------------\n")
    log.write("Index: " + str(index + 1) + "\n")
    log.write(question)
    log.write("\nTruth: " + str(truth))
    log.write(solution)
    log.write("\nAnswer: " + str(answer) + "\n\n")
    log.write(document)
    if exc is not None:
        log.write(exc)
    log.flush()


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


def get_seq_logprobs(
    model: str, sequence: str, prepend: bool = False, max_new_tokens: int | None = 1
):
    if max_new_tokens < 1:
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
        ),
        max_new_tokens=max_new_tokens,
    )

    params = set_default_model_params(params)
    for response in client.text.generation.create(
        model_id=model,
        input=sequence,
        parameters=params.__dict__,
    ):
        input_logprobs = np.array([t.logprob for t in response.results[0].input_tokens])
        output_logprobs = np.array(
            [t.logprob for t in response.results[0].generated_tokens],
        )

    return input_logprobs, output_logprobs


def get_mutation(model: str, sequence: str):
    client = BamModel.get_model()
    params = PDLTextGenerationParameters(
        decoding_method=DecodingMethod.SAMPLE,
        temperature=0.9,
    )

    sequence = f"Say that instruction again in another way. DON'T use any of the words in the original instruction there's a good chap. INSTRUCTION: {sequence} INSTRUCTION MUTANT: "
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
        pdl_obj: any,
        qna: dict,
        demonstrations: list[dict],
        index: int,
        trial: int,
        model: str,
    ):
        super().__init__()
        self.pdl_obj = pdl_obj
        self.qna = qna
        self.demonstrations = demonstrations
        self.index = index
        self.trial = trial
        self.model = model

    def run(
        self,
    ):
        data = Program.model_validate(self.pdl_obj)
        document = ""
        answer = 0.0
        exception = 0
        match = 0
        truth = self.qna["answer"]
        input_logprobs = False
        try:
            state = InterpreterState(yield_output=False)
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

            result, document, scope, trace = process_prog(state, scope, data)
            if self.index == 0:
                input_logprobs, _ = get_seq_logprobs(
                    self.model,
                    scope["demos"],
                )
            answer = extract_math_answer(document)
        except Exception as e:
            print(e)
            exception = 1

        if answer == truth or document.endswith(str(truth)):
            match = 1
        # tqdm.write("True answer: %d" % truth)
        # tqdm.write("Given answer: %d" % answer)
        return match, exception, input_logprobs, scope


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


class Gsm8kFewshotProcessor(BaseProcessor):
    def __init__(
        self, dataset: Dataset, pdl_file: Path, trials: int, k: int, test_set_size: int
    ) -> None:
        self.dataset = dataset
        self.pdl_file = pdl_file
        self.trials = trials
        self.k = k
        self.model = "ibm/granite-34b-code-instruct"
        self.best_demos = []
        self.budget = "1"
        self.test_set_size = test_set_size
        self.test_set = self.dataset["test"].select(range(self.test_set_size))
        self.trial_metrics = []
        self.trial_logprobs = []

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        return extract_math_answer(document)

    def evaluate_pdl(
        self,
        program: Program,
        demonstrations: list[dict],
        qna: dict,
    ) -> str:
        state = InterpreterState(yield_output=False)
        scope = empty_scope
        scope["demonstrations"] = [
            {
                "question": q["question"],
                "reasoning": q["reasoning"],
                "answer": q["answer"],
            }
            for q in demonstrations
        ]
        scope["question"] = qna["question"]
        scope["reasoning"] = qna["reasoning"]
        scope["model"] = self.model

        result, document, scope, trace = process_prog(state, scope, program)

        # with Path("gsm8k.log").open("a", encoding="utf-8") as log_fp:
        #     for line in state.log:
        #         log_fp.write(line)

        return result, document, scope, trace

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
        for i in range(2):
            print(get_mutation(self.model, program.root.document[1]))
        program.root.document[1] = get_mutation(self.model, program.root.document[1])
        Path("test_evolve.pdl").write_text(dump_program(program))
        print(program)

    def load_pdl(self) -> any:
        with (
            self.pdl_file.open(encoding="utf-8") as pdl,
        ):
            return yaml.safe_load(pdl)

    def process_parallel(self, parallelism: int = 5):
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
            for trial in range(self.trials):
                demo_indices = rng.choice(
                    len(train_ds),
                    size=self.k,
                    replace=False,
                )

                demonstrations = train_ds.select(demo_indices)
                threads = []
                for index, qna in enumerate(self.test_set):
                    threads.append(
                        PDLThread(
                            pdl_obj,
                            qna,
                            demonstrations,
                            index,
                            trial,
                            self.model,
                        )
                    )
                matches = 0
                exceptions = 0
                input_logprobs = []
                for index, result in enumerate(execute_threads(parallelism, threads)):
                    match, exception, logprobs, scope = result
                    matches += match
                    exceptions += exception
                    if logprobs is not False:
                        input_logprobs.append(logprobs)
                    p_passing = matches / (index + 1)
                    t.update(1)
                t.write(f"----\nTrial ({trial} / {self.trials})")
                t.write(
                    f"Percentage passing: {p_passing:.0%} ({exceptions} exceptions)"
                )
                self.trial_metrics.append(p_passing)

                if p_passing > max_percent_passing:
                    self.best_demos = scope["demos"] # TODO: hardcoded

    def process(self):
        return self.process_parallel(1)
    # def process(self):
    #     pdl_obj = self.load_pdl()
    #     max_percent_passing = -1
    #     total = self.trials * self.test_set_size

    #     with tqdm(
    #         total=total,
    #         colour="green",
    #         smoothing=0.3,
    #     ) as pbar:
    #         for trial in range(self.trials):
    #             demo_indices = rng.choice(
    #                 len(self.dataset["train"]),
    #                 size=self.k,
    #                 replace=False,
    #             )
    #             # np.random.randint(
    #             #     0,
    #             #     len(self.dataset["train"]),
    #             #     size=self.k,
    #             # )
    #             demonstrations = self.dataset["train"].select(demo_indices)

    #             matches = 0
    #             exceptions = 0

    #             for index, qna in enumerate(self.test_set):
    #                 data = Program.model_validate(pdl_obj)
    #                 document = ""
    #                 answer = 0.0
    #                 truth = qna["answer"]
    #                 try:
    #                     _, document, scope, _ = self.evaluate_pdl(
    #                         data,
    #                         demonstrations,
    #                         qna,
    #                     )
    #                     if index == 0:
    #                         input_logprobs, _ = get_seq_logprobs(
    #                             self.model,
    #                             scope["demos"],
    #                         )
    #                         self.trial_logprobs.append(input_logprobs)
    #                     answer = self.extract_answer(document)
    #                 except Exception as e:
    #                     print(e)
    #                     exceptions += 1
    #                 pbar.update(1)

    #                 tqdm.write("----\nTrial (%d / %d)" % (trial, self.trials))
    #                 if answer == truth or document.endswith(str(truth)):
    #                     matches += 1
    #                     tqdm.write("Answer correct")
    #                 else:
    #                     tqdm.write("Answer incorrect")
    #                 percent_passing = matches / (index + 1)
    #                 tqdm.write("True answer: %d" % truth)
    #                 tqdm.write("Given answer: %d" % answer)

    #                 tqdm.write(
    #                     "Percentage passing: "
    #                     + f"{percent_passing:.0%}"
    #                     + " ("
    #                     + str(index + 1)
    #                     + f" completed) ({exceptions} exceptions)",
    #                 )
    #             self.trial_metrics.append(percent_passing)

    #             if percent_passing > max_percent_passing:
    #                 self.best_demos = scope["demos"]
    #                 # data.root.defs["demonstrations"] = "test world"
    #                 # prog = program_to_dict(data)
    #                 # Path("test_dump.pdl").write_text(dump_yaml(prog))
    #     tqdm.write("Best few shots")
    #     print(self.best_demos)
    #     print("accuracies =", self.trial_metrics)
    #     input_probs = [np.exp(s) for s in self.trial_logprobs]
    #     print("Shape =", [s.shape[0] for s in input_probs])
    #     print("Min =", [np.min(s) for s in input_probs])
    #     # print("Max =", [ np.max(s) for s in input_probs])
    #     print("Mean =", [np.mean(s) for s in input_probs])
    #     print("Gmean =", [gmean(s) for s in input_probs])
    #     print("Entropy =", [entropy(s) for s in input_probs])

    #     input_probs = [s / s.sum(0) for s in input_probs]
    #     print("norm_Min =", [np.min(s) for s in input_probs])
    #     print("norm_Max =", [np.max(s) for s in input_probs])
    #     print("norm_Mean =", [np.mean(s) for s in input_probs])
    #     print("norm_Gmean =", [gmean(s) for s in input_probs])
    #     print("norm_Entropy =", [entropy(s) for s in input_probs])
    #     data.root.description = "evolved"
    #     data.root.defs.demos = self.best_demos
    #     Path("test_dump_pydantic.pdl").write_text(dump_program(data))
            # dump_yaml(
            #     data.model_dump(
            #         mode="json",
            #         exclude_defaults=True,
            #         exclude_none=True,
            #         by_alias=True,
            #     )
            # )
        # )

        # obj["defs"]["demos"] = self.best_demos
        # Path("test_dump.pdl").write_text(dump_yaml(obj))


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
        Gsm8kFewshotProcessor(
            dataset=load_from_disk("gsm8k"),
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process()
    if args.bench == "gsm-pal":
        gsm8k = load_from_disk("gsm8k")
        gsm8k["train"] = Dataset.from_json("examples/gsm8k/demos.json")

        Gsm8kFewshotProcessor(
            dataset=gsm8k,
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process_parallel()
    if args.bench == "gsm-evolve":
        Gsm8kFewshotProcessor(
            dataset=load_from_disk("gsm8k"),
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).evolve()

    # from datasets import load_dataset
    # ds = load_dataset("openai/gsm8k", "main")

    # def parse_answers(row):
    # answer = extract_math_answer(row["answer"])
    # reasoning = "###".join(row["answer"].split("####")[:-1])
    # return {"answer": answer, "reasoning": reasoning}
    # ds = ds.map(parse_answers)
    # ds.save_to_disk("gsm8k")
