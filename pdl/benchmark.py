import argparse
import json
import sys
from io import StringIO

import yaml

from .pdl_ast import Program
from .pdl_interpreter import InterpreterState, empty_scope, process_prog


class BaseProcessor:
    def __init__(self, dataset, pdl_file):
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
            with open(self.dataset, "r", encoding="utf-8") as json_file:
                json_list = list(json_file)
                with open(self.pdl_file, "r", encoding="utf-8") as pdl:
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
                            print(answer)

                        except Exception as e:
                            print("EXCEPTION at: " + str(index))
                            print(e)
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
                            + str(matches / (index + 1))
                            + " ("
                            + str(index + 1)
                            + " completed)"
                        )


def write_log(  # pylint: disable=too-many-arguments
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
    def __init__(self):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math.pdl",
        )

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        return extract_math_answer(document)


class Gsm8kJinjaProcessor(BaseProcessor):
    def __init__(self):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math-jinja.pdl",
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
    def __init__(self):
        super().__init__(
            "../grade-school-math/grade_school_math/data/train.jsonl",
            "examples/gsm8k/math-python.pdl",
        )

    def get_question(self, qna):
        return qna["question"]

    def get_truth_answer(self, qna):
        return extract_math_answer(qna["answer"]), qna["answer"]

    def extract_answer(self, document):
        program = document.split("```")[1]
        return extract_math_answer(exec_python_answer(program))


class GsmHardlPalProcessor(BaseProcessor):
    def __init__(self):
        super().__init__(
            "../pal/datasets/gsmhardv2.jsonl", "examples/gsm8k/math-python.pdl"
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
    def __init__(self):
        super().__init__("../pal/datasets/gsmhardv2.jsonl", "examples/gsm8k/math.pdl")

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

    args = parser.parse_args()
    if args.bench == "gsm8k":
        Gsm8kProcessor().process()

    if args.bench == "gsm8k-pal":
        Gsm8kPalProcessor().process()

    if args.bench == "gsm8k-jinja":
        Gsm8kJinjaProcessor().process()

    if args.bench == "gsm-hard":
        GsmHardlProcessor().process()

    if args.bench == "gsm-hard-pal":
        GsmHardlPalProcessor().process()
