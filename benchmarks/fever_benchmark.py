from abc import abstractmethod
from typing import Any

from benchmark import BENCHMARK_DIR, BenchmarkBase

from pdl.pdl_infer import PpdlConfig
from pdl.pdl_infer import exec_file as ppdl


class FeverBase(BenchmarkBase):

    @abstractmethod
    def solve(self, problem: str):
        pass

    def passes(self, solution, datapoint) -> bool:
        return str(self.get_answer(datapoint)).lower() in solution.lower()

    def get_question(self, datapoint: dict[str, Any]):
        return datapoint["input"]

    def get_answer(self, datapoint: dict[str, Any]):
        if datapoint["target_scores"]["true"] == 1:
            return True
        return False


class FeverPPDL(FeverBase):
    def solve(self, problem: str):
        config = PpdlConfig(
            algo=self.config.algorithm,
            num_particles=self.config.particles,
            max_workers=self.config.max_workers,
        )
        dist = ppdl(
            prog=BENCHMARK_DIR / self.config.pdl_path,
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
