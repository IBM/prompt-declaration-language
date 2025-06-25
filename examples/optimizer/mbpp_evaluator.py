import ast
import re
from typing import Any

from evalplus.evaluate import check_correctness

from pdl.optimize.optimizer_evaluator import OptimizerEvaluator
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import empty_scope


class MBPPEvaluator(OptimizerEvaluator):
    def __init__(
        self,
        *args,
        **kwargs,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.answer_key = "canonical_solution"

    def get_scope(self) -> ScopeType:
        scope = {}
        if "model" in self.candidate:
            scope["model"] = self.candidate["model"]

        if "prompt_pattern" in self.candidate:
            scope["prompt_pattern"] = self.candidate["prompt_pattern"]

        scope["prompt"] = self.example["react_prompt"]

        match self.candidate.get("prompt_pattern", None):
            case "cot":
                scope["prompt"] = self.example["react_prompt"]
                scope["demonstrations"] = [
                    {
                        "question": q["react_prompt"],
                        "answer": str(q[self.answer_key]),
                    }
                    for q in self.candidate["demonstrations"]
                ]
            case "react":
                scope["prompt"] = self.example["react_prompt"]
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
            case _:
                pass

        scope["task_id"] = self.example["task_id"]

        return empty_scope | scope

    def extract_answer(self, document: str) -> str:
        solution = document.split("Solution:\n")[-1]
        if "```" in solution:
            solution = solution.replace("```python", "```")
            solution = solution.split("```")[1]
        return solution.strip()

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        if answer is None or not isinstance(answer, str):
            return False

        retry_parse = False
        try:
            ast.parse(answer)
        except Exception as e:
            print(f"Failed to parse ```\n{answer}\n```. Exception {e}")
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

        result = check_correctness(
            dataset="mbpp",
            completion_id=self.index,
            problem=self.example,
            solution=solution,
            expected_output=self.example["expected_output"],
            base_only=False,
            fast_check=False,
            identifier=task_id + " line(1 in x)",
            min_time_limit=1,
            gt_time_limit_factor=4.0,
        )

        base_stat, _ = result["base"]
        plus_stat, _ = result["plus"]

        return base_stat == "pass" and plus_stat == "pass"
