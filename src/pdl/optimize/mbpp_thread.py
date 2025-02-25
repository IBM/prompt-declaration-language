import ast
from pprint import pprint
import re
from typing import Any

from evalplus.evaluate import check_correctness

from pdl.optimize.PDLThread import PDLThread
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
                scope["prompt"] = self.example["react_prompt"]#.strip('"""').strip().strip('"""').strip()
                scope["demonstrations"] = [
                    {
                        "question": q["react_prompt"],
                        "answer": str(q[self.answer_key]),
                    }
                    for q in self.candidate["demonstrations"]
                ]
            case "react":
                scope["prompt"] = self.example["react_prompt"]
                # pprint(self.candidate["demonstrations"])
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

        scope["task_id"] = self.example["task_id"]

        return scope

    def extract_answer(self, document: str) -> bool:
        solution = document.split("Solution:\n")[-1]
        if "```" in solution:
            solution = solution.replace("```python", "```")
            solution = solution.split("```")[1]
        solution = solution.strip()
        # print("Solution IN THREAD:", solution)
        return solution

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        # print("ENTERING ANSWER CODE", answer)
        if answer is None or not isinstance(answer, str):
            return False

        retry_parse = False
        try:
            ast.parse(answer)
        except Exception as e:
            # print(e)
            print(f"Failed to parse ```\n{answer}\n```. Exception {e}")
            # return False
            retry_parse = True

        if retry_parse:
            pattern = r"```(?:python)?\n(.*?)\n```"
            match = re.search(pattern, answer, re.DOTALL)
            if match:
                answer = match.group(1)
                try:
                    ast.parse(answer)
                except Exception as e:
                    print(e)
                    return False
            else:
                return False

        task_id = self.example["task_id"]

        solution = self.example["prompt"] + answer

        # print("SOLUTION")
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
        base_fail_tests = get_failed_tests(
            base_stat,
            base_details,
            self.example["base_input"],
            self.example["expected_output"].get("base"),
        )
        if len(base_fail_tests) > 0:
            pass #print(self.example["task_id"], base_fail_tests)

        plus_stat, plus_details = result["plus"]
        plus_fail_tests = get_failed_tests(
            plus_stat,
            plus_details,
            self.example["plus_input"],
            self.example["expected_output"].get("plus"),
        )
        if len(plus_fail_tests) > 0:
            pass #print(self.example["task_id"], plus_fail_tests)

        return base_stat == "pass" and plus_stat == "pass"
        #result["base"][0] == "pass" and result["plus"][0] == "pass"
        # if not passing_both:
        #     print(
        #         "FAIL",
        #         self.example["task_id"],
        #         self.example["canonical_solution"],
        #         answer,
        #     )
