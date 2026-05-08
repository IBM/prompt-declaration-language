import argparse
import os
import shlex
import subprocess  # nosec B404
from collections.abc import Sequence
from concurrent.futures import ThreadPoolExecutor, as_completed
from sys import stderr
from typing import Any

import yaml
from tqdm import tqdm

# [B404:blacklist] Consider possible security implications associated with the subprocess module.
# We are controlling the executed commands.


# pylint: disable=too-many-arguments
def config_generator(
    *,
    task: str,
    dataset: str,
    pdl_path: str,
    algorithms: list[str],
    models_and_parameters: Sequence[tuple[str, dict[str, Any] | None]],
    particles: list[int],
    temperatures: list[float],
    num_tests: int,
    max_tests: int | None,
) -> list[dict]:
    if max_tests is not None:
        num_tests = min(num_tests, max_tests)
    configs = []
    for particle in particles:
        for temperature in temperatures:
            for model, model_parameters in models_and_parameters:
                for algorithm in algorithms:
                    name = make_name(task, temperature, particle, model, algorithm)
                    # aggregated_results_path, examples_results_path = make_results_paths(name)
                    config = {
                        "name": name,
                        # aggregated_results_path=aggregated_results_path,
                        # examples_results_path=examples_results_path,
                        "task": task,
                        "dataset": dataset,
                        "pdl_path": pdl_path,
                        "model": model,
                        "model_parameters": model_parameters,
                        "algorithm": algorithm,
                        "temperature": temperature,
                        "particles": particle,
                        "num_tests": num_tests,
                    }
                    configs.append(config)
    return configs


