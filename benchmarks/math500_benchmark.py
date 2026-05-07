from abc import abstractmethod
from sys import stderr
from typing import Any

from benchmark import BenchmarkBase
from math_verify import parse, verify

from pdl.pdl_infer import PpdlConfig
from pdl.pdl_infer import exec_file as ppdl


class Math500Base(BenchmarkBase):

    @abstractmethod
    def solve(self, problem: str):
        pass

    def passes(self, solution: str, datapoint: dict[str, Any]) -> bool:
        try:
            truth = self.get_answer(datapoint)
            gold = parse(pred=truth, parsing_timeout=None)
            answer = parse(pred=solution, parsing_timeout=None)

            # Verify if the parsed answers are mathematically equivalent
            return verify(gold, answer, timeout_seconds=None)

        except Exception as exc:
            print(f"Fail to check `{solution}`: {exc}", file=stderr)
            return False

    def get_question(self, datapoint: dict[str, Any]):
        return datapoint["problem"]

    def get_answer(self, datapoint: dict[str, Any]):
        return datapoint["answer"]


class Math500PPDL(Math500Base):
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
