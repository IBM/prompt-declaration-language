import argparse
import os
import sys
import traceback
from pathlib import Path

from jinja2 import Template
import yaml

from benchmark import ExperimentConfig, Benchmark_Base, make_results_paths
from gsm8k_benchmark import GSM8K_PPDL
from mbpp_benchmark import MBPP_PPDL
from fever_benchmark import FEVER_PPDL
from live_code_benchmark import Live_Code_PPDL
from math500_benchmark import Math500_PPDL



def redact_rits_api_key_in_files(secret: str, files):
    replace_in_files(secret, "${ RITS_API_KEY }", files)

def replace_in_files(old_string, new_string, files):
    for file_path in files:
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Replace the string
            updated_content = content.replace(old_string, new_string)

            # Write the updated content back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
        except FileNotFoundError:
            print(f"File not found: {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

def main():
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
        type=str,
        default="results",
        help="Specify the directory where to store the results")
    args = parser.parse_args()

    if not args.config.exists():
        print("Config file doesn't exist:", args.config)
        sys.exit(1)

    with open(args.config, 'r') as c:
        config_str = c.read()

    EXPR_START_STRING = "${"
    EXPR_END_STRING = "}"
    rits_api_key = os.environ["RITS_API_KEY"]
    template = Template(
            config_str,
            keep_trailing_newline=True,
            block_start_string="{%%%%%PDL%%%%%%%%%%",
            block_end_string="%%%%%PDL%%%%%%%%%%}",
            variable_start_string=EXPR_START_STRING,
            variable_end_string=EXPR_END_STRING,
            # comment_start_string="",
            # comment_end_string="",
            autoescape=False,
            # undefined=StrictUndefined,
    )
    config_str = template.render({"RITS_API_KEY": rits_api_key})
    config_dict = yaml.safe_load(config_str)

    # Set config name
    config_name = config_dict.get("name", Path(args.config).stem)
    aggregated_results_path, examples_results_path = make_results_paths(config_name, args.dir)
    config_dict = {"name": config_name, "aggregated_results_path": aggregated_results_path, "examples_results_path": examples_results_path} | config_dict

    try:
        config = ExperimentConfig(**config_dict)
    except Exception:
        print("Couldn't load config:", args.config)
        traceback.print_last()
        sys.exit(1)


    runner: Benchmark_Base
    if config.task == "gsm8k":
        runner = GSM8K_PPDL(config, rits_api_key)
    elif config.task == "mbpp":
        runner = MBPP_PPDL(config, rits_api_key)
    elif config.task == "mbpp-plus":
        runner = MBPP_PPDL(config, rits_api_key, mbpp_plus=True)
    elif config.task == "fever":
        runner = FEVER_PPDL(config, rits_api_key)
    elif config.task == "live-code":
        runner = Live_Code_PPDL(config, rits_api_key)
    elif config.task == "math500":
        runner = Math500_PPDL(config, rits_api_key)
    
    try:
        runner.run()
    finally:
        redact_rits_api_key_in_files(rits_api_key, [config.aggregated_results_path, config.examples_results_path])

if __name__ == "__main__":
    main()