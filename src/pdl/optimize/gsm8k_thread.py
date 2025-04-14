from typing import Any

from pdl.optimize.parse_number import extract_math_answer
from pdl.optimize.PDLThread import PDLThread
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import empty_scope
from pdl.pdl_lazy import PdlApply


class Gsm8kTrialThread(PDLThread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)

    def get_scope(self) -> ScopeType:
        demo_var = self.config.demonstrations_variable_name

        scope = {}

        for k in self.config.variables:
            if k in self.candidate:
                scope[k] = self.candidate[k]

        match self.candidate.get("prompt_pattern", None):
            case "cot":
                scope[demo_var] = [
                    {
                        "question": q["question"],
                        "reasoning": q["reasoning"],
                        "answer": str(q["answer"]),
                    }
                    for q in self.candidate[demo_var]
                ]
            case "react":
                scope[demo_var] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["traj_keys"],
                            q["traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate[demo_var]
                ]
            case "rewoo":
                scope[demo_var] = [
                    [
                        {key: value}
                        for key, value in zip(
                            q["rewoo_traj_keys"],
                            q["rewoo_traj_values"],
                            strict=True,
                        )
                    ]
                    for q in self.candidate[demo_var]
                ]
            case _:
                pass

        scope["question"] = self.example["question"]
        scope["reasoning"] = self.example["reasoning"]
        return empty_scope | scope

    def extract_answer(self, document: PdlApply) -> Any:
        return extract_math_answer(document.result())

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        return answer == truth or document.endswith(f" {truth}")
