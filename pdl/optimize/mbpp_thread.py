import json
from pathlib import Path
from typing import Any

from pdl.optimize.util import PDLThread
from pdl.pdl_ast import ScopeType
from pdl.pdl_interpreter import (
    empty_scope,
)
from evalplus.data import get_mbpp_plus, write_jsonl
from evalplus.evaluate import (
    check_correctness,
    get_mbpp_plus_hash,
    get_groundtruth,
    MBPP_OUTPUT_NOT_NONE_TASKS,
)
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed


class MBPPTrialThread(PDLThread):
    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.answer_key = "code"

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

        
        # with ProcessPoolExecutor(max_workers=1) as executor:
        #     eval_results = defaultdict(list)  # task_id ->
        #     future = executor.submit(
        #         check_correctness,
        #         dataset="mbpp",
        #         completion_id=0,
        #         problem=mbpp_plus[task_id],
        #         solution=mbpp_plus[task_id]["canonical_solution"],
        #         expected_output=expected_output[task_id],
        #         base_only=False,
        #         fast_check=True,
        #         identifier=task_id + " line(1 in x)",
        #         min_time_limit=1,
        #         gt_time_limit_factor=4.0,
        #     )
        # print(future.result())
        
        return scope

    def extract_answer(self, document: str) -> bool:
        response = document.split("Solution:\n")[-1]
        
        # solution = {
        #     "task_id": f"Mbpp/{self.example['task_id']}",
        #     "completion": response,
        # }
        # with Path(f"Mbpp/{self.example['task_id']}").open("w") as f:
        #     json.dump(solution, f)

        return response

    def answer_correct(self, document: str, answer: Any, truth: Any) -> bool:
        task_id = f"Mbpp/{self.example['task_id']}"
        mbpp_plus = get_mbpp_plus()

        dataset_hash = get_mbpp_plus_hash()
        expected_output = get_groundtruth(
            mbpp_plus,
            dataset_hash,
            MBPP_OUTPUT_NOT_NONE_TASKS,
        )
        result = check_correctness(
                dataset="mbpp",
                completion_id=self.index,
                problem=mbpp_plus[task_id],
                solution=answer, #mbpp_plus[task_id]["canonical_solution"],
                expected_output=expected_output[task_id],
                base_only=False,
                fast_check=True,
                identifier=task_id + " line(1 in x)",
                min_time_limit=1,
                gt_time_limit_factor=4.0,
            )
        print(result)
        return result["base"][0] == 'pass' and result["plus"][0] == 'pass'
