import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
from threading import Thread

import numpy as np
import yaml
from genai.schema import DecodingMethod, TextGenerationReturnOptions, LengthPenalty
from tqdm import tqdm

from pdl.pdl_llms import BamModel

from .pdl_ast import PDLTextGenerationParameters, Program, set_default_model_params
from .pdl_interpreter import InterpreterState, empty_scope, process_prog
from scipy.stats import gmean, entropy


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


# TODO:
# get sequence logprob
def get_seq_logprobs(
    model: str, sequence: str, prepend: bool = False, max_new_tokens: int | None = 1
):
    if prepend:
        sequence = "<|endoftext|>" + sequence
    if max_new_tokens < 1:
        raise ValueError("Max new tokens has to be 1 or greater unfortunately.")

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
        # length_penalty=LengthPenalty(decay_factor=10),
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


class PDLThread(Thread):
    def __init__(self):
        pass

    def run():
        pass


def execute_threads(max_threads: int, programs: list):
    pdl_threads = (PDLThread() for program in programs)

    with ThreadPoolExecutor(max_workers=max_threads) as service:
        futures = [
            service.submit(
                thread.run,
            )
            for thread in pdl_threads
        ]
        for future in tqdm(futures):
            yield future.result(timeout=259200)

        service.shutdown()


class Gsm8kFewshotProcessor(BaseProcessor):
    def __init__(self, pdl_file: Path, trials: int, k: int, test_set_size: int) -> None:
        from datasets import load_from_disk

        # input_logprobs, output_logprobs = get_seq_logprobs(
        #     "ibm/granite-34b-code-instruct",
        #     "Let's think step by step",
        #     max_new_tokens=1,
        # )

        self.dataset = load_from_disk("gsm8k")
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

        with Path("gsm8k.log").open("a", encoding="utf-8") as log_fp:
            for line in state.log:
                log_fp.write(line)

        return result, document, scope, trace

    def process(self):
        with (
            # open("log.out", "w", encoding="utf-8") as log,
            # open(self.dataset, encoding="utf-8") as json_file,
            self.pdl_file.open(encoding="utf-8") as pdl,
        ):
            obj = yaml.safe_load(pdl)

        max_percent_passing = -1
        with tqdm(
            total=self.trials * self.test_set_size,
            colour="green",
            smoothing=0.3,
        ) as pbar:
            for trial in range(self.trials):
                demo_indices = np.random.randint(
                    0,
                    len(self.dataset["train"]),
                    size=self.k,
                )
                demonstrations = self.dataset["train"].select(demo_indices)

                matches = 0
                exceptions = 0

                for index, qna in enumerate(self.test_set):
                    data = Program.model_validate(obj)
                    document = ""
                    answer = 0.0
                    truth = qna["answer"]
                    try:
                        _, document, scope, _ = self.evaluate_pdl(
                            data, demonstrations, qna
                        )
                        if index == 0:
                            input_logprobs, _ = get_seq_logprobs(
                                self.model, scope["demos"]
                            )
                            self.trial_logprobs.append(input_logprobs)
                        answer = self.extract_answer(document)
                    except Exception as e:
                        print(e)
                        exceptions += 1
                    pbar.update(1)

                    tqdm.write("----\nTrial (%d / %d)" % (trial, self.trials))
                    if answer == truth or document.endswith(str(truth)):
                        matches += 1
                        tqdm.write("Answer correct")
                    else:
                        tqdm.write("Answer incorrect")
                    percent_passing = matches / (index + 1)
                    tqdm.write("True answer: %d" % truth)
                    tqdm.write("Given answer: %d" % answer)

                    tqdm.write(
                        "Percentage passing: "
                        + f"{percent_passing:.0%}"
                        + " ("
                        + str(index + 1)
                        + f" completed) ({exceptions} exceptions)",
                    )
                self.trial_metrics.append(percent_passing)

                if percent_passing > max_percent_passing:
                    self.best_demos = scope["demos"]
                    # data.root.defs["demonstrations"] = "test world"
                    # prog = program_to_dict(data)
                    # Path("test_dump.pdl").write_text(dump_yaml(prog))
        tqdm.write("Best few shots")
        print(self.best_demos)
        print("accuracies =", self.trial_metrics)
        input_probs = [ np.exp(s) for s in self.trial_logprobs ]
        print("Shape =", [ s.shape[0] for s in input_probs])
        print("Min =", [ np.min(s) for s in input_probs])
        # print("Max =", [ np.max(s) for s in input_probs])
        print("Mean =", [ np.mean(s) for s in input_probs])
        print("Gmean =", [ gmean(s) for s in input_probs])
        print("Entropy =", [ entropy(s) for s in input_probs])

        input_probs = [ s/s.sum(0) for s in input_probs ]
        print("norm_Min =", [ np.min(s) for s in input_probs])
        print("norm_Max =", [ np.max(s) for s in input_probs])
        print("norm_Mean =", [ np.mean(s) for s in input_probs])
        print("norm_Gmean =", [ gmean(s) for s in input_probs])
        print("norm_Entropy =", [ entropy(s) for s in input_probs])

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
            pdl_file=args.pdl_file,
            trials=args.trials,
            k=args.num_demos,
            test_set_size=args.test_set_size,
        ).process()

    # from datasets import load_dataset
    # ds = load_dataset("openai/gsm8k", "main")

    # def parse_answers(row):
    # answer = extract_math_answer(row["answer"])
    # reasoning = "###".join(row["answer"].split("####")[:-1])
    # return {"answer": answer, "reasoning": reasoning}
    # ds = ds.map(parse_answers)
    # ds.save_to_disk("gsm8k")
