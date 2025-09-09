from typing import Any

from pdl.optimize.optimizer_evaluator import OptimizerEvaluator
from pdl.pdl import exec_str
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import empty_scope


class PdlEvaluator(OptimizerEvaluator):
    def __init__(
        self,
        # scoring_pdl: str,
        *args,
        **kwargs,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.scoring_pdl = self.config.eval_pdl
        if self.config.groundtruth_column is None:
            raise ValueError("Groundtruth column must be specified")
        self.answer_key = self.config.groundtruth_column

    def get_scope(self) -> ScopeType:
        demo_var = self.config.demonstrations_variable_name

        scope = {}

        for k in self.config.variables:
            if k in self.candidate:
                scope[k] = self.candidate[k]

        scope[demo_var] = [
            {k: q[k] for k in self.config.demonstration_columns}
            for q in self.candidate[demo_var]
        ]

        for k in self.config.instance_columns:
            if k in self.example:
                scope[k] = self.example[k]

        return empty_scope | scope

    def score(self, document: str, ground_truth: Any) -> float:
        scope = empty_scope | {"document": document, "ground_truth": ground_truth}
        prog = f"""defs:
  scoring:
    import: "{self.scoring_pdl}"
lastOf:
  - call: ${{ scoring.score }}
    args:
        document: ${{ document }}
        ground_truth: ${{ ground_truth }}"""
        result = exec_str(prog=prog, scope=scope, output="result")

        if isinstance(result, str):
            result = result.strip()
        # Note: this breaks if the result is not a number
        return float(result)
