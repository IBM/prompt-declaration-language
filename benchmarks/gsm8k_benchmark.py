import re
from sys import stderr
from typing import Any
from benchmark import Benchmark_Base
from abc import abstractmethod
from collections import Counter
from pdl.pdl import exec_file, InterpreterConfig
from pdl.pdl_infer import exec_file as ppdl, PpdlConfig
from pdl.pdl_distributions import Categorical

class GSM8K_Base(Benchmark_Base):
    def extract_ground_truth(self, answer: str):
        regex = "(.|\n)*#### (?P<answer>([0-9])*)\n*"
        match = re.match(regex, answer)
        return match["answer"] 

    @abstractmethod 
    def solve(self, problem: str):
        pass
    
    def passes(self, solution: str, datapoint: dict[str, Any]) -> bool:
        try:
            answer = self.get_answer(datapoint)
            truth =  self.extract_ground_truth(answer)
            if float(truth) == float(solution):
                return True
            return False
        except Exception as exc:
            print(f"Fail to check `{solution}`: {exc}", file=stderr)
            return False
        

    def get_question(self, datapoint: dict[str, Any]):
        return datapoint["question"]

    
    def get_answer(self, datapoint: dict[str, Any]):
        return datapoint["answer"]


class GSM8K_PPDL(GSM8K_Base):
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
            output="all")
        return dist["result"], dist["usage"]
