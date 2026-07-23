from typing import Literal

from pydantic import BaseModel, Field


class JsonlDataset(BaseModel):
    train: str = Field(..., description="Path to the training dataset in JSONL format")
    test: str = Field(..., description="Path to the test dataset in JSONL format")
    validation: str = Field(
        ..., description="Path to the validation dataset in JSONL format"
    )


class OptimizationConfig(BaseModel):
    pdl_path: str = Field(..., description="Path to the PDL file to optimize")
    dataset: str | JsonlDataset = Field()
    demonstrations_variable_name: str = Field(default="demonstrations")
    demonstration_columns: list[str] = Field()
    instance_columns: list[str] = Field()
    groundtruth_column: str | None = Field()
    eval_pdl: str | None = Field(
        default=None, description="Path to the PDL file used for evaluation"
    )
    num_candidates: int = Field(default=30)
    num_demonstrations: int | None = Field(default=None)
    initial_validation_set_size: int = Field(default=10)
    max_validation_set_size: int = Field(default=1000)
    max_test_set_size: int = Field(default=1000)
    timeout: int = Field(default=120)
    budget_growth: Literal["double", "to_max"] = Field(default="double")
    shuffle_test: bool = Field(default=False)
    budget: str | None = Field(default=None)
    parallelism: int = Field(default=4)
    train_set_name: str = Field(default="train")
    test_set_name: str = Field(default="test")
    validation_set_name: str = Field(default="validation")
    variables: dict[str, list] = Field(default={})
    experiment_prefix: str = Field(default="")

    def get_variable_names(self) -> list[str]:
        return [self.demonstrations_variable_name, *self.variables.keys()]
