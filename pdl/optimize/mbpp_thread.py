import ast
from typing import Any

from evalplus.evaluate import check_correctness

from pdl.optimize.util import PDLThread
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import empty_scope


class MBPPTrialThread(PDLThread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.answer_key = "canonical_solution"

    def get_scope(self) -> ScopeType:
        scope = empty_scope
        scope["model"] = self.candidate["model"]
        scope["prompt_pattern"] = self.candidate["prompt_pattern"]
        match self.candidate["prompt_pattern"]:
            case "cot":
                scope["demonstrations"] = [
                    {
                        "question": q["prompt"],
                        "answer": str(q[self.answer_key]),
                    }
                    for q in self.candidate["demonstrations"]
                ]
            case "react":
                scope["demonstrations"] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["traj_keys"],
                            q["traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate["demonstrations"]
                ]
            case "rewoo":
                scope["demonstrations"] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["rewoo_traj_keys"],
                            q["rewoo_traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate["demonstrations"]
                ]

        scope["prompt"] = self.example["prompt"]
        scope["task_id"] = self.example["task_id"]

        return scope

    def extract_answer(self, document: str) -> bool:
        return document.split("Solution:\n")[-1]

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        if answer is None or not isinstance(answer, str):
            return False

        try:
            ast.parse(answer)
        except Exception as e:
            print(e)
            return False

        task_id = self.example["task_id"]

        solution = self.example["prompt"] + answer

        result = check_correctness(
            dataset="mbpp",
            completion_id=self.index,
            problem=self.example,
            solution=solution,
            expected_output=self.example["expected_output"],
            base_only=False,
            fast_check=False,
            identifier=task_id + " line(1 in x)",
            min_time_limit=1,  # 1
            gt_time_limit_factor=4.0,  # 4.0
        )

        def get_failed_tests(stat, details, inputs, expected):
            if stat == "pass" or not details:
                return []

            return [
                {
                    "inputs": inputs[i],
                    "expected_outputs": expected[i],
                }
                for i in range(len(details))
                if not details[i]
            ]

            # else => simply return the only and the last fail test
            # return [inputs[len(details) - 1]]

        base_stat, base_details = result["base"]
        get_failed_tests(
            base_stat,
            base_details,
            self.example["base_input"],
            self.example["expected_output"].get("base"),
        )
        # if len(base_fail_tests) > 0:
        #     print(base_fail_tests)

        plus_stat, plus_details = result["plus"]
        get_failed_tests(
            plus_stat,
            plus_details,
            self.example["plus_input"],
            self.example["expected_output"].get("plus"),
        )
        # if len(plus_fail_tests) > 0:
        # print(self.example["task_id"], plus_fail_tests)
        return result["base"][0] == "pass" and result["plus"][0] == "pass"
        # if not passing_both:
        #     print(
        #         "FAIL",
        #         self.example["task_id"],
        #         self.example["canonical_solution"],
        #         answer,
        #     )
