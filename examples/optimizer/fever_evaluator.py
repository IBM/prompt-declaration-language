from typing import Any

from pdl.optimize.optimizer_evaluator import OptimizerEvaluator
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import empty_scope


class FEVEREvaluator(OptimizerEvaluator):
    def __init__(
        self,
        *args,
        **kwargs,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.answer_key = "label"

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
                        "question": q["claim"],
                        "reasoning": q["cot"].strip(),
                        "answer": str(q[self.answer_key]).lower(),
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

        scope["claim"] = self.example["claim"]
        return empty_scope | scope

    def extract_answer(self, document: str) -> bool | None:
        #  "SUPPORTS", and otherwise with "REFUTES"
        response = document.splitlines()[-1].lower()
        if "```" in response:
            response = response.split("```")[1]
        supports = "true" in response
        refutes = "false" in response

        if (supports and refutes) or not (supports or refutes):
            return None  # ""

        if supports:
            return True  # "true"

        if refutes:
            return False  # "false"

        return None

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        return answer == truth or document.lower().endswith(str(truth).lower())
