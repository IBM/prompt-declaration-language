"""
Script to download, process, and validate the MBPP dataset.

This script:
1. Loads the MBPP dataset from HuggingFace and EvalPlus
2. Generates expected outputs for test cases
3. Writes the dataset to a JSONL file
4. Validates canonical solutions and creates a sanitized dataset
"""

import json
import logging
import os
import resource
import warnings
from copy import deepcopy
from pathlib import Path
from typing import Any

from datasets import load_dataset  # pylint: disable=wrong-import-order
from evalplus.data import (  # pylint: disable=wrong-import-order
    get_mbpp_plus,
    get_mbpp_plus_hash,
)
from evalplus.evaluate import (  # pylint: disable=wrong-import-order
    MBPP_OUTPUT_NOT_NONE_TASKS,
    check_correctness,
    get_groundtruth,
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Constants
DATASET_DIR = Path(__file__).resolve().parent
OUTPUT_FILENAME = DATASET_DIR / "mbpp_expected_test.jsonl"
SANITIZED_OUTPUT_FILENAME = DATASET_DIR / "mbpp_expected_sanitized_test.jsonl"

# Validation parameters
MIN_TIME_LIMIT = 1
GT_TIME_LIMIT_FACTOR = 4.0

# Memory limit constant (64GB in bytes)
MAX_MEMORY_BYTES = 68719476736

# Store original setrlimit for patching
_ORIGINAL_SETRLIMIT = resource.setrlimit


def _patched_setrlimit(resource_type, limits):
    """Patched setrlimit that catches ValueError on macOS."""
    try:
        return _ORIGINAL_SETRLIMIT(resource_type, limits)
    except ValueError as e:
        # On macOS, setting memory limits may fail with "current limit exceeds maximum limit"
        # We catch this and continue without setting the limit
        warnings.warn(f"Could not set resource limit: {e}. Continuing without limit.")
        return None


# Apply the patch
resource.setrlimit = _patched_setrlimit

# Set memory limit based on system capabilities
# Get the current hard limit for memory
try:
    _, hard_limit = resource.getrlimit(resource.RLIMIT_AS)
    # Use 80% of hard limit or 64GB, whichever is smaller
    # If hard limit is unlimited (-1), use 64GB
    if hard_limit == resource.RLIM_INFINITY:
        memory_limit = MAX_MEMORY_BYTES  # pylint: disable=invalid-name
    else:
        memory_limit = min(
            int(hard_limit * 0.8), MAX_MEMORY_BYTES
        )  # pylint: disable=invalid-name
    os.environ["EVALPLUS_MAX_MEMORY_BYTES"] = str(memory_limit)
    logger.info(
        "Set EVALPLUS_MAX_MEMORY_BYTES to %d bytes (%.2f GB)",
        memory_limit,
        memory_limit / (1024**3),
    )
except (OSError, ValueError) as e:
    logger.warning("Could not set memory limit: %s. Using default.", e)
    # Don't set the environment variable if we can't determine a safe value


def load_mbpp_datasets() -> tuple[Any, dict[str, Any], str, dict[str, Any]]:
    """
    Load MBPP and MBPP+ datasets with expected outputs.

    Returns:
        Tuple of (mbpp_dataset, mbpp_plus_dict, dataset_hash, expected_outputs)
    """
    logger.info("Loading MBPP dataset from HuggingFace...")
    mbpp = load_dataset("google-research-datasets/mbpp", name="full").rename_column(
        "code",
        "canonical_solution",
    )

    logger.info("Loading MBPP+ dataset...")
    mbpp_plus = get_mbpp_plus()
    dataset_hash = get_mbpp_plus_hash()

    logger.info("Generating expected outputs...")
    expected_outputs = get_groundtruth(
        deepcopy(mbpp_plus),
        dataset_hash,
        MBPP_OUTPUT_NOT_NONE_TASKS,
    )

    return mbpp, mbpp_plus, dataset_hash, expected_outputs


def prepare_test_data(
    mbpp: Any, mbpp_plus: dict[str, Any], expected_outputs: dict[str, Any]
) -> list[dict[str, Any]]:
    """
    Prepare test data by filtering and enriching with expected outputs.

    Args:
        mbpp: The MBPP dataset
        mbpp_plus: The MBPP+ dataset dictionary
        expected_outputs: Dictionary of expected outputs by task_id

    Returns:
        List of test examples with expected outputs
    """
    logger.info("Preparing test data...")
    test_task_ids = [f"Mbpp/{t}" for t in mbpp["test"]["task_id"]]  # pyright: ignore

    tests = [v for k, v in mbpp_plus.items() if k in test_task_ids]

    # Add expected outputs to each test
    for test in tests:
        test["expected_output"] = expected_outputs[test["task_id"]]

    logger.info("Prepared %d test examples", len(tests))
    return tests


def extract_example_fields(example: dict[str, Any]) -> dict[str, Any]:
    """
    Extract relevant fields from an example for serialization.

    Args:
        example: The example dictionary

    Returns:
        Dictionary with selected fields
    """
    return {
        "task_id": example["task_id"],
        "prompt": example["prompt"],
        "entry_point": example["entry_point"],
        "canonical_solution": example["canonical_solution"],
        "base_input": example["base_input"],
        "atol": example["atol"],
        "plus_input": example["plus_input"],
        "contract": example["contract"],
        "assertion": example["assertion"],
        "expected_output": example["expected_output"],
    }


def write_dataset_to_jsonl(tests: list[dict[str, Any]], output_path: Path) -> int:
    """
    Write test examples to a JSONL file.

    Args:
        tests: List of test examples
        output_path: Path to output JSONL file

    Returns:
        Number of failed writes
    """
    logger.info("Writing dataset to %s...", output_path)
    failed_count = 0

    with open(output_path, "w", encoding="utf-8") as f:
        for example in tests:
            json_object = extract_example_fields(example)
            try:
                f.write(json.dumps(json_object) + "\n")
            except (TypeError, ValueError) as e:
                logger.warning(
                    "Failed to serialize example %s: %s",
                    example.get("task_id", "unknown"),
                    e,
                )
                failed_count += 1

    if failed_count > 0:
        logger.warning("Failed to write %d examples", failed_count)
    else:
        logger.info("All examples written successfully")

    return failed_count


def validate_solution(datapoint: dict[str, Any], task_id: str) -> bool:
    """
    Validate a solution using the check_correctness function.

    Args:
        datapoint: The datapoint containing the solution
        task_id: The task identifier

    Returns:
        True if the solution passes validation, False otherwise
    """
    solution = datapoint["canonical_solution"]

    result = check_correctness(
        dataset="mbpp",
        completion_id=0,
        problem=datapoint,
        solution=solution,
        expected_output=datapoint["expected_output"],
        base_only=False,
        fast_check=False,
        identifier=f"{task_id} line(1 in x)",
        min_time_limit=MIN_TIME_LIMIT,
        gt_time_limit_factor=GT_TIME_LIMIT_FACTOR,
    )

    base_stat, _ = result["base"]
    # plus_stat is available but not currently used
    # plus_stat, _ = result["plus"]

    # Currently only checking base tests
    return base_stat == "pass"


def validate_and_sanitize_dataset(
    input_path: Path, output_path: Path
) -> tuple[list[dict[str, Any]], list[int], list[str]]:
    """
    Validate all solutions and create a sanitized dataset with only passing examples.

    Args:
        input_path: Path to input JSONL file
        output_path: Path to output sanitized JSONL file

    Returns:
        Tuple of (good_examples, failed_indices, failed_task_ids)
    """
    logger.info("Validating solutions from %s...", input_path)
    good_examples = []
    failed_indices = []
    failed_task_ids = []

    with open(input_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            datapoint = json.loads(line)
            task_id = datapoint["task_id"]

            logger.debug("Validating %s...", task_id)

            if validate_solution(datapoint, task_id):
                good_examples.append(datapoint)
            else:
                failed_indices.append(i + 1)
                failed_task_ids.append(task_id)
                logger.warning("Validation failed for %s (line %d)", task_id, i + 1)

    # Write sanitized dataset using standard json
    logger.info("Writing sanitized dataset to %s...", output_path)
    with open(output_path, "w", encoding="utf-8") as f:
        for item in good_examples:
            f.write(json.dumps(item) + "\n")

    total_count = len(good_examples) + len(failed_indices)
    pass_rate = len(good_examples) / total_count if total_count > 0 else 0
    logger.info(
        "Validation complete: %d/%d passed (%.2f%%)",
        len(good_examples),
        total_count,
        pass_rate * 100,
    )

    return good_examples, failed_indices, failed_task_ids


def main():
    """Main function to orchestrate the dataset preparation and validation."""
    # Load datasets
    mbpp, mbpp_plus, _, expected_outputs = load_mbpp_datasets()

    # Prepare test data
    tests = prepare_test_data(mbpp, mbpp_plus, expected_outputs)

    # Write to JSONL
    write_dataset_to_jsonl(tests, OUTPUT_FILENAME)
    logger.info("MBPP dataset saved to %s", OUTPUT_FILENAME)

    # Validate and sanitize
    _, failed_indices, failed_task_ids = validate_and_sanitize_dataset(
        OUTPUT_FILENAME, SANITIZED_OUTPUT_FILENAME
    )

    # Report results
    logger.info("Sanitized dataset saved to %s", SANITIZED_OUTPUT_FILENAME)
    if failed_indices:
        logger.info("Failed validation for %d examples:", len(failed_indices))
        logger.info("  Indices: %s", failed_indices)
        logger.info("  Task IDs: %s", failed_task_ids)


if __name__ == "__main__":
    main()
