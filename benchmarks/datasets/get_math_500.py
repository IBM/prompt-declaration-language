"""
Script to download and process the MATH-500 dataset.

This script:
1. Loads the MATH-500 dataset from HuggingFace
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
OUTPUT_FILENAME = DATASET_DIR / "math_500_test.jsonl"
DATASET_NAME = "HuggingFaceH4/MATH-500"
SPLIT_NAME = "test"


def load_math_500_dataset() -> Any:
    """
    Load the MATH-500 dataset from HuggingFace.

    Returns:
        The loaded dataset
    """
    logger.info("Loading %s dataset from HuggingFace...", DATASET_NAME)
    dataset = load_dataset(DATASET_NAME)
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
    dataset = load_math_500_dataset()

    # Write to JSONL
    count = write_dataset_to_jsonl(dataset, OUTPUT_FILENAME)

    logger.info("MATH-500 dataset processing complete: %d examples saved", count)


if __name__ == "__main__":
    main()
