from pathlib import Path
from pprint import pprint

from datasets import load_from_disk
from pytest import CaptureFixture

from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.fever_thread import FEVERTrialThread
from pdl.optimize.gsm8k_thread import Gsm8kTrialThread
from pdl.optimize.mbpp_dataset import MBPPDataset
from pdl.optimize.mbpp_thread import MBPPTrialThread
from pdl.optimize.pdl_optimizer import PDLOptimizer
from pdl.pdl_parser import PDLParseError, parse_file


def run_optimizer_gsm8k(pattern, num_demonstrations=0):
    config = OptimizationConfig(
        benchmark="gsm8k",
        initial_test_set_size=1,
        max_test_set_size=1,
        num_candidates=1,
        num_demonstrations=num_demonstrations,
        parallelism=1,
        shuffle_test=False,
        test_set_name="test",
        train_set_name="train",
        timeout=120,
        experiment_prefix=f"granite_3_8b_instruct_gsm8k_{num_demonstrations}_shot_",
        variables={
            "model": ["watsonx_text/ibm/granite-3-8b-instruct"],
            "prompt_pattern": [pattern],
            "system_prompt": ["llama3"],
        },
    )

    optim = PDLOptimizer(
        pdl_path=Path("contrib/prompt_library/examples/gsm8k/general.pdl"),
        dataset=load_from_disk(
            "../prompt-declaration-language-merge/var/gsm8k_proc_json",
        ),
        trial_thread=Gsm8kTrialThread,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()
    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    assert exception_str == "None", exception_str
    pprint(result)


def run_optimizer_fever(pattern, num_demonstrations=0):
    config = OptimizationConfig(
        benchmark="fever",
        initial_test_set_size=1,
        max_test_set_size=1,
        num_candidates=1,
        num_demonstrations=num_demonstrations,
        parallelism=1,
        shuffle_test=False,
        test_set_name="test",
        train_set_name="train",
        timeout=120,
        experiment_prefix=f"granite_3_8b_instruct_fever_{num_demonstrations}_shot_",
        variables={
            "model": ["watsonx_text/ibm/granite-3-8b-instruct"],
            "prompt_pattern": [pattern],
            "system_prompt": ["llama3"],
        },
    )

    fever = load_from_disk(
        "../prompt-declaration-language-merge/var/fever_augmented_nowikipages_json_val",
    )
    fever["train"] = fever["train"].filter(lambda x: x["wiki_worked"])

    optim = PDLOptimizer(
        pdl_path=Path("contrib/prompt_library/examples/fever/general.pdl"),
        dataset=fever,
        trial_thread=FEVERTrialThread,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()
    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    assert exception_str == "None", exception_str
    pprint(result)


def run_optimizer_mbpp(pattern, num_demonstrations=0):
    config = OptimizationConfig(
        benchmark="evalplus",
        initial_test_set_size=1,
        max_test_set_size=1,
        num_candidates=1,
        num_demonstrations=num_demonstrations,
        parallelism=1,
        shuffle_test=False,
        test_set_name="test",
        train_set_name="train",
        timeout=120,
        experiment_prefix=f"granite_3_8b_instruct_fever_{num_demonstrations}_shot_",
        variables={
            "model": ["watsonx_text/ibm/granite-3-8b-instruct"],
            "prompt_pattern": [pattern],
            "system_prompt": ["llama3"],
        },
    )

    mbpp_dataset = MBPPDataset()

    optim = PDLOptimizer(
        pdl_path=Path("contrib/prompt_library/examples/evalplus/general.pdl"),
        dataset=mbpp_dataset,
        trial_thread=MBPPTrialThread,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()
    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    assert exception_str == "None", exception_str
    pprint(result)


# TODO:
# create a fever generating script
# create an mbpp generating script
# make mbpp train set larger


def test_gsm8k_zeroshot_cot():
    run_optimizer_gsm8k("cot")


def test_gsm8k_zeroshot_react():
    run_optimizer_gsm8k("react")


def test_gsm8k_zeroshot_rewoo():
    run_optimizer_gsm8k("rewoo")


def test_fever_zeroshot_cot():
    run_optimizer_fever("cot")


def test_fever_zeroshot_react():
    run_optimizer_fever("react")


def test_fever_zeroshot_rewoo():
    run_optimizer_fever("rewoo")


def test_mbpp_zeroshot_cot():
    run_optimizer_mbpp("cot")


def test_mbpp_zeroshot_react():
    run_optimizer_mbpp("react")


def test_valid_experiment_programs(capsys: CaptureFixture[str]) -> None:
    actual_invalid: set[str] = set()
    with_warnings: set[str] = set()
    prompt_library = Path("contrib/prompt_library")
    programs = [
        "CoT.pdl",
        "ReAct.pdl",
        "ReWoo.pdl",
        "tools.pdl",
        "examples/evalplus/general.pdl",
        "examples/fever/general.pdl",
        "examples/gsm8k/general.pdl",
    ]
    programs = [prompt_library / p for p in programs]
    for yaml_file_name in programs:
        try:
            _ = parse_file(yaml_file_name)
            captured = capsys.readouterr()
            if len(captured.err) > 0:
                with_warnings |= {str(yaml_file_name)}
        except PDLParseError:
            actual_invalid |= {str(yaml_file_name)}

    assert len(actual_invalid) == 0, actual_invalid
    assert len(with_warnings) == 0, with_warnings
