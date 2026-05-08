from abc import abstractmethod
from sys import stderr
from typing import Any

from benchmark import BenchmarkBase

from pdl.pdl_infer import PpdlConfig
from pdl.pdl_infer import exec_file as ppdl


def is_list_of_true(value):
    results = value[0]
    if isinstance(results, list):
        for result in results:
            if result is not True:
                return False
    return True


MAIN = """
if __name__ == '__main__':
    main()
"""


class LiveCodeBase(BenchmarkBase):

    @abstractmethod
    def solve(self, problem: str):
        pass

    def passes(self, solution, datapoint) -> bool:
        from lcb_runner.benchmarks.code_generation import (  # pylint: disable=import-outside-toplevel
            CodeGenerationProblem,
        )
        from lcb_runner.evaluation.compute_code_generation_metrics import (  # pylint: disable=import-outside-toplevel
            check_correctness,
        )

        try:
            problem = CodeGenerationProblem(**datapoint)
            # if "if __name__ == '__main__':" not in solution:
            #     solution = solution + "\n\n" + MAIN
            result = check_correctness(problem.get_evaluation_sample(), solution, 6)
            print(
                f"True: {is_list_of_true(([True, True, True, True, True], {'execution time': 0.004155635833740234}))}"
            )
            print(
                f"False: {is_list_of_true(([-2], {'output': 'YES\nYES\nYES\nYES\nYES\nYES\n', 'inputs': '6\nabc\nacb\nbac\nbca\ncab\ncba\n', 'expected': 'YES\nYES\nYES\nNO\nNO\nYES\n', 'error_code': -2, 'error_message': 'Wrong answer at output_line_idx=3: YES != NO'}))}"
            )

            return is_list_of_true(result)
        except Exception as exc:
            print(f"Fail to check `{solution}`: {exc}", file=stderr)
            return False

    def get_question(self, datapoint: dict[str, Any]):
        return datapoint["question_content"]

    def get_answer(self, datapoint: dict[str, Any]):  # Not needed
        pass


class LiveCodePPDL(LiveCodeBase):
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
        # for v in dist["result"].values:
        #     print(v)
        return dist["result"], dist["usage"]
