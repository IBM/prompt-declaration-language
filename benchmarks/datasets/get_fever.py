"""
Script to process the FEVER dataset from BIG-bench.

Prerequisites:
    Download the task.json file first:
    wget https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/
         bigbench/benchmark_tasks/fact_checker/fever/task.json

This script:
1. Loads the FEVER dataset from the downloaded task.json file
2. Extracts the examples
3. Writes them to a JSONL file
"""

import json
import logging
from pathlib import Path
from typing import Any

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Constants
DATASET_DIR = Path(__file__).resolve().parent
INPUT_FILENAME = DATASET_DIR / "task.json"
OUTPUT_FILENAME = DATASET_DIR / "fever_test.jsonl"


def load_fever_dataset(input_path: Path) -> dict[str, Any]:
    """
    Load the FEVER dataset from the task.json file.

    Args:
        input_path: Path to the task.json file

    Returns:
        The loaded dataset dictionary

    Raises:
        FileNotFoundError: If the task.json file is not found
    """
    logger.info("Loading FEVER dataset from %s...", input_path)

    if not input_path.exists():
        error_msg = (
            f"File not found: {input_path}\n"
            "Please download it first:\n"
            "wget https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/"
            "bigbench/benchmark_tasks/fact_checker/fever/task.json"
        )
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    logger.info("Dataset loaded successfully")
    return data


def write_examples_to_jsonl(examples: list[dict[str, Any]], output_path: Path) -> int:
    """
    Write examples to a JSONL file.

    Args:
        examples: List of example dictionaries
        output_path: Path to output JSONL file

    Returns:
        Number of examples written
    """
    logger.info("Writing examples to %s...", output_path)
    count = 0

    with open(output_path, "w", encoding="utf-8") as f:
        for entry in examples:
            try:
                json.dump(entry, f)
                f.write("\n")
                count += 1
            except (TypeError, ValueError) as e:
                logger.warning("Failed to serialize entry: %s", e)

    logger.info("Successfully wrote %d examples to %s", count, output_path)
    return count


def main():
    """Main function to orchestrate the dataset processing."""
    try:
        # Load dataset
        data = load_fever_dataset(INPUT_FILENAME)

        # Extract examples
        examples = data.get("examples", [])
        if not examples:
            logger.warning("No examples found in the dataset")
            return

        # Write to JSONL
        count = write_examples_to_jsonl(examples, OUTPUT_FILENAME)

        logger.info("FEVER dataset processing complete: %d examples saved", count)

    except FileNotFoundError as e:
        logger.error("Failed to process dataset: %s", e)
        raise
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Failed to parse dataset: %s", e)
        raise


if __name__ == "__main__":
    main()
