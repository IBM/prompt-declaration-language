"""
Script to download and process the LiveCodeBench dataset.

This script:
1. Loads the LiveCodeBench code_generation_lite dataset from HuggingFace
2. Writes the test split to a JSONL file
"""

import json
import logging
from pathlib import Path
from typing import Any

from datasets import load_dataset

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Constants
DATASET_DIR = Path(__file__).resolve().parent
OUTPUT_FILENAME = DATASET_DIR / "live_code_test.jsonl"
DATASET_NAME = "livecodebench/code_generation_lite"
VERSION_TAG = "release_v6"
SPLIT_NAME = "test"


def load_live_code_bench_dataset() -> Any:
    """
    Load the LiveCodeBench dataset from HuggingFace.

    Returns:
        The loaded dataset
    """
    logger.info(
        "Loading %s dataset (version: %s) from HuggingFace...",
        DATASET_NAME,
        VERSION_TAG,
    )
    dataset = load_dataset(DATASET_NAME, version_tag=VERSION_TAG)
    logger.info("Dataset loaded successfully")
    return dataset


def write_dataset_to_jsonl(dataset: Any, output_path: Path) -> int:
    """
    Write dataset test split to a JSONL file.

    Args:
        dataset: The dataset to write
        output_path: Path to output JSONL file

    Returns:
        Number of examples written
    """
    logger.info("Writing %s split to %s...", SPLIT_NAME, output_path)
    count = 0

    with open(output_path, "w", encoding="utf-8") as f:
        for datapoint in dataset[SPLIT_NAME]:
            try:
                f.write(json.dumps(datapoint) + "\n")
                count += 1
            except (TypeError, ValueError) as e:
                logger.warning("Failed to serialize datapoint: %s", e)

    logger.info("Successfully wrote %d examples to %s", count, output_path)
    return count


def main():
    """Main function to orchestrate the dataset download and processing."""
    # Load dataset
    dataset = load_live_code_bench_dataset()

    # Write to JSONL
    count = write_dataset_to_jsonl(dataset, OUTPUT_FILENAME)

    logger.info("LiveCodeBench dataset processing complete: %d examples saved", count)


if __name__ == "__main__":
    main()
