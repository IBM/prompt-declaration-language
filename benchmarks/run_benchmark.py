import argparse
import os
import sys
import traceback
from pathlib import Path

import yaml
from benchmark import BENCHMARK_DIR, BenchmarkBase, ExperimentConfig, make_results_paths
from fever_benchmark import FeverPPDL
from gsm8k_benchmark import Gsm8kPPDL
from jinja2 import Template
from live_code_benchmark import LiveCodePPDL
from math500_benchmark import Math500PPDL
from mbpp_benchmark import MbppPPDL


def redact_rits_api_key_in_files(secret: str, files):
    replace_in_files(secret, "${ RITS_API_KEY }", files)


def replace_in_files(old_string, new_string, files):
    for file_path in files:
        try:
            # Read the file content
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()

            # Replace the string
            updated_content = content.replace(old_string, new_string)

            # Write the updated content back to the file
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(updated_content)
        except FileNotFoundError:
            print(f"File not found: {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PPDL benchmarking tool",
    )

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "--config",
        "-c",
        help="Benchmarking config file",
        type=Path,
        required=True,
    )
    parser.add_argument(
        "--dir",
        "-d",
        type=Path,
        default=BENCHMARK_DIR / "results",
        help="Specify the directory where to store the results",
    )
    args = parser.parse_args()

    if not args.config.exists():
        print("Config file doesn't exist:", args.config)
        sys.exit(1)

    with open(args.config, "r", encoding="utf-8") as c:
        config_str = c.read()

    expr_start_string = "${"
    expr_end_string = "}"
    rits_api_key = os.environ["RITS_API_KEY"]
    template = Template(
        config_str,
        keep_trailing_newline=True,
        block_start_string="{%%%%%PDL%%%%%%%%%%",
        block_end_string="%%%%%PDL%%%%%%%%%%}",
        variable_start_string=expr_start_string,
        variable_end_string=expr_end_string,
        # comment_start_string="",
        # comment_end_string="",
        autoescape=False,
        # undefined=StrictUndefined,
    )
    config_str = template.render({"RITS_API_KEY": rits_api_key})
    config_dict = yaml.safe_load(config_str)

    # Set config name
    config_name = config_dict.get("name", Path(args.config).stem)
    aggregated_results_path, examples_results_path = make_results_paths(
        config_name, args.dir
    )
    config_dict = {
        "name": config_name,
        "aggregated_results_path": aggregated_results_path,
        "examples_results_path": examples_results_path,
    } | config_dict

    try:
        config = ExperimentConfig(**config_dict)
    except Exception:
        print("Couldn't load config:", args.config)
        traceback.print_last()
        sys.exit(1)

    runner: BenchmarkBase
    if config.task == "gsm8k":
        runner = Gsm8kPPDL(config, rits_api_key)
    elif config.task == "mbpp":
        runner = MbppPPDL(config, rits_api_key)
    elif config.task == "mbpp-plus":
        runner = MbppPPDL(config, rits_api_key, mbpp_plus=True)
    elif config.task == "fever":
        runner = FeverPPDL(config, rits_api_key)
    elif config.task == "live-code":
        runner = LiveCodePPDL(config, rits_api_key)
    elif config.task == "math500":
        runner = Math500PPDL(config, rits_api_key)

    try:
        runner.run()
    finally:
        redact_rits_api_key_in_files(
            rits_api_key, [config.aggregated_results_path, config.examples_results_path]
        )


if __name__ == "__main__":
    main()
