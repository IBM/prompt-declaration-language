import argparse
import json
import sys
from io import StringIO
from multiprocessing import Manager, Pool

import yaml

from .pdl_ast import Program
from .pdl_interpreter import InterpreterState, empty_scope, process_prog


class BaseProcessor:
    def __init__(self, dataset, pdl_file, n):
        self.dataset = dataset
        self.pdl_file = pdl_file
        self.nb_processes = n

    def get_question(self, qna) -> str:
        return ""

    def get_truth_answer(self, qna) -> tuple[float, str]:
        return (0.0, "")

    def extract_answer(self, document) -> float:
        return 0.0

    def process_all(self):
        with open(self.dataset, "r", encoding="utf-8") as json_file:
            json_list = list(json_file)
        with open(self.pdl_file, "r", encoding="utf-8") as pdl:
            obj = yaml.safe_load(pdl)
            data = Program.model_validate(obj)
        manager = Manager()
        q = manager.Queue()
        with Pool(processes=self.nb_processes + 1) as pool:
            pool.apply_async(self.accumulator, (q,))
            jobs = [
                pool.apply_async(self.process_sample, (q, data, index, json_str))
                for index, json_str in enumerate(json_list)
            ]
            for res in jobs:
                res.get()
            q.put(None)

    def process_sample(self, q, data, index, json_str):
        qna = json.loads(json_str)
        question = self.get_question(qna)
        truth, solution = self.get_truth_answer(qna)
        document = ""  # pylint: disable=invalid-name
        answer = 0.0  # pylint: disable=invalid-name
        exception = None
        try:
            state = InterpreterState(yield_background=False)
            scope = empty_scope
            scope["question"] = question
            document, _, _, _ = process_prog(state, scope, data)
            answer = self.extract_answer(document)
        except Exception as e:
            exception = e
        q.put((index, question, truth, answer, solution, document, exception))

    def accumulator(self, q):
        with open("log.out", "w", encoding="utf-8") as log:
            completed = 0
            matches = 0  # pylint: disable=invalid-name
            exceptions = 0  # pylint: disable=invalid-name
            while True:
                m = q.get()
                completed += 1
                if m is None:
                    break
                (
                    index,
                    question,
                    truth,
                    answer,
                    solution,
                    document,
                    exception,
                ) = m
                print("\nQuestion: " + question)
                print(answer)
                if exception is not None:
                    print("EXCEPTION at: " + str(index))
                    print(exception)
                    exceptions += 1
                    write_log(
                        log,
                        index,
                        question,
                        truth,
                        answer,
                        solution,
                        document,
                        exception,
                    )
                if answer == truth or document.endswith(str(truth)):
                    print("MATCH!")
                    matches += 1
                else:
                    print("NO MATCH!")
                    print("Truth: " + str(truth))
                    print("Question: " + question)
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
                print(
                    "Percentage passing: "
                    + str(matches / completed)
                    + " ("
                    + str(completed)
                    + " completed)"
                )


def write_log(  # pylint: disable=too-many-arguments,too-many-positional-arguments
    log, index, question, truth, answer, solution, document, exc
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


class Gsm8kProcessor(BaseProcessor):
    def __init__(self, n):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math.pdl",
            n,
        )

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        return extract_math_answer(document)


class Gsm8kJinjaProcessor(BaseProcessor):
    def __init__(self, n):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math-jinja.pdl",
            n,
        )

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        return extract_math_answer(document)


def exec_python_answer(program: str) -> str:
    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    try:
        exec(program)
    except Exception as e:
        print(e)
        return "No answer"
    finally:
        sys.stdout = old_stdout
    return redirected_output.getvalue()


class Gsm8kPalProcessor(BaseProcessor):
    def __init__(self, n):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math-python.pdl",
            n,
        )

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        program = document.split("```")[1]
        return extract_math_answer(exec_python_answer(program))


class GsmHardlPalProcessor(BaseProcessor):
    def __init__(self, n):
        super().__init__(
            "../pal/datasets/gsmhardv2.jsonl",
            "examples/gsm8k/math-python.pdl",
            n,
        )

    def get_question(self, qna):
        return qna["input"]

    def get_truth_answer(self, qna):
        code = qna["code"]
        code += "\nprint(solution())"
        return extract_math_answer(exec_python_answer(code)), code

    def extract_answer(self, document):
        program = document.split("```")[1]
        return extract_math_answer(exec_python_answer(program))


class GsmHardlProcessor(BaseProcessor):
    def __init__(self, n):
        super().__init__(
            "../pal/datasets/gsmhardv2.jsonl", "examples/gsm8k/math.pdl", n
        )

    def get_question(self, qna):
        return qna["input"]

    def get_truth_answer(self, qna):
        code = qna["code"]
        code += "\nprint(solution())"
        return extract_math_answer(exec_python_answer(code)), code

    def extract_answer(self, document):
        return extract_math_answer(document)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--bench",
        "-b",
        help="benchmark",
    )
    parser.add_argument(
        "--processes", "-n", nargs="?", default=10, type=int, help="number of processes"
    )

    args = parser.parse_args()
    processes = args.processes
    if args.bench == "gsm8k":
        Gsm8kProcessor(processes).process_all()

    if args.bench == "gsm8k-pal":
        Gsm8kPalProcessor(processes).process_all()

    if args.bench == "gsm8k-jinja":
        Gsm8kJinjaProcessor(processes).process_all()

    if args.bench == "gsm-hard":
        GsmHardlProcessor(processes).process_all()

    if args.bench == "gsm-hard-pal":
        GsmHardlPalProcessor(processes).process_all()
