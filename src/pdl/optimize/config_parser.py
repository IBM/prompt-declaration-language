from typing import Literal

from pydantic import BaseModel, Field


class OptimizationConfig(BaseModel):
    benchmark: str = Field()
    num_candidates: int = Field(default=30)
    num_demonstrations: int = Field(default=5)
    initial_test_set_size: int = Field(default=10)
    max_test_set_size: int = Field(default=1000)
    timeout: int = Field(default=120)
    budget_growth: Literal["double", "to_max"] = Field(default="double")
    shuffle_test: bool = Field(default=False)
    budget: str | None = Field(default=None)
    parallelism: int = Field(default=4)
    train_set_name: str = Field(default="train")
    test_set_name: str = Field(default="test")
    validation_set_name: str = Field(default="validation")
    demonstrations_variable_name: str = Field(default="demonstrations")
    variables: dict[str, list] = Field(default={})
    experiment_prefix: str = Field(default="")

    def get_variable_names(self) -> list[str]:
        return [self.demonstrations_variable_name, *self.variables.keys()]
