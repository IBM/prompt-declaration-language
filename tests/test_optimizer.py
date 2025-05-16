from pathlib import Path
from pprint import pprint

import pytest
from datasets import Dataset, DatasetDict

from examples.optimizer.fever_evaluator import FEVEREvaluator
from examples.optimizer.gsm8k_evaluator import Gsm8kEvaluator
from examples.optimizer.mbpp_dataset import MBPPDataset
from examples.optimizer.mbpp_evaluator import MBPPEvaluator
from pdl.optimize.config_parser import OptimizationConfig
from pdl.optimize.pdl_optimizer import PDLOptimizer


def test_gsm8k_cot():
    pattern = "cot"
    num_demonstrations = 3
    config = OptimizationConfig(
        benchmark="gsm8k",
        initial_test_set_size=1,
        max_test_set_size=1,
        num_candidates=5,
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
            "num_demonstrations": [num_demonstrations],
        },
    )
    gsm8k = {
        "train": [
            {
                "question": "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                "answer": 5,
                "reasoning": "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years = <<22-2=20>>20 years old.\nKhloe is 10 years younger than Rupert so she is 20 years old – 10 years = 10 years old.\nEugene is 3 times older than Khloe so he is 10 years old * 3 = <<10*3=30>>30 years old.\nYorick is twice Eugene's age so he is 30 years old * 2 = <<30*2=60>>60 years old.\nAmilia is a quarter of Yorick's age so she is 60 years old / 4 = <<60/4=15>>15 years old.\nTricia is a third of Amilia's age so she is 15 years old / 3 = <<15/3=5>>5 years old.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                    "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years years old. I need to calculate 22-2",
                    '{"name": "Calculator", "arguments": {"expr": "22-2"}}',
                    "20",
                    "Khloe is 10 years younger than Rupert so she is 20 years old – 10 years = 10 years old.",
                    "Eugene is 3 times older than Khloe so he is 10 years old * 3 years old. I need to calculate 10*3",
                    '{"name": "Calculator", "arguments": {"expr": "10*3"}}',
                    "30",
                    "Yorick is twice Eugene's age so he is 30 years old * 2 years old. I need to calculate 30*2",
                    '{"name": "Calculator", "arguments": {"expr": "30*2"}}',
                    "60",
                    "Amilia is a quarter of Yorick's age so she is 60 years old / 4 years old. I need to calculate 60/4",
                    '{"name": "Calculator", "arguments": {"expr": "60/4"}}',
                    "15",
                    "Tricia is a third of Amilia's age so she is 15 years old / 3 years old. I need to calculate 15/3",
                    '{"name": "Calculator", "arguments": {"expr": "15/3"}}',
                    "5",
                    "The answer is 5",
                    '{"name": "Finish", "arguments": {"answer": "5"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                    "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years years old. Calculate 22-2",
                    '{"name": "Calculator", "arguments": {"expr": "22-2"}}',
                    "20",
                    "Khloe is 10 years younger than Rupert so she is #E1 years old – 10 years = 10 years old.",
                    "Eugene is 3 times older than Khloe so he is 10 years old * 3 years old. Calculate 10*3",
                    '{"name": "Calculator", "arguments": {"expr": "10*3"}}',
                    "30",
                    "Yorick is twice Eugene's age so he is #E2 years old * 2 years old. Calculate #E2*2",
                    '{"name": "Calculator", "arguments": {"expr": "#E2*2"}}',
                    "60",
                    "Amilia is a quarter of Yorick's age so she is #E3 years old / 4 years old. Calculate #E3/4",
                    '{"name": "Calculator", "arguments": {"expr": "#E3/4"}}',
                    "15",
                    "Tricia is a third of Amilia's age so she is #E4 years old / 3 years old. Calculate #E4/3",
                    '{"name": "Calculator", "arguments": {"expr": "#E4/3"}}',
                    "5",
                ],
            },
            {
                "question": "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                "answer": 5000,
                "reasoning": "The total length for the fifty fences is 50*500 = <<50*500=25000>>25000 meters.\nIf Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*25000 =$5000",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                    "The total length for the fifty fences is 50*500 meters. I need to calculate 50*500",
                    '{"name": "Calculator", "arguments": {"expr": "50*500"}}',
                    "25000",
                    "If Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*25000 =$5000",
                    '{"name": "Finish", "arguments": {"answer": "5000"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                ],
                "rewoo_traj_values": [
                    "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                    "The total length for the fifty fences is 50*500 meters. Calculate 50*500",
                    '{"name": "Calculator", "arguments": {"expr": "50*500"}}',
                    "25000",
                    "If Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*#E1 =$5000",
                ],
            },
            {
                "question": "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                "answer": 7,
                "reasoning": "Cody needs to read 54 books - 6 books - 3 books = <<54-6-3=45>>45 books.\nCody read 9 books each week after = 45 books / 9 books per week = <<45/9=5>>5 weeks.\nCody read for 1 week + 1 week + 5 weeks = <<1+1+5=7>>7 weeks total.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                    "Cody needs to read 54 books - 6 books - 3 books books. I need to calculate 54-6-3",
                    '{"name": "Calculator", "arguments": {"expr": "54-6-3"}}',
                    "45",
                    "Cody read 9 books each week after = 45 books / 9 books per week weeks. I need to calculate 45/9",
                    '{"name": "Calculator", "arguments": {"expr": "45/9"}}',
                    "5",
                    "Cody read for 1 week + 1 week + 5 weeks weeks total. I need to calculate 1+1+5",
                    '{"name": "Calculator", "arguments": {"expr": "1+1+5"}}',
                    "7",
                    "The answer is 7",
                    '{"name": "Finish", "arguments": {"answer": "7"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                    "Cody needs to read 54 books - 6 books - 3 books books. Calculate 54-6-3",
                    '{"name": "Calculator", "arguments": {"expr": "54-6-3"}}',
                    "45",
                    "Cody read 9 books each week after = #E1 books / 9 books per week weeks. Calculate #E1/9",
                    '{"name": "Calculator", "arguments": {"expr": "#E1/9"}}',
                    "5",
                    "Cody read for 1 week + 1 week + #E2 weeks weeks total. Calculate 1+1+#E2",
                    '{"name": "Calculator", "arguments": {"expr": "1+1+#E2"}}',
                    "7",
                ],
            },
            {
                "question": "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                "answer": 28,
                "reasoning": "In each round, the 5 players removed a total of 5 * 1 = <<5*1=5>>5 blocks.\nIn the 5 rounds played, the players removed a total of 5 * 5 = <<5*5=25>>25 blocks.\nAdding the block removed by Jess's father in the sixth round, a total of 25 + 1 = <<25+1=26>>26 blocks were removed.\nBefore the tower fell, there were 54 - 26 = <<54-26=28>>28 blocks.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                    "In each round, the 5 players removed a total of 5 * 1 blocks. I need to calculate 5*1",
                    '{"name": "Calculator", "arguments": {"expr": "5*1"}}',
                    "5",
                    "In the 5 rounds played, the players removed a total of 5 * 5 blocks. I need to calculate 5*5",
                    '{"name": "Calculator", "arguments": {"expr": "5*5"}}',
                    "25",
                    "Adding the block removed by Jess's father in the sixth round, a total of 25 + 1 blocks were removed. I need to calculate 25+1",
                    '{"name": "Calculator", "arguments": {"expr": "25+1"}}',
                    "26",
                    "Before the tower fell, there were 54 - 26 blocks. I need to calculate 54-26",
                    '{"name": "Calculator", "arguments": {"expr": "54-26"}}',
                    "28",
                    "The answer is 28",
                    '{"name": "Finish", "arguments": {"answer": "28"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                    "In each round, the 5 players removed a total of 5 * 1 blocks. Calculate 5*1",
                    '{"name": "Calculator", "arguments": {"expr": "5*1"}}',
                    "5",
                    "In the #E1 rounds played, the players removed a total of #E1 * #E1 blocks. Calculate #E1*#E1",
                    '{"name": "Calculator", "arguments": {"expr": "#E1*#E1"}}',
                    "25",
                    "Adding the block removed by Jess's father in the sixth round, a total of 2#E1 + 1 blocks were removed. Calculate 2#E1+1",
                    '{"name": "Calculator", "arguments": {"expr": "2#E1+1"}}',
                    "26",
                    "Before the tower fell, there were #E14 - #E3 blocks. Calculate #E14-#E3",
                    '{"name": "Calculator", "arguments": {"expr": "#E14-#E3"}}',
                    "28",
                ],
            },
            {
                "question": "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                "answer": 9,
                "reasoning": "Amalia can read 1 page in 2/4 = 0.5 minutes.\nHence, she can read 18 pages in 18 x 0.5 minutes = <<18*0.5=9>>9 minutes.",
                "traj_keys": [
                    "question",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                    "Amalia can read 1 page in 2/4 = 0.5 minutes.",
                    "Hence, she can read 18 pages in 18 x 0.5 minutes minutes. I need to calculate 18*0.5",
                    '{"name": "Calculator", "arguments": {"expr": "18*0.5"}}',
                    "9",
                    "The answer is 9",
                    '{"name": "Finish", "arguments": {"answer": "9"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                    "Amalia can read 1 page in 2/4 = 0.5 minutes.",
                    "Hence, she can read 18 pages in 18 x 0.5 minutes minutes. Calculate 18*0.5",
                    '{"name": "Calculator", "arguments": {"expr": "18*0.5"}}',
                    "9",
                ],
            },
        ],
        "test": [
            {
                "question": "The sky currently has 4 times as many cirrus clouds as cumulus clouds, and 12 times as many cumulus clouds as cumulonimbus clouds. If the sky currently has 3 cumulonimbus clouds, how many cirrus clouds are in the sky at this moment?",
                "answer": 144,
                "reasoning": "The sky has 3*12=<<3*12=36>>36 cumulus clouds.\nThe sky has 4*36=<<4*36=144>>144 cirrus clouds.",
            },
            # {
            #     "question": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
            #     "answer": 18,
            #     "reasoning": "Janet sells 16 - 3 - 4 = <<16-3-4=9>>9 duck eggs a day.\nShe makes 9 * 2 = $<<9*2=18>>18 every day at the farmer's market.",
            # },
        ],
        "validation": [
            {
                "question": "The sky currently has 4 times as many cirrus clouds as cumulus clouds, and 12 times as many cumulus clouds as cumulonimbus clouds. If the sky currently has 3 cumulonimbus clouds, how many cirrus clouds are in the sky at this moment?",
                "answer": 144,
                "reasoning": "The sky has 3*12=<<3*12=36>>36 cumulus clouds.\nThe sky has 4*36=<<4*36=144>>144 cirrus clouds.",
            },
        ],
    }

    gsm8k = DatasetDict(
        {
            "train": Dataset.from_list(gsm8k["train"]),
            "validation": Dataset.from_list(gsm8k["validation"]),
            "test": Dataset.from_list(gsm8k["test"]),
        },
    )
    optim = PDLOptimizer(
        pdl_path=Path("tests/data/optimizer_gsm8k.pdl"),
        dataset=gsm8k,
        trial_thread=Gsm8kEvaluator,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()

    assert len(result["iterations"]) == 2
    assert len(result["iterations"][0]["candidates"]) == 5

    for iteration in result["iterations"]:
        for candidate in iteration["candidates"]:
            assert candidate["metric"] == 1.0
            for c_result in candidate["results"]:
                assert c_result["exception"] == "None"

    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    assert exception_str == "None", exception_str
    pprint(result)


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
            "num_demonstrations": [num_demonstrations],
        },
    )
    gsm8k = {
        "train": [
            {
                "question": "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                "answer": 5,
                "reasoning": "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years = <<22-2=20>>20 years old.\nKhloe is 10 years younger than Rupert so she is 20 years old – 10 years = 10 years old.\nEugene is 3 times older than Khloe so he is 10 years old * 3 = <<10*3=30>>30 years old.\nYorick is twice Eugene's age so he is 30 years old * 2 = <<30*2=60>>60 years old.\nAmilia is a quarter of Yorick's age so she is 60 years old / 4 = <<60/4=15>>15 years old.\nTricia is a third of Amilia's age so she is 15 years old / 3 = <<15/3=5>>5 years old.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                    "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years years old. I need to calculate 22-2",
                    '{"name": "Calculator", "arguments": {"expr": "22-2"}}',
                    "20",
                    "Khloe is 10 years younger than Rupert so she is 20 years old – 10 years = 10 years old.",
                    "Eugene is 3 times older than Khloe so he is 10 years old * 3 years old. I need to calculate 10*3",
                    '{"name": "Calculator", "arguments": {"expr": "10*3"}}',
                    "30",
                    "Yorick is twice Eugene's age so he is 30 years old * 2 years old. I need to calculate 30*2",
                    '{"name": "Calculator", "arguments": {"expr": "30*2"}}',
                    "60",
                    "Amilia is a quarter of Yorick's age so she is 60 years old / 4 years old. I need to calculate 60/4",
                    '{"name": "Calculator", "arguments": {"expr": "60/4"}}',
                    "15",
                    "Tricia is a third of Amilia's age so she is 15 years old / 3 years old. I need to calculate 15/3",
                    '{"name": "Calculator", "arguments": {"expr": "15/3"}}',
                    "5",
                    "The answer is 5",
                    '{"name": "Finish", "arguments": {"answer": "5"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Tricia is a third of Amilia's age and Amilia is a quarter of Yorick's age. Yorick is twice Eugene's age and Khloe is a third of Eugene's age. Rupert is 10 years older than Khloe but 2 years younger than Vincent who is 22 years old. How old, in years, is Tricia?",
                    "Rupert is younger than Vincent by 2 years, so he is 22 years old – 2 years years old. Calculate 22-2",
                    '{"name": "Calculator", "arguments": {"expr": "22-2"}}',
                    "20",
                    "Khloe is 10 years younger than Rupert so she is #E1 years old – 10 years = 10 years old.",
                    "Eugene is 3 times older than Khloe so he is 10 years old * 3 years old. Calculate 10*3",
                    '{"name": "Calculator", "arguments": {"expr": "10*3"}}',
                    "30",
                    "Yorick is twice Eugene's age so he is #E2 years old * 2 years old. Calculate #E2*2",
                    '{"name": "Calculator", "arguments": {"expr": "#E2*2"}}',
                    "60",
                    "Amilia is a quarter of Yorick's age so she is #E3 years old / 4 years old. Calculate #E3/4",
                    '{"name": "Calculator", "arguments": {"expr": "#E3/4"}}',
                    "15",
                    "Tricia is a third of Amilia's age so she is #E4 years old / 3 years old. Calculate #E4/3",
                    '{"name": "Calculator", "arguments": {"expr": "#E4/3"}}',
                    "5",
                ],
            },
            {
                "question": "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                "answer": 5000,
                "reasoning": "The total length for the fifty fences is 50*500 = <<50*500=25000>>25000 meters.\nIf Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*25000 =$5000",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                    "The total length for the fifty fences is 50*500 meters. I need to calculate 50*500",
                    '{"name": "Calculator", "arguments": {"expr": "50*500"}}',
                    "25000",
                    "If Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*25000 =$5000",
                    '{"name": "Finish", "arguments": {"answer": "5000"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                ],
                "rewoo_traj_values": [
                    "Emmalyn decided to paint fences in her neighborhood for twenty cents per meter. If there were 50 fences in the neighborhood that she had to paint and each fence was 500 meters long, calculate the total amount she earned from painting the fences.",
                    "The total length for the fifty fences is 50*500 meters. Calculate 50*500",
                    '{"name": "Calculator", "arguments": {"expr": "50*500"}}',
                    "25000",
                    "If Emmalyn charged twenty cents to paint a meter of a fence, the total income she got from painting the fences is $0.20*#E1 =$5000",
                ],
            },
            {
                "question": "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                "answer": 7,
                "reasoning": "Cody needs to read 54 books - 6 books - 3 books = <<54-6-3=45>>45 books.\nCody read 9 books each week after = 45 books / 9 books per week = <<45/9=5>>5 weeks.\nCody read for 1 week + 1 week + 5 weeks = <<1+1+5=7>>7 weeks total.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                    "Cody needs to read 54 books - 6 books - 3 books books. I need to calculate 54-6-3",
                    '{"name": "Calculator", "arguments": {"expr": "54-6-3"}}',
                    "45",
                    "Cody read 9 books each week after = 45 books / 9 books per week weeks. I need to calculate 45/9",
                    '{"name": "Calculator", "arguments": {"expr": "45/9"}}',
                    "5",
                    "Cody read for 1 week + 1 week + 5 weeks weeks total. I need to calculate 1+1+5",
                    '{"name": "Calculator", "arguments": {"expr": "1+1+5"}}',
                    "7",
                    "The answer is 7",
                    '{"name": "Finish", "arguments": {"answer": "7"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Cody was reading through his favorite book series. The series was 54 books in total. If Cody read 6 books the first week, and 3 books the second week and then 9 books every week after that. How many weeks did it take Cody to read his series?",
                    "Cody needs to read 54 books - 6 books - 3 books books. Calculate 54-6-3",
                    '{"name": "Calculator", "arguments": {"expr": "54-6-3"}}',
                    "45",
                    "Cody read 9 books each week after = #E1 books / 9 books per week weeks. Calculate #E1/9",
                    '{"name": "Calculator", "arguments": {"expr": "#E1/9"}}',
                    "5",
                    "Cody read for 1 week + 1 week + #E2 weeks weeks total. Calculate 1+1+#E2",
                    '{"name": "Calculator", "arguments": {"expr": "1+1+#E2"}}',
                    "7",
                ],
            },
            {
                "question": "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                "answer": 28,
                "reasoning": "In each round, the 5 players removed a total of 5 * 1 = <<5*1=5>>5 blocks.\nIn the 5 rounds played, the players removed a total of 5 * 5 = <<5*5=25>>25 blocks.\nAdding the block removed by Jess's father in the sixth round, a total of 25 + 1 = <<25+1=26>>26 blocks were removed.\nBefore the tower fell, there were 54 - 26 = <<54-26=28>>28 blocks.",
                "traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                    "In each round, the 5 players removed a total of 5 * 1 blocks. I need to calculate 5*1",
                    '{"name": "Calculator", "arguments": {"expr": "5*1"}}',
                    "5",
                    "In the 5 rounds played, the players removed a total of 5 * 5 blocks. I need to calculate 5*5",
                    '{"name": "Calculator", "arguments": {"expr": "5*5"}}',
                    "25",
                    "Adding the block removed by Jess's father in the sixth round, a total of 25 + 1 blocks were removed. I need to calculate 25+1",
                    '{"name": "Calculator", "arguments": {"expr": "25+1"}}',
                    "26",
                    "Before the tower fell, there were 54 - 26 blocks. I need to calculate 54-26",
                    '{"name": "Calculator", "arguments": {"expr": "54-26"}}',
                    "28",
                    "The answer is 28",
                    '{"name": "Finish", "arguments": {"answer": "28"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Jess and her family play Jenga, a game made up of 54 stacked blocks in which each player removes one block in turns until the stack falls. The 5 players, including Jess, play 5 rounds in which each player removes one block. In the sixth round, Jess's father goes first. He removes a block, causing the tower to almost fall. Next, Jess tries to remove another block knocking down the tower. How many blocks did the tower have before Jess's turn?",
                    "In each round, the 5 players removed a total of 5 * 1 blocks. Calculate 5*1",
                    '{"name": "Calculator", "arguments": {"expr": "5*1"}}',
                    "5",
                    "In the #E1 rounds played, the players removed a total of #E1 * #E1 blocks. Calculate #E1*#E1",
                    '{"name": "Calculator", "arguments": {"expr": "#E1*#E1"}}',
                    "25",
                    "Adding the block removed by Jess's father in the sixth round, a total of 2#E1 + 1 blocks were removed. Calculate 2#E1+1",
                    '{"name": "Calculator", "arguments": {"expr": "2#E1+1"}}',
                    "26",
                    "Before the tower fell, there were #E14 - #E3 blocks. Calculate #E14-#E3",
                    '{"name": "Calculator", "arguments": {"expr": "#E14-#E3"}}',
                    "28",
                ],
            },
            {
                "question": "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                "answer": 9,
                "reasoning": "Amalia can read 1 page in 2/4 = 0.5 minutes.\nHence, she can read 18 pages in 18 x 0.5 minutes = <<18*0.5=9>>9 minutes.",
                "traj_keys": [
                    "question",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                    "Amalia can read 1 page in 2/4 = 0.5 minutes.",
                    "Hence, she can read 18 pages in 18 x 0.5 minutes minutes. I need to calculate 18*0.5",
                    '{"name": "Calculator", "arguments": {"expr": "18*0.5"}}',
                    "9",
                    "The answer is 9",
                    '{"name": "Finish", "arguments": {"answer": "9"}}',
                ],
                "rewoo_traj_keys": [
                    "question",
                    "thought",
                    "thought",
                    "action",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "Amalia can read 4 pages of her book in 2 minutes. How many minutes will it take her to read 18 pages of her book?",
                    "Amalia can read 1 page in 2/4 = 0.5 minutes.",
                    "Hence, she can read 18 pages in 18 x 0.5 minutes minutes. Calculate 18*0.5",
                    '{"name": "Calculator", "arguments": {"expr": "18*0.5"}}',
                    "9",
                ],
            },
        ],
        "test": [
            {
                "question": "The sky currently has 4 times as many cirrus clouds as cumulus clouds, and 12 times as many cumulus clouds as cumulonimbus clouds. If the sky currently has 3 cumulonimbus clouds, how many cirrus clouds are in the sky at this moment?",
                "answer": 144,
                "reasoning": "The sky has 3*12=<<3*12=36>>36 cumulus clouds.\nThe sky has 4*36=<<4*36=144>>144 cirrus clouds.",
            },
            # {
            #     "question": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
            #     "answer": 18,
            #     "reasoning": "Janet sells 16 - 3 - 4 = <<16-3-4=9>>9 duck eggs a day.\nShe makes 9 * 2 = $<<9*2=18>>18 every day at the farmer's market.",
            # },
        ],
        "validation": [
            {
                "question": "The sky currently has 4 times as many cirrus clouds as cumulus clouds, and 12 times as many cumulus clouds as cumulonimbus clouds. If the sky currently has 3 cumulonimbus clouds, how many cirrus clouds are in the sky at this moment?",
                "answer": 144,
                "reasoning": "The sky has 3*12=<<3*12=36>>36 cumulus clouds.\nThe sky has 4*36=<<4*36=144>>144 cirrus clouds.",
            },
        ],
    }

    gsm8k = DatasetDict(
        {
            "train": Dataset.from_list(gsm8k["train"]),
            "validation": Dataset.from_list(gsm8k["validation"]),
            "test": Dataset.from_list(gsm8k["test"]),
        },
    )
    optim = PDLOptimizer(
        pdl_path=Path("examples/optimizer/gsm8k.pdl"),
        dataset=gsm8k,
        trial_thread=Gsm8kEvaluator,
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
            "num_demonstrations": [num_demonstrations],
        },
    )
    fever = {
        "train": [
            {
                "label": True,
                "claim": "Kendall Jenner was on TV.",
                "unique_evidence": [["Kendall_Jenner", "0"]],
                "evidence_sentences": [
                    [
                        "Kendall_Jenner",
                        "0",
                        "Kendall Nicole Jenner -LRB- born November 3 , 1995 -RRB- is an American fashion model and television personality .\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "43444",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: Kendall Jenner was on TV.\nQ: Was this claim true or false?",
                    "I need to search Kendall Jenner.",
                    '{"name": "Search", "arguments": {"topic": "Kendall Jenner"}}',
                    "[Document]\nKendall Nicole Jenner (born November 3, 1995) is an American model, media personality, and socialite. She rose to fame in the reality television show Keeping Up with the Kardashians, in which she starred for 20 seasons and nearly 15 years from 2007 to 2021. The success of the show led to the creation of multiple spin-off series including Kourtney and Khloe Take Miami (2009), Kourtney and Kim Take New York (2011), Khloé & Lamar (2011), Rob & Chyna (2016) and Life of Kylie (2017).  Following the decision to end their reality show, in 2022 she and her family starred in the reality television series The Kardashians on Hulu.\nJenner began modeling at the age of 14. After working in commercial print ad campaigns and photoshoots, she had breakout seasons in 2014 and 2015, walking the runways for high-fashion designers during the New York, Milan, and Paris fashion weeks. Jenner has appeared in campaigns, editorials, and cover shoots for LOVE and various international Vogue editions, and is a brand ambassador for Estée Lauder. Jenner made her debut at No. 16 on Forbes magazine's 2015 list of top-earning models, with an estimated annual income of US$4 million. In 2017, Jenner was named the world's highest-paid model by Forbes, ousting model Gisele Bündchen who had been leading the list since 2002. In 2021, she launched the tequila brand 818 Tequila.\n[End]",
                    "Kendall Nicole Jenner (born November 3 , 1995) is an American fashion model and television personality .",
                    "The claim is true.",
                    '{"name": "Finish", "arguments": {"answer": "true"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: Kendall Jenner was on TV.\nQ: Was this claim true or false?",
                    "Search for more information about Kendall Jenner.",
                    '{"name": "Search", "arguments": {"topic": "Kendall Jenner"}}',
                    "[Document]\nKendall Nicole Jenner (born November 3, 1995) is an American model, media personality, and socialite. She rose to fame in the reality television show Keeping Up with the Kardashians, in which she starred for 20 seasons and nearly 15 years from 2007 to 2021. The success of the show led to the creation of multiple spin-off series including Kourtney and Khloe Take Miami (2009), Kourtney and Kim Take New York (2011), Khloé & Lamar (2011), Rob & Chyna (2016) and Life of Kylie (2017).  Following the decision to end their reality show, in 2022 she and her family starred in the reality television series The Kardashians on Hulu.\nJenner began modeling at the age of 14. After working in commercial print ad campaigns and photoshoots, she had breakout seasons in 2014 and 2015, walking the runways for high-fashion designers during the New York, Milan, and Paris fashion weeks. Jenner has appeared in campaigns, editorials, and cover shoots for LOVE and various international Vogue editions, and is a brand ambassador for Estée Lauder. Jenner made her debut at No. 16 on Forbes magazine's 2015 list of top-earning models, with an estimated annual income of US$4 million. In 2017, Jenner was named the world's highest-paid model by Forbes, ousting model Gisele Bündchen who had been leading the list since 2002. In 2021, she launched the tequila brand 818 Tequila.\n[End]",
                    "Kendall Nicole Jenner (born November 3 , 1995) is an American fashion model and television personality .",
                ],
                "articles": [
                    "Kendall Nicole Jenner (born November 3, 1995) is an American model, media personality, and socialite. She rose to fame in the reality television show Keeping Up with the Kardashians, in which she starred for 20 seasons and nearly 15 years from 2007 to 2021. The success of the show led to the creation of multiple spin-off series including Kourtney and Khloe Take Miami (2009), Kourtney and Kim Take New York (2011), Khloé & Lamar (2011), Rob & Chyna (2016) and Life of Kylie (2017).  Following the decision to end their reality show, in 2022 she and her family starred in the reality television series The Kardashians on Hulu.\nJenner began modeling at the age of 14. After working in commercial print ad campaigns and photoshoots, she had breakout seasons in 2014 and 2015, walking the runways for high-fashion designers during the New York, Milan, and Paris fashion weeks. Jenner has appeared in campaigns, editorials, and cover shoots for LOVE and various international Vogue editions, and is a brand ambassador for Estée Lauder. Jenner made her debut at No. 16 on Forbes magazine's 2015 list of top-earning models, with an estimated annual income of US$4 million. In 2017, Jenner was named the world's highest-paid model by Forbes, ousting model Gisele Bündchen who had been leading the list since 2002. In 2021, she launched the tequila brand 818 Tequila.",
                ],
                "cot": "Kendall Nicole Jenner (born November 3 , 1995) is an American fashion model and television personality .",
            },
            {
                "label": False,
                "claim": "Tottenham Hotspur F.C. is a video game developer.",
                "unique_evidence": [["Tottenham_Hotspur_F.C.", "0"]],
                "evidence_sentences": [
                    [
                        "Tottenham_Hotspur_F.C.",
                        "0",
                        "Tottenham Hotspur Football Club -LSB- ˈtɒtnəm , _ - tənəm -RSB- , commonly referred to as Spurs , is an English football club located in Tottenham , Haringey , London , that competes in the Premier League .\tfootball\tassociation football\tTottenham\tTottenham\tHaringey\tLondon Borough of Haringey\tLondon\tLondon\tPremier League\tPremier League\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "61821",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: Tottenham Hotspur F.C. is a video game developer.\nQ: Was this claim true or false?",
                    "I need to search Tottenham Hotspur F.C..",
                    '{"name": "Search", "arguments": {"topic": "Tottenham Hotspur F.C."}}',
                    "[Document]\nTottenham Hotspur Football Club, commonly referred to as simply Tottenham (, TOT-ən-əm, , tot-nəm) or Spurs, is a professional football club based in Tottenham, North London, England. It competes in the Premier League, the top tier of English football. The team has played its home matches in the Tottenham Hotspur Stadium since 2019, replacing their former home of White Hart Lane, which had been demolished to make way for the new stadium on the same site.\nFounded in 1882, Tottenham Hotspur's emblem is a cockerel standing upon a football, with the Latin motto Audere est Facere (\"to dare is to do\"). The club has traditionally worn white shirts and navy blue shorts as their home kit since the 1898–99 season. Their training ground is on Hotspur Way in Bulls Cross, Enfield. After its inception, Tottenham won the FA Cup for the first time in 1901, the only non-League club to do so since the formation of the Football League in 1888. Tottenham were the first club in the 20th century to achieve the League and FA Cup Double, winning both competitions in the 1960–61 season. After successfully defending the FA Cup in 1962, in 1963 they became the first British club to win a UEFA club competition – the European Cup Winners' Cup. They were also the inaugural winners of the UEFA Cup in 1972, becoming the first British club to win two different major European trophies. They collected at least one major trophy in each of the six decades from the 1950s to 2000s, an achievement only matched by Manchester United.\nIn domestic football, Spurs have won two league titles, eight FA Cups, four League Cups, and seven FA Community Shields. In European football, they have won one European Cup Winners' Cup and two UEFA Cups. Tottenham were also runners-up in the 2018–19 UEFA Champions League. They have a long-standing rivalry with nearby club Arsenal, with whom they contest the North London derby. Tottenham is owned by ENIC Group, which purchased the club in 2001. The club was estimated to be worth £2.6 billion ($3.2 billion) in 2024, and it was the eighth-highest-earning football club in the world, with an annual revenue of £549.2 million in 2023.\n[End]",
                    "Tottenham Hotspur Football Club [ˈtɒtnəm ,   - tənəm] , commonly referred to as Spurs , is an English football club located in Tottenham , Haringey , London , that competes in the Premier League .",
                    "The claim is false.",
                    '{"name": "Finish", "arguments": {"answer": "false"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: Tottenham Hotspur F.C. is a video game developer.\nQ: Was this claim true or false?",
                    "Search for more information about Tottenham Hotspur F.C..",
                    '{"name": "Search", "arguments": {"topic": "Tottenham Hotspur F.C."}}',
                    "[Document]\nTottenham Hotspur Football Club, commonly referred to as simply Tottenham (, TOT-ən-əm, , tot-nəm) or Spurs, is a professional football club based in Tottenham, North London, England. It competes in the Premier League, the top tier of English football. The team has played its home matches in the Tottenham Hotspur Stadium since 2019, replacing their former home of White Hart Lane, which had been demolished to make way for the new stadium on the same site.\nFounded in 1882, Tottenham Hotspur's emblem is a cockerel standing upon a football, with the Latin motto Audere est Facere (\"to dare is to do\"). The club has traditionally worn white shirts and navy blue shorts as their home kit since the 1898–99 season. Their training ground is on Hotspur Way in Bulls Cross, Enfield. After its inception, Tottenham won the FA Cup for the first time in 1901, the only non-League club to do so since the formation of the Football League in 1888. Tottenham were the first club in the 20th century to achieve the League and FA Cup Double, winning both competitions in the 1960–61 season. After successfully defending the FA Cup in 1962, in 1963 they became the first British club to win a UEFA club competition – the European Cup Winners' Cup. They were also the inaugural winners of the UEFA Cup in 1972, becoming the first British club to win two different major European trophies. They collected at least one major trophy in each of the six decades from the 1950s to 2000s, an achievement only matched by Manchester United.\nIn domestic football, Spurs have won two league titles, eight FA Cups, four League Cups, and seven FA Community Shields. In European football, they have won one European Cup Winners' Cup and two UEFA Cups. Tottenham were also runners-up in the 2018–19 UEFA Champions League. They have a long-standing rivalry with nearby club Arsenal, with whom they contest the North London derby. Tottenham is owned by ENIC Group, which purchased the club in 2001. The club was estimated to be worth £2.6 billion ($3.2 billion) in 2024, and it was the eighth-highest-earning football club in the world, with an annual revenue of £549.2 million in 2023.\n[End]",
                    "Tottenham Hotspur Football Club [ˈtɒtnəm ,   - tənəm] , commonly referred to as Spurs , is an English football club located in Tottenham , Haringey , London , that competes in the Premier League .",
                ],
                "articles": [
                    "Tottenham Hotspur Football Club, commonly referred to as simply Tottenham (, TOT-ən-əm, , tot-nəm) or Spurs, is a professional football club based in Tottenham, North London, England. It competes in the Premier League, the top tier of English football. The team has played its home matches in the Tottenham Hotspur Stadium since 2019, replacing their former home of White Hart Lane, which had been demolished to make way for the new stadium on the same site.\nFounded in 1882, Tottenham Hotspur's emblem is a cockerel standing upon a football, with the Latin motto Audere est Facere (\"to dare is to do\"). The club has traditionally worn white shirts and navy blue shorts as their home kit since the 1898–99 season. Their training ground is on Hotspur Way in Bulls Cross, Enfield. After its inception, Tottenham won the FA Cup for the first time in 1901, the only non-League club to do so since the formation of the Football League in 1888. Tottenham were the first club in the 20th century to achieve the League and FA Cup Double, winning both competitions in the 1960–61 season. After successfully defending the FA Cup in 1962, in 1963 they became the first British club to win a UEFA club competition – the European Cup Winners' Cup. They were also the inaugural winners of the UEFA Cup in 1972, becoming the first British club to win two different major European trophies. They collected at least one major trophy in each of the six decades from the 1950s to 2000s, an achievement only matched by Manchester United.\nIn domestic football, Spurs have won two league titles, eight FA Cups, four League Cups, and seven FA Community Shields. In European football, they have won one European Cup Winners' Cup and two UEFA Cups. Tottenham were also runners-up in the 2018–19 UEFA Champions League. They have a long-standing rivalry with nearby club Arsenal, with whom they contest the North London derby. Tottenham is owned by ENIC Group, which purchased the club in 2001. The club was estimated to be worth £2.6 billion ($3.2 billion) in 2024, and it was the eighth-highest-earning football club in the world, with an annual revenue of £549.2 million in 2023.",
                ],
                "cot": "Tottenham Hotspur Football Club [ˈtɒtnəm ,   - tənəm] , commonly referred to as Spurs , is an English football club located in Tottenham , Haringey , London , that competes in the Premier League .",
            },
            {
                "label": True,
                "claim": "David Packouz does business-related things.",
                "unique_evidence": [["David_Packouz", "0"]],
                "evidence_sentences": [
                    [
                        "David_Packouz",
                        "0",
                        "David Mordechai Packouz -LRB- -LSB- pækhaʊs -RSB- born February 16 , 1982 -RRB- is an American former arms dealer , musician , inventor and entrepreneur .\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "68692",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: David Packouz does business-related things.\nQ: Was this claim true or false?",
                    "I need to search David Packouz.",
                    '{"name": "Search", "arguments": {"topic": "David Packouz"}}',
                    "[Document]\nDavid Mordechai Packouz ( born February 17, 1982) is an American arms dealer, musician and inventor. \nPackouz joined Efraim Diveroli on the 17th of September 2005, in Diveroli's arms company AEY Inc. By the end of 2006, the company had won 149 contracts worth around $10.5 million. In early 2007, AEY secured a nearly $300 million U.S. government contract to supply the Afghan Army with 100 million rounds of AK-47 ammunition, aviation rockets and other munitions. The ammunition that AEY had secured in Albania to fulfill the contract had originally come from China, violating the terms of AEY's contract with the US Army, which bans Chinese ammunition. Packouz  was aware that the products were prohibited and would not be accepted, and was instrumental in the covering up of the origins of the ammunition. \nAs a result of the publicity surrounding the contract and the age of the arms dealers – Packouz was 25 and Diveroli was 21 when AEY landed the ammunition deal – the United States Army began a review of its contracting procedures.\nPackouz was sentenced to seven months of house arrest for conspiracy to defraud the United States. He is the central subject of the 2016 Todd Phillips dramedy film War Dogs. Packouz himself has a cameo role in the film as a guitarist and singer at an elderly home.\nPackouz later co-founded War Dogs Academy, an online school that teaches how to start a government contracting business. \nPackouz went on to invent a guitar pedal drum machine, the BeatBuddy, and is currently the CEO of music technology company Singular Sound.\n[End]",
                    "David Mordechai Packouz ([pækhaʊs] born February 16 , 1982) is an American former arms dealer , musician , inventor and entrepreneur .",
                    "The claim is true.",
                    '{"name": "Finish", "arguments": {"answer": "true"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: David Packouz does business-related things.\nQ: Was this claim true or false?",
                    "Search for more information about David Packouz.",
                    '{"name": "Search", "arguments": {"topic": "David Packouz"}}',
                    "[Document]\nDavid Mordechai Packouz ( born February 17, 1982) is an American arms dealer, musician and inventor. \nPackouz joined Efraim Diveroli on the 17th of September 2005, in Diveroli's arms company AEY Inc. By the end of 2006, the company had won 149 contracts worth around $10.5 million. In early 2007, AEY secured a nearly $300 million U.S. government contract to supply the Afghan Army with 100 million rounds of AK-47 ammunition, aviation rockets and other munitions. The ammunition that AEY had secured in Albania to fulfill the contract had originally come from China, violating the terms of AEY's contract with the US Army, which bans Chinese ammunition. Packouz  was aware that the products were prohibited and would not be accepted, and was instrumental in the covering up of the origins of the ammunition. \nAs a result of the publicity surrounding the contract and the age of the arms dealers – Packouz was 25 and Diveroli was 21 when AEY landed the ammunition deal – the United States Army began a review of its contracting procedures.\nPackouz was sentenced to seven months of house arrest for conspiracy to defraud the United States. He is the central subject of the 2016 Todd Phillips dramedy film War Dogs. Packouz himself has a cameo role in the film as a guitarist and singer at an elderly home.\nPackouz later co-founded War Dogs Academy, an online school that teaches how to start a government contracting business. \nPackouz went on to invent a guitar pedal drum machine, the BeatBuddy, and is currently the CEO of music technology company Singular Sound.\n[End]",
                    "David Mordechai Packouz ([pækhaʊs] born February 16 , 1982) is an American former arms dealer , musician , inventor and entrepreneur .",
                ],
                "articles": [
                    "David Mordechai Packouz ( born February 17, 1982) is an American arms dealer, musician and inventor. \nPackouz joined Efraim Diveroli on the 17th of September 2005, in Diveroli's arms company AEY Inc. By the end of 2006, the company had won 149 contracts worth around $10.5 million. In early 2007, AEY secured a nearly $300 million U.S. government contract to supply the Afghan Army with 100 million rounds of AK-47 ammunition, aviation rockets and other munitions. The ammunition that AEY had secured in Albania to fulfill the contract had originally come from China, violating the terms of AEY's contract with the US Army, which bans Chinese ammunition. Packouz  was aware that the products were prohibited and would not be accepted, and was instrumental in the covering up of the origins of the ammunition. \nAs a result of the publicity surrounding the contract and the age of the arms dealers – Packouz was 25 and Diveroli was 21 when AEY landed the ammunition deal – the United States Army began a review of its contracting procedures.\nPackouz was sentenced to seven months of house arrest for conspiracy to defraud the United States. He is the central subject of the 2016 Todd Phillips dramedy film War Dogs. Packouz himself has a cameo role in the film as a guitarist and singer at an elderly home.\nPackouz later co-founded War Dogs Academy, an online school that teaches how to start a government contracting business. \nPackouz went on to invent a guitar pedal drum machine, the BeatBuddy, and is currently the CEO of music technology company Singular Sound.",
                ],
                "cot": "David Mordechai Packouz ([pækhaʊs] born February 16 , 1982) is an American former arms dealer , musician , inventor and entrepreneur .",
            },
            {
                "label": True,
                "claim": "Brad Wilk was a member of Greta in 1990.",
                "unique_evidence": [["Brad_Wilk", "4"]],
                "evidence_sentences": [
                    [
                        "Brad_Wilk",
                        "4",
                        "Wilk started his career as a drummer for Greta in 1990 , and helped co-found Rage with Tom Morello and Zack de la Rocha in August 1991 .\tGreta\tGreta (band)\tTom Morello\tTom Morello\tZack de la Rocha\tZack de la Rocha\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "204415",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: Brad Wilk was a member of Greta in 1990.\nQ: Was this claim true or false?",
                    "I need to search Brad Wilk.",
                    '{"name": "Search", "arguments": {"topic": "Brad Wilk"}}',
                    "[Document]\nBradley Joseph Wilk (born September 5, 1968) is an American drummer. He is best known as a member of the rock bands Rage Against the Machine (1991–2000, 2007–2011, 2019–2024), Audioslave (2001–2007, 2017), and Prophets of Rage (2016–2019).\nWilk started his career as a drummer for Greta in 1990, and helped co-found Rage Against the Machine with Tom Morello and Zack de la Rocha in August 1991. Following that band's breakup in October 2000, Wilk, Morello, Rage Against the Machine bassist Tim Commerford and Soundgarden frontman Chris Cornell formed the supergroup Audioslave, which broke up in 2007. From 2016 to 2019, he played in the band Prophets of Rage, with Commerford, Morello, Chuck D, B-Real and DJ Lord. He has played with Rage Against the Machine since their reunion.\nWilk has also performed drums on English metal band Black Sabbath's final album 13, released in June 2013. He briefly played with Pearl Jam shortly after the release of their debut album Ten and had previously been in the band Indian Style with Eddie Vedder.\n[End]",
                    "Wilk started his career as a drummer for Greta in 1990 , and helped co-found Rage with Tom Morello and Zack de la Rocha in August 1991 .",
                    "The claim is true.",
                    '{"name": "Finish", "arguments": {"answer": "true"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: Brad Wilk was a member of Greta in 1990.\nQ: Was this claim true or false?",
                    "Search for more information about Brad Wilk.",
                    '{"name": "Search", "arguments": {"topic": "Brad Wilk"}}',
                    "[Document]\nBradley Joseph Wilk (born September 5, 1968) is an American drummer. He is best known as a member of the rock bands Rage Against the Machine (1991–2000, 2007–2011, 2019–2024), Audioslave (2001–2007, 2017), and Prophets of Rage (2016–2019).\nWilk started his career as a drummer for Greta in 1990, and helped co-found Rage Against the Machine with Tom Morello and Zack de la Rocha in August 1991. Following that band's breakup in October 2000, Wilk, Morello, Rage Against the Machine bassist Tim Commerford and Soundgarden frontman Chris Cornell formed the supergroup Audioslave, which broke up in 2007. From 2016 to 2019, he played in the band Prophets of Rage, with Commerford, Morello, Chuck D, B-Real and DJ Lord. He has played with Rage Against the Machine since their reunion.\nWilk has also performed drums on English metal band Black Sabbath's final album 13, released in June 2013. He briefly played with Pearl Jam shortly after the release of their debut album Ten and had previously been in the band Indian Style with Eddie Vedder.\n[End]",
                    "Wilk started his career as a drummer for Greta in 1990 , and helped co-found Rage with Tom Morello and Zack de la Rocha in August 1991 .",
                ],
                "articles": [
                    "Bradley Joseph Wilk (born September 5, 1968) is an American drummer. He is best known as a member of the rock bands Rage Against the Machine (1991–2000, 2007–2011, 2019–2024), Audioslave (2001–2007, 2017), and Prophets of Rage (2016–2019).\nWilk started his career as a drummer for Greta in 1990, and helped co-found Rage Against the Machine with Tom Morello and Zack de la Rocha in August 1991. Following that band's breakup in October 2000, Wilk, Morello, Rage Against the Machine bassist Tim Commerford and Soundgarden frontman Chris Cornell formed the supergroup Audioslave, which broke up in 2007. From 2016 to 2019, he played in the band Prophets of Rage, with Commerford, Morello, Chuck D, B-Real and DJ Lord. He has played with Rage Against the Machine since their reunion.\nWilk has also performed drums on English metal band Black Sabbath's final album 13, released in June 2013. He briefly played with Pearl Jam shortly after the release of their debut album Ten and had previously been in the band Indian Style with Eddie Vedder.",
                ],
                "cot": "Wilk started his career as a drummer for Greta in 1990 , and helped co-found Rage with Tom Morello and Zack de la Rocha in August 1991 .",
            },
            {
                "label": False,
                "claim": "The horse did not begin to become domesticated around 4000 BC.",
                "unique_evidence": [["Horse", "3"]],
                "evidence_sentences": [
                    [
                        "Horse",
                        "3",
                        "Humans began to domesticate horses around 4000 BC , and their domestication is believed to have been widespread by 3000 BC .\tdomesticate\tDomestication\tdomestication\tdomestication of the horse\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "69612",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: The horse did not begin to become domesticated around 4000 BC.\nQ: Was this claim true or false?",
                    "I need to search Horse.",
                    '{"name": "Search", "arguments": {"topic": "Horse"}}',
                    "[Document]\nA house is a single-unit residential building. It may range in complexity from a rudimentary hut to a complex structure of wood, masonry, concrete or other material, outfitted with plumbing, electrical, and heating, ventilation, and air conditioning systems. Houses use a range of different roofing systems to keep precipitation such as rain from getting into the dwelling space. Houses generally have doors or locks to secure the dwelling space and protect its inhabitants and contents from burglars or other trespassers. Most conventional modern houses in Western cultures will contain one or more bedrooms and bathrooms, a kitchen or cooking area, and a living room. A house may have a separate dining room, or the eating area may be integrated into the kitchen or another room. Some large houses in North America have a recreation room. In traditional agriculture-oriented societies, domestic animals such as chickens or larger livestock (like cattle) may share part of the house with humans.\nThe social unit that lives in a house is known as a household. Most commonly, a household is a family unit of some kind, although households may also have other social groups, such as roommates or, in a rooming house, unconnected individuals, that typically use a house as their home. Some houses only have a dwelling space for one family or similar-sized group; larger houses called townhouses or row houses may contain numerous family dwellings in the same structure. A house may be accompanied by outbuildings, such as a garage for vehicles or a shed for gardening equipment and tools. A house may have a backyard, a front yard or both, which serve as additional areas where inhabitants can relax, eat, or exercise.\n[End]",
                    "Humans began to domesticate horses around 4000 BC , and their domestication is believed to have been widespread by 3000 BC .",
                    "The claim is false.",
                    '{"name": "Finish", "arguments": {"answer": "false"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: The horse did not begin to become domesticated around 4000 BC.\nQ: Was this claim true or false?",
                    "Search for more information about Horse.",
                    '{"name": "Search", "arguments": {"topic": "Horse"}}',
                    "[Document]\nA house is a single-unit residential building. It may range in complexity from a rudimentary hut to a complex structure of wood, masonry, concrete or other material, outfitted with plumbing, electrical, and heating, ventilation, and air conditioning systems. Houses use a range of different roofing systems to keep precipitation such as rain from getting into the dwelling space. Houses generally have doors or locks to secure the dwelling space and protect its inhabitants and contents from burglars or other trespassers. Most conventional modern houses in Western cultures will contain one or more bedrooms and bathrooms, a kitchen or cooking area, and a living room. A house may have a separate dining room, or the eating area may be integrated into the kitchen or another room. Some large houses in North America have a recreation room. In traditional agriculture-oriented societies, domestic animals such as chickens or larger livestock (like cattle) may share part of the house with humans.\nThe social unit that lives in a house is known as a household. Most commonly, a household is a family unit of some kind, although households may also have other social groups, such as roommates or, in a rooming house, unconnected individuals, that typically use a house as their home. Some houses only have a dwelling space for one family or similar-sized group; larger houses called townhouses or row houses may contain numerous family dwellings in the same structure. A house may be accompanied by outbuildings, such as a garage for vehicles or a shed for gardening equipment and tools. A house may have a backyard, a front yard or both, which serve as additional areas where inhabitants can relax, eat, or exercise.\n[End]",
                    "Humans began to domesticate horses around 4000 BC , and their domestication is believed to have been widespread by 3000 BC .",
                ],
                "articles": [
                    "A house is a single-unit residential building. It may range in complexity from a rudimentary hut to a complex structure of wood, masonry, concrete or other material, outfitted with plumbing, electrical, and heating, ventilation, and air conditioning systems. Houses use a range of different roofing systems to keep precipitation such as rain from getting into the dwelling space. Houses generally have doors or locks to secure the dwelling space and protect its inhabitants and contents from burglars or other trespassers. Most conventional modern houses in Western cultures will contain one or more bedrooms and bathrooms, a kitchen or cooking area, and a living room. A house may have a separate dining room, or the eating area may be integrated into the kitchen or another room. Some large houses in North America have a recreation room. In traditional agriculture-oriented societies, domestic animals such as chickens or larger livestock (like cattle) may share part of the house with humans.\nThe social unit that lives in a house is known as a household. Most commonly, a household is a family unit of some kind, although households may also have other social groups, such as roommates or, in a rooming house, unconnected individuals, that typically use a house as their home. Some houses only have a dwelling space for one family or similar-sized group; larger houses called townhouses or row houses may contain numerous family dwellings in the same structure. A house may be accompanied by outbuildings, such as a garage for vehicles or a shed for gardening equipment and tools. A house may have a backyard, a front yard or both, which serve as additional areas where inhabitants can relax, eat, or exercise.",
                ],
                "cot": "Humans began to domesticate horses around 4000 BC , and their domestication is believed to have been widespread by 3000 BC .",
            },
        ],
        "test": [
            {
                "label": True,
                "claim": "Ukrainian Soviet Socialist Republic was a founding participant of the UN.",
                "id": "163803",
            },
        ],
        "validation": [
            {
                "label": False,
                "claim": "Tylenol is only a brand of clothes.",
                "unique_evidence": [["Tylenol_-LRB-brand-RRB-", "0"]],
                "evidence_sentences": [
                    [
                        "Tylenol_-LRB-brand-RRB-",
                        "0",
                        "Tylenol -LSB- ˈtaɪlənɒl -RSB- is a brand of drugs advertised for reducing pain , reducing fever , and relieving the symptoms of allergies , cold , cough headache , and influenza .\tpain\tanalgesic\tfever\tfever\tallergies\tallergy\tcold\tcommon cold\tcough\tcough\tinfluenza\tinfluenza\n",
                    ],
                ],
                "evidence_sentence_count": 1,
                "id": "179287",
                "traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                    "thought",
                    "action",
                ],
                "traj_values": [
                    "On June 2017, the following claim was made: Tylenol is only a brand of clothes.\nQ: Was this claim true or false?",
                    "I need to search Tylenol (brand).",
                    '{"name": "Search", "arguments": {"topic": "Tylenol (brand)"}}',
                    "[Document]\nTylenol () is a brand of medication, advertised for reducing pain, reducing fever, and relieving the symptoms of allergies, cold, cough, headache, and influenza. The active ingredient of its original flagship product is paracetamol (known in the United States, Canada, and various other countries as acetaminophen), an analgesic and antipyretic. Like the words paracetamol and acetaminophen, the brand name Tylenol is derived from a chemical name for the compound, N-acetyl-para-aminophenol (APAP). The brand name is owned by McNeil Consumer Healthcare, a subsidiary of Kenvue.\n[End]",
                    "Tylenol [ˈtaɪlənɒl] is a brand of drugs advertised for reducing pain , reducing fever , and relieving the symptoms of allergies , cold , cough headache , and influenza .",
                    "The claim is false.",
                    '{"name": "Finish", "arguments": {"answer": "false"}}',
                ],
                "rewoo_traj_keys": [
                    "task",
                    "thought",
                    "action",
                    "observation",
                    "observation",
                ],
                "rewoo_traj_values": [
                    "On June 2017, the following claim was made: Tylenol is only a brand of clothes.\nQ: Was this claim true or false?",
                    "Search for more information about Tylenol (brand).",
                    '{"name": "Search", "arguments": {"topic": "Tylenol (brand)"}}',
                    "[Document]\nTylenol () is a brand of medication, advertised for reducing pain, reducing fever, and relieving the symptoms of allergies, cold, cough, headache, and influenza. The active ingredient of its original flagship product is paracetamol (known in the United States, Canada, and various other countries as acetaminophen), an analgesic and antipyretic. Like the words paracetamol and acetaminophen, the brand name Tylenol is derived from a chemical name for the compound, N-acetyl-para-aminophenol (APAP). The brand name is owned by McNeil Consumer Healthcare, a subsidiary of Kenvue.\n[End]",
                    "Tylenol [ˈtaɪlənɒl] is a brand of drugs advertised for reducing pain , reducing fever , and relieving the symptoms of allergies , cold , cough headache , and influenza .",
                ],
                "articles": [
                    "Tylenol () is a brand of medication, advertised for reducing pain, reducing fever, and relieving the symptoms of allergies, cold, cough, headache, and influenza. The active ingredient of its original flagship product is paracetamol (known in the United States, Canada, and various other countries as acetaminophen), an analgesic and antipyretic. Like the words paracetamol and acetaminophen, the brand name Tylenol is derived from a chemical name for the compound, N-acetyl-para-aminophenol (APAP). The brand name is owned by McNeil Consumer Healthcare, a subsidiary of Kenvue.",
                ],
                "cot": "Tylenol [ˈtaɪlənɒl] is a brand of drugs advertised for reducing pain , reducing fever , and relieving the symptoms of allergies , cold , cough headache , and influenza .",
            },
        ],
    }
    fever = DatasetDict(
        {
            "train": Dataset.from_list(fever["train"]),
            "validation": Dataset.from_list(fever["validation"]),
            "test": Dataset.from_list(fever["test"]),
        },
    )

    optim = PDLOptimizer(
        pdl_path=Path("examples/optimizer/fever.pdl"),
        dataset=fever,  # pyright: ignore
        trial_thread=FEVEREvaluator,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()
    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    pprint(result)
    assert exception_str == "None", exception_str


def run_optimizer_mbpp(pattern, num_demonstrations=0):
    config = OptimizationConfig(
        benchmark="mbpp",
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

    mbpp_dataset = MBPPDataset(
        "../prompt-declaration-language-merge/var/mbpp_trajectified",
    )

    optim = PDLOptimizer(
        pdl_path=Path("examples/optimizer/mbpp.pdl"),
        dataset=mbpp_dataset,  # pyright: ignore
        trial_thread=MBPPEvaluator,
        yield_output=True,
        experiment_path=Path("test_experiments"),
        config=config,
    )

    result = optim.run()
    exception_str = result["iterations"][0]["candidates"][0]["results"][0]["exception"]
    assert exception_str == "None", exception_str
    pprint(result)


@pytest.mark.skip("API access not available in CI")
def test_gsm8k_zeroshot_cot():
    run_optimizer_gsm8k("cot")


@pytest.mark.skip("API access not available in CI")
def test_gsm8k_fiveshot_react():
    run_optimizer_gsm8k("react", num_demonstrations=5)


@pytest.mark.skip("API access not available in CI")
def test_gsm8k_fiveshot_rewoo():
    run_optimizer_gsm8k("rewoo", num_demonstrations=5)


@pytest.mark.skip("API access not available in CI")
def test_fever_zeroshot_cot():
    run_optimizer_fever("cot")


@pytest.mark.skip("API access not available in CI")
def test_fever_fiveshot_react():
    run_optimizer_fever("react", num_demonstrations=5)


@pytest.mark.skip("API access not available in CI")
def test_fever_zeroshot_rewoo():
    run_optimizer_fever("rewoo")


@pytest.mark.skip("API access not available in CI")
def test_mbpp_zeroshot_cot():
    run_optimizer_mbpp("cot")


@pytest.mark.skip("API access not available in CI")
def test_mbpp_zeroshot_react():
    run_optimizer_mbpp("react")
