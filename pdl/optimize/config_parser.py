import argparse
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field


class OptimizationConfig(BaseModel):
    benchmark: Literal[
        "gsm8k",
        "gsm8k-baseline",
        "gsm8k-bench",
        "fever",
        "evalplus",
    ] = Field()
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
    demonstrations_variable_name: str = Field(default="demonstrations")
    variables: dict[str, list] = Field(default={})

    def get_variable_names(self) -> list[str]:
        return [self.demonstrations_variable_name, *self.variables.keys()]


if __name__ == "__main__":
    # config = OptimizationConfig(
    #     benchmark="gsm8k",
    # )
    # Path("opticonfig.yml").write_text(
    #     yaml.dump(config.model_dump(
    #         exclude_defaults=False, exclude_none=False, exclude_unset=False
    #     ))
    # )
    parser = argparse.ArgumentParser("")
    parser.add_argument(
        "config_file",
        type=Path,
        help="Path to a PDL file to optimize",
    )
    args = parser.parse_args()

    config_text = args.config_file.read_text()
    config_dict = yaml.safe_load(config_text)
    config = OptimizationConfig(**config_dict)
    print(config)
    print(config.get_variable_names())
    Path("opticonfig1.yml").write_text(
        yaml.dump(
            config.model_dump(
                exclude_defaults=False,
                exclude_none=False,
                exclude_unset=False,
            ),
        ),
    )
