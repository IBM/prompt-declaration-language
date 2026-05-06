from typing import Any
from benchmark import Benchmark_Base
from abc import abstractmethod
from pdl.pdl_infer import PpdlConfig, exec_file as ppdl



class FEVER_Base(Benchmark_Base):

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


class FEVER_PPDL(FEVER_Base):
    def solve(self, problem: str):
        config = PpdlConfig(
            algo=self.config.algorithm,
            num_particles=self.config.particles,
            max_workers=self.config.max_workers
        )
        dist = ppdl(
            prog=self.config.pdl_path,
            ppdl_config=config,
            scope={
                "problem": problem,
                "model": self.config.model,
                "model_parameters": self.config.model_parameters,
                "temperature": self.config.temperature
            },
            output="all"
        )
        return dist["result"], dist["usage"]
