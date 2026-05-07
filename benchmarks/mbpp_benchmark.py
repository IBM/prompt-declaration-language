from abc import abstractmethod
from sys import stderr
from typing import Any

from benchmark import BenchmarkBase, ExperimentConfig
from evalplus.evaluate import check_correctness

from pdl.pdl_infer import PpdlConfig
from pdl.pdl_infer import exec_file as ppdl


class MbppBase(BenchmarkBase):

    def __init__(self, c: ExperimentConfig, secret: str, *, mbpp_plus=False):
        super().__init__(c, secret)
        self.mbpp_plus = mbpp_plus

    @abstractmethod
    def solve(self, problem: str):
        pass

    def passes(self, solution, datapoint) -> bool:
        try:
            task_id = datapoint["task_id"]

            result = check_correctness(
                dataset="mbpp",
                completion_id=0,  # TODO
                problem=datapoint,
                solution=solution,
                expected_output=datapoint["expected_output"],
                base_only=False,
                fast_check=False,
                identifier=task_id + " line(1 in x)",
                min_time_limit=1,
                gt_time_limit_factor=4.0,
            )

            if self.mbpp_plus:
                passes, _ = result["plus"]
            else:
                passes, _ = result["base"]

            return passes == "pass"  # and plus_stat == "pass"
        except Exception as exc:
            print(f"Fail to check `{solution}`: {exc}", file=stderr)
            return False

    def get_question(self, datapoint: dict[str, Any]):
        return datapoint["prompt"]

    def get_answer(self, datapoint: dict[str, Any]):  # Not needed
        pass


class MbppPPDL(MbppBase):
    def solve(self, problem: str):
        config = PpdlConfig(
            algo=self.config.algorithm,
            num_particles=self.config.particles,
            max_workers=self.config.max_workers,
        )
        dist = ppdl(
            prog=self.config.pdl_path,
            ppdl_config=config,
            scope={
                "problem": problem,
                "model": self.config.model,
                "model_parameters": self.config.model_parameters,
                "temperature": self.config.temperature,
            },
            output="all",
        )
        return dist["result"], dist["usage"]