def exec_one(config: dict, directory: str, experiment_id: int):
    experiments_dir = f"{directory}/experiments"
    logs_dir = f"{directory}/logs"
    results_dir = f"{directory}/results"
    os.makedirs(directory, exist_ok=True)
    os.makedirs(f"{experiments_dir}", exist_ok=True)
    os.makedirs(f"{logs_dir}", exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    config_file_name = f"{experiments_dir}/{config['name']}.yaml"
    with open(config_file_name, "w", encoding="utf-8") as config_file:
        yaml.dump(config, config_file, sort_keys=False)
    out_log_file_name = f"{logs_dir}/{config['name']}-{experiment_id}.out"
    err_log_file_name = f"{logs_dir}/{config['name']}-{experiment_id}.err"
    with (
        open(out_log_file_name, "w", encoding="utf-8") as out_log,
        open(err_log_file_name, "w", encoding="utf-8") as err_log,
    ):
        cmd = [
            "python",
            "run_benchmark.py",
            "-c",
            shlex.quote(config_file_name),
            "-d",
            shlex.quote(results_dir),
        ]
        print(f"Start: {out_log_file_name}", flush=True)
        result = subprocess.run(  # nosec B603
            cmd, stdout=out_log, stderr=err_log, check=False
        )
        # [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
        # We are quoting user arguments.
        print(f"Completed ({result.returncode}): {out_log_file_name}")
    return (config, result)


def exec_all(configs, directory, max_workers, repeat):
    with ThreadPoolExecutor(max_workers) as executor:
        runs = []
        print("Launch tasks")
        for i in range(repeat):
            futures = []
            for config in list(configs):
                future = executor.submit(exec_one, config, directory, i)
                futures.append(future)
            runs.append(futures)
        for i, futures in enumerate(runs):
            print(f"----- Run {i} -----")
            for future in tqdm(as_completed(futures), total=len(futures)):
                _ = future.result()
        print("Done")


def make_name(task, temperature, particles, model, algorithm):
    match model:
        case x if "granite-4-h-small" in x or "granite-4.0-h-small" in x:
            m = "granite4small"
        case x if "granite-4-h-tiny" in x or "granite-4.0-h-tiny" in x:
            m = "granite4tiny"
        case x if "granite-4-micro" in x or "granite-4.0-micro" in x:
            m = "granite4micro"
        case x if "gpt-oss-120b" in x:
            m = "gpt120"
        case x if "gpt-oss-20b" in x:
            m = "gpt20"
        case x if "llama-3-3-70b-instruct" in x:
            m = "llama3"
        case x if "llama-4-maverick-17b-128e-instruct-fp8" in x:
            m = "llama4mvk"
        case x if "Llama-4-Scout-17B-16E-Instruct" in x:
            m = "llama4scout"
        case x if "Qwen3-8B" in x:
            m = "qwen8b"
        case x if "Qwen3-30B-A3B-Thinking-2507" in x:
            m = "qwen30b"
        case x if "Devstral-Small-2-24B-Instruct-2512" in x:
            m = "devstral24b"
        case x if "Devstral-2-123B-Instruct-2512" in x:
            m = "devstral123b"
        case _:
            print(f"Unexpected model name: {model}", file=stderr)
            m = model
    match algorithm:
        case x if x == "parallel-is":
            a = "is"
        case x if x == "parallel-smc":
            a = "smc"
        case x if x == "parallel-maj":
            a = "maj"
        case _:
            print(f"Unexpected algorithm name: {algorithm}", file=stderr)
            a = algorithm
    return f"{task}-t{temperature}-p{particles}-{m}-{a}"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PPDL benchmarking tool",
    )
    parser.add_argument(
        "--task",
        "-t",
        help="Task to execute",
        type=str,
        choices=[
            "gsm8k",
            "mbpp",
            "mbpp-simple",
            "mbpp-assert",
            "mbpp-react",
            "mbpp-pipeline",
            "mbpp-plus",
            "fever",
            "fever-confidence",
            "live-code",
            "math500",
        ],
        required=True,
    )
    parser.add_argument(
        "--dir",
        "-d",
        help="Directory where to save results",
        type=str,
        required=True,
    )
    parser.add_argument(
        "--repeat",
        "-r",
        help="Number of times the benchmark should be executed",
        type=int,
        required=True,
    )
    parser.add_argument(
        "--workers",
        "-w",
        help="Maximal number of workers to execute the benchmarks",
        type=int,
        default=2,
    )
    parser.add_argument(
        "--platform",
        "-p",
        help="Platform hosting the models",
        type=str,
        choices=["watsonx", "rits"],
        default="rits",
    )
    parser.add_argument(
        "--samples",
        "-s",
        help="Set the maximal number of samples to execute",
        type=int,
        default=None,
    )

    args = parser.parse_args()

    watsonx_models_and_parameters: list[tuple[str, dict[str, Any]]] = [
        ("watsonx/ibm/granite-4-h-small", {}),
        ("watsonx/meta-llama/llama-4-maverick-17b-128e-instruct-fp8", {}),
        ("watsonx/meta-llama/llama-3-3-70b-instruct", {}),
        ("watsonx/openai/gpt-oss-120b", {}),
    ]

    rits_models_and_parameters: list[tuple[str, dict[str, Any]]] = [
        (
            "openai/openai/gpt-oss-20b",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/gpt-oss-20b/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/openai/gpt-oss-120b",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/gpt-oss-120b/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/ibm-granite/granite-4.0-micro",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/granite-4-micro/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/ibm-granite/granite-4.0-h-tiny",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/granite-4-h-tiny/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/ibm-granite/granite-4.0-h-small",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/granite-4-h-small/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/meta-llama/Llama-4-Scout-17B-16E-Instruct",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/llama-4-scout-17b-16e-instruct/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
        (
            "openai/meta-llama/llama-4-maverick-17b-128e-instruct-fp8",
            {
                "api_base": "https://inference-3scale-apicast-production.apps.rits.fmaas.res.ibm.com/llama-4-mvk-17b-128e-fp8/v1",
                "extra_headers": {"RITS_API_KEY": "${RITS_API_KEY}"},
            },
        ),
    ]

    match args.platform:
        case "watsonx":
            models_and_parameters = watsonx_models_and_parameters
        case "rits":
            models_and_parameters = rits_models_and_parameters
        case _:
            assert False

    match args.task:
        case "gsm8k":
            gsm8k_configs = config_generator(
                task="gsm8k",
                dataset="datasets/gsm8k_test.jsonl",
                pdl_path="pdl/gsm8k/gsm8k.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=500,
                max_tests=args.samples,
            )
            exec_all(gsm8k_configs, args.dir, args.workers, args.repeat)

        case "mbpp":
            mbpp_configs = config_generator(
                task="mbpp",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_configs, args.dir, args.workers, args.repeat)
        case "mbpp-simple":
            mbpp_configs = config_generator(
                task="mbpp",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp_simple.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_configs, args.dir, args.workers, args.repeat)
        case "mbpp-assert":
            mbpp_configs = config_generator(
                task="mbpp",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp_assert.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_configs, args.dir, args.workers, args.repeat)
        case "mbpp-pipeline":
            mbpp_configs = config_generator(
                task="mbpp",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp_pipeline.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_configs, args.dir, args.workers, args.repeat)
        case "mbpp-react":
            mbpp_react_configs = config_generator(
                task="mbpp",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp_react.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_react_configs, args.dir, args.workers, args.repeat)
        case "mbpp-plus":
            mbpp_plus_configs = config_generator(
                task="mbpp-plus",
                dataset="datasets/mbpp_expected_sanitized_test.jsonl",
                pdl_path="pdl/mbpp/mbpp.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=197,
                max_tests=args.samples,
            )
            exec_all(mbpp_plus_configs, args.dir, args.workers, args.repeat)
        case "fever":
            fever_configs = config_generator(
                task="fever",
                dataset="datasets/fever_test.jsonl",
                pdl_path="pdl/fever/fever.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=500,
                max_tests=args.samples,
            )
            exec_all(fever_configs, args.dir, args.workers, args.repeat)
        case "fever-confidence":
            fever_configs = config_generator(
                task="fever",
                dataset="datasets/fever_test.jsonl",
                pdl_path="pdl/fever/fever_confidence.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=500,
                max_tests=args.samples,
            )
            exec_all(fever_configs, args.dir, args.workers, args.repeat)
        case "live-code":
            live_code_configs = config_generator(
                task="live-code",
                dataset="datasets/live_code_test.jsonl",
                pdl_path="pdl/live_code/live_code.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=500,
                max_tests=args.samples,
            )
            exec_all(live_code_configs, args.dir, args.workers, args.repeat)
        case "math500":
            math500_configs = config_generator(
                task="math500",
                dataset="datasets/math_500_test.jsonl",
                pdl_path="pdl/math500/math500.pdl",
                algorithms=["parallel-is", "parallel-smc", "parallel-maj"],
                models_and_parameters=models_and_parameters,
                particles=[5],
                temperatures=[0.8],
                num_tests=500,
                max_tests=args.samples,
            )
            exec_all(math500_configs, args.dir, args.workers, args.repeat)


if __name__ == "__main__":
    main()
