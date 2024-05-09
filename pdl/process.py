import json

import yaml

from .pdl_ast import Program
from .pdl_interpreter import empty_scope, process_prog


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


if __name__ == "__main__":
    with open(
        "../grade-school-math/grade_school_math/data/train.jsonl", "r", encoding="utf-8"
    ) as json_file:
        json_list = list(json_file)
        with open("./examples/gsm8k/math.pdl", "r", encoding="utf-8") as math_file:
            obj = yaml.safe_load(math_file)
            data = Program.model_validate(obj)
            matches = 0  # pylint: disable=invalid-name
            exceptions = 0  # pylint: disable=invalid-name
            for index, json_str in enumerate(json_list):
                qna = json.loads(json_str)
                truth = extract_answer(qna["answer"])
                question = qna["question"]
                document = ""  # pylint: disable=invalid-name
                answer = 0.0  # pylint: disable=invalid-name
                try:
                    log: list[str] = []
                    scope = empty_scope
                    scope["question"] = qna["question"]
                    _, document, _, _ = process_prog(log, scope, data)
                    answer = extract_answer(document)
                except Exception:
                    print("EXCEPTION at: " + str(index))
                    exceptions += 1

                if answer == truth or document.endswith(str(truth)):
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
