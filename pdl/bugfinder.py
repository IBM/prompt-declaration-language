import json

import yaml

from .pdl_ast import Program
from .pdl_interpreter import InterpreterState, empty_scope, process_prog


def is_correct(document) -> bool:
    if "no" in document or "No" in document or "incorrect" in document:
        return False
    return True


def remove_comment(document) -> str:
    if '"""' not in document:
        return document
    parts = document.split('"""')
    return parts[0] + parts[2]


def process():
    with open("log.out", "w", encoding="utf-8") as log:
        with open(
            "../pal/datasets/gsmhardv2.jsonl", "r", encoding="utf-8"
        ) as json_file:
            json_list = list(json_file)
            with open("examples/gsm8k/gsmhard-bugs.pdl", "r", encoding="utf-8") as pdl:
                obj = yaml.safe_load(pdl)
                data = Program.model_validate(obj)
                for index, json_str in enumerate(json_list):
                    qna = json.loads(json_str)
                    question = qna["input"]
                    code = remove_comment(qna["code"])
                    document = ""  # pylint: disable=invalid-name
                    correct = True
                    wrongs = 0
                    try:
                        state = InterpreterState(yield_background=True)
                        scope = empty_scope
                        scope["question"] = question
                        scope["code"] = code
                        _, document, _, _ = process_prog(state, scope, data)
                        correct = is_correct(document)
                        print("\n*********" + str(correct))

                    except Exception as e:
                        print("EXCEPTION at: " + str(index))
                        print(e)

                    if correct is False:
                        write_log(log, index, document)
                        wrongs += 1


def write_log(log, index, document):
    log.write("\n\n------------------------\n")
    log.write("Index: " + str(index + 1) + "\n")
    log.write(document)
    log.flush()


if __name__ == "__main__":
    process()
