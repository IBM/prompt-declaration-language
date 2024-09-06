import argparse
import json
import sys
from io import StringIO

import yaml

from .pdl_ast import Program
from .pdl_interpreter import InterpreterState, empty_scope, process_prog


def extract_answer(result: str) -> float:
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


def process_answer(document: str) -> str:
    program = document.split("```")[1]
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


def process(file, mode):
    with open(
        "../grade-school-math/grade_school_math/data/train.jsonl", "r", encoding="utf-8"
    ) as json_file:
        json_list = list(json_file)
        with open(file, "r", encoding="utf-8") as math_file:
            obj = yaml.safe_load(math_file)
            data = Program.model_validate(obj)
            matches = 0  # pylint: disable=invalid-name
            exceptions = 0  # pylint: disable=invalid-name
            for index, json_str in enumerate(json_list):
                qna = json.loads(json_str)
                truth = extract_answer(qna["answer"])
                question = qna["question"]
                result = ""
                answer = 0.0  # pylint: disable=invalid-name
                try:
                    state = InterpreterState(yield_background=True)
                    scope = empty_scope
                    scope["question"] = question
                    result, _, _, _ = process_prog(state, scope, data)
                    print(result)
                    if mode == "python":
                        answer = extract_answer(process_answer(result))
                    else:
                        answer = extract_answer(result)

                except Exception as e:
                    print("EXCEPTION at: " + str(index))
                    print(e)
                    exceptions += 1

                if answer == truth or result.endswith(str(truth)):
                    print("MATCH!")
                    matches += 1
                else:
                    print("NO MATCH!")
                    print("Truth: " + str(truth))
                    print("Question: " + question)
                print(
                    "Percentage passing: "
                    + str(matches / (index + 1))
                    + " ("
                    + str(index + 1)
                    + " completed)"
                )


if __name__ == "__main__":
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "--file",
        "-f",
        help="PDL file",
    )
    parser.add_argument("-m", "--mode", help="output mode", choices=["python", "pdl"])

    args = parser.parse_args()
    process(args.file, args.mode)
