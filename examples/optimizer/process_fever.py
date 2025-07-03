# Instructions for running this script:
# 1. Ensure you have the required libraries installed.
#    `datasets` should be version 3.0 or higher.
#
#    `pip install prompt-declaration-language[all] funcy`
# 2. Download the original FEVER dataset with wiki-pages, and BigBench FEVER task JSON file
#    from the respective sources.
#    https://fever.ai/dataset/fever.html
#    https://github.com/google/BIG-bench/blob/main/bigbench/benchmark_tasks/fact_checker/fever/task.json
#
#    ```
#    wget https://raw.githubusercontent.com/google/BIG-bench/refs/heads/main/bigbench/benchmark_tasks/fact_checker/fever/task.json
#    wget https://fever.ai/download/fever/wiki-pages.zip
#    wget https://fever.ai/download/fever/shared_task_dev.jsonl
#    ```
#    Place the downloaded files in the `var/fever` directory.
#    Extract the `wiki-pages.zip` file into `var/fever/wiki-pages/`.
# 3. Run this script to process the FEVER dataset.
#    `python examples/optimizer/process_fever.py`
#
import json
import operator
import re
import unicodedata
import warnings
from functools import cache
from itertools import groupby
from pathlib import Path
from typing import Any

import pandas as pd
import wikipedia
from datasets.arrow_dataset import Dataset
from datasets.dataset_dict import DatasetDict
from datasets.load import load_dataset, load_from_disk
from funcy import flatten
from tqdm.autonotebook import tqdm

tqdm.pandas()
warnings.simplefilter("ignore")

var_dir = Path("var")
var_dir.mkdir(parents=True, exist_ok=True)


def clean_fever(text: str) -> str:
    mapping = {
        "_": " ",
        "-LRB- ": "(",
        " -RRB-": ")",
        "-LSB- ": "[",
        " -RSB-": "]",
        "-LRB-": "(",
        "-RRB-": ")",
        "-LSB-": "[",
        "-RSB-": "]",
        "-COLON-": ":",
    }

    for k, v in mapping.items():
        text = text.replace(k, v)

    return text.strip()


@cache
def search_new(
    subject: str, auto_suggest: bool = False, redirect: bool = False
) -> tuple[str, str]:
    try:
        result = (
            wikipedia.summary(
                subject, auto_suggest=auto_suggest, redirect=redirect
            ).strip(),
            "success",
        )
    except wikipedia.DisambiguationError as d:
        result = (
            f'"{subject}" may refer to one of {d.args[1]}. Please retry the search with one of the subjects using Search[<subject>].',
            "disambg",
        )
    except wikipedia.PageError as e:
        result = f"{e} Please retry the search using Search[<subject>].", "pageerror"
    except wikipedia.WikipediaException as e:
        print(e, type(e))
        result = str(e), f"other:{type(e)}"
    except Exception as e:
        print(e, type(e))
        result = str(e), f"other:{type(e)}"
    return result


def searcher(row: dict[str, Any], auto_suggest: bool):
    cleaned = clean_fever(row["article"])
    if "msg" in row:
        if row["msg"] != "success":
            wiki, msg = search_new(cleaned, auto_suggest=auto_suggest, redirect=True)
        else:
            wiki = row["wiki"]
            msg = row["msg"]
    else:
        wiki, msg = search_new(cleaned, auto_suggest=auto_suggest, redirect=True)
    return {"wiki": wiki, "msg": msg, "cleaned": cleaned}


def remove_accents(x: str) -> str:
    return unicodedata.normalize("NFD", x)


fever = load_dataset("fever/fever", "v1.0")
if not isinstance(fever, DatasetDict):
    raise TypeError(f"Expected fever to be a DatasetDict, but got: {type(fever)}")

bigbench_fever = json.loads(Path("var/fever/task.json").read_text(encoding="utf-8"))

fever.save_to_disk("var/fever/fever_original")
print(fever)

wikipages = load_dataset(
    "json",
    data_files="var/fever/wiki-pages/wiki-pages/wiki-*.jsonl",
    encoding="utf-8",
)
if not isinstance(wikipages, DatasetDict):
    raise TypeError(
        f"Expected wikipages to be a DatasetDict, but got: {type(wikipages)}"
    )

print("Loaded wikipages:", wikipages)
print("Mapping wikipages...")
wikipages["train"] = wikipages["train"].map(
    lambda x: {
        "lines_split": [x for x in re.split(r"\d+\t", x["lines"]) if x],
    },
    num_proc=32,
)
print("Mapping wikipages done.")

print("Converting wikipages to DataFrame...")
wiki_pages_df = wikipages["train"].to_pandas()
if not isinstance(wiki_pages_df, pd.DataFrame):
    raise TypeError(
        f"Expected wiki_pages_df to be a DataFrame, but got: {type(wiki_pages_df)}"
    )
wiki_pages_df = wiki_pages_df.set_index("id")
wiki_pages_df.index = wiki_pages_df.index.map(remove_accents)
print("Wikipages converted to DataFrame.")


if isinstance(wiki_pages_df, pd.DataFrame):
    wiki_pages_df.to_parquet(
        path="var/fever/wiki_pages.parquet",
        index=True,
        engine="pyarrow",
        compression="zstd",
        compression_level=10,
    )
else:
    raise TypeError(
        f"Expected wiki_pages_df to be a DataFrame, but got: {type(wiki_pages_df)}"
    )


df = pd.read_json(
    "var/fever/shared_task_dev.jsonl", lines=True, encoding="utf-8"
).set_index("id")
print("Loaded original FEVER", len(df))
df = df[df.label.isin(["SUPPORTS", "REFUTES"])].copy()
print("Filtered original FEVER", len(df))


def evidence_mapper(evidence: list[tuple]):
    evidences = {(x[2], x[3]) for x in evidence[0] if x[2] is not None}
    return list(evidences)


df["unique_evidence"] = df[
    "evidence"
].progress_apply(  # pyright: ignore[reportAttributeAccessIssue]
    evidence_mapper
)


def evidence_mapper_sentence(evidences: list[tuple[str, int]]):
    if not isinstance(wiki_pages_df, pd.DataFrame):
        raise TypeError(
            f"Expected wiki_pages_df to be a DataFrame, but got: {type(wiki_pages_df)}"
        )

    lines = []
    for title, line in evidences:
        if title is None or line is None:
            continue
        title_no_acc = remove_accents(title)

        if title_no_acc not in wiki_pages_df.index:
            print(title_no_acc)
            continue

        sentence = wiki_pages_df.loc[title_no_acc]
        if sentence["lines_split"] is not None and len(sentence["lines_split"]) > line:
            sentence = sentence["lines_split"][line]
            lines.append((title_no_acc, line, sentence))
        else:
            print(sentence)
    return list(lines)


df["evidence_sentences"] = df[
    "unique_evidence"
].progress_apply(  # pyright: ignore[reportAttributeAccessIssue]
    evidence_mapper_sentence
)

bigbench = pd.DataFrame.from_records(bigbench_fever["examples"]).set_index("id")

tqdm.pandas(desc="Mapping claims to (in) bigbench")
df["claim_in_bigbench"] = df[
    "claim"
].progress_apply(  # pyright: ignore[reportAttributeAccessIssue]
    lambda x: bigbench.input.str.contains(x).any()
)
tqdm.pandas()

df["evidence_sentence_count"] = df[
    "evidence_sentences"
].map(  # pyright: ignore[reportAttributeAccessIssue]
    len
)
print("Mapped bigbench")

train_df = df[(~df.index.isin(bigbench.index)) & (df["evidence_sentence_count"] > 0)]

test_df = df[
    (df.index.isin(bigbench.index)) & (df["evidence_sentence_count"] > 0)
].drop(  # pyright: ignore[reportAttributeAccessIssue]
    columns=["verifiable", "claim_in_bigbench", "evidence"]
)
test_df["unique_evidence"] = test_df[
    "unique_evidence"
].map(  # pyright: ignore[reportAttributeAccessIssue]
    lambda x: [[str(title), str(sent_id)] for title, sent_id in x]
)
test_df["evidence_sentences"] = test_df[
    "evidence_sentences"
].map(  # pyright: ignore[reportAttributeAccessIssue]
    lambda x: [[str(title), str(sent_id), str(sent)] for title, sent_id, sent in x]
)
test_df["label"] = test_df["label"] == "SUPPORTS"
test_df.index = test_df.index.astype(pd.StringDtype())
test_df.claim = test_df.claim.astype(pd.StringDtype())
test_df["id"] = test_df.index
print("Saving fever test df")
test_df.to_json("fever_test_df.json", orient="records", lines=True)
print("Saved fever test df")

train_df = df[
    (~df.index.isin(bigbench.index)) & (df["evidence_sentence_count"] > 0)
].drop(  # pyright: ignore[reportAttributeAccessIssue]
    columns=["verifiable", "claim_in_bigbench", "evidence"]
)
train_df["unique_evidence"] = train_df[
    "unique_evidence"
].map(  # pyright: ignore[reportAttributeAccessIssue]
    lambda x: [[str(title), str(sent_id)] for title, sent_id in x]
)
train_df["evidence_sentences"] = train_df[
    "evidence_sentences"
].map(  # pyright: ignore[reportAttributeAccessIssue]
    lambda x: [[str(title), str(sent_id), str(sent)] for title, sent_id, sent in x]
)
train_df["label"] = train_df["label"] == "SUPPORTS"
train_df.index = train_df.index.astype(pd.StringDtype())
train_df.claim = train_df.claim.astype(pd.StringDtype())
train_df["id"] = train_df.index
print("Saving fever train df")
train_df.to_json("fever_train_df.json", orient="records", lines=True)
print("Saved fever train df")

fever_ds = load_dataset(
    "json", data_files={"train": "fever_train_df.json", "test": "fever_test_df.json"}
)
if not isinstance(fever_ds, DatasetDict):
    raise TypeError(f"Expected fever_ds to be a DatasetDict, but got: {type(fever_ds)}")
fever_ds.save_to_disk("var/fever/fever_reprocessed")
print(fever_ds)


articles = list(
    set(flatten([[y[0] for y in x] for x in fever_ds["train"]["unique_evidence"]]))
)
article_ds = Dataset.from_dict({"article": articles})
print(article_ds)


article_ds = article_ds.map(lambda x: searcher(x, True), num_proc=4)
article_ds = article_ds.map(lambda x: searcher(x, False), num_proc=1)
article_df = article_ds.to_pandas()
if not isinstance(article_df, pd.DataFrame):
    raise TypeError(
        f"Expected article_df to be a DataFrame, but got: {type(article_df)}"
    )
article_df = article_df.set_index("article")
print("Articles that did not return a successful response:")
print(article_df[article_df.msg != "success"])
article_ds.save_to_disk("var/fever/fever_articles")
article_df.to_parquet(
    "var/fever/fever_articles.parquet",
    index=True,
    engine="pyarrow",
    compression="zstd",
    compression_level=10,
)


def search(query: str) -> tuple:
    if not isinstance(article_df, pd.DataFrame):
        raise TypeError(
            f"Expected article_df to be a DataFrame, but got: {type(article_df)}"
        )
    row = article_df.loc[query]
    return row["wiki"], row["msg"]


def trajectorize(row: dict[str, Any]) -> dict[str, Any]:
    evidence_sentences = row["evidence_sentences"]

    claim = row["claim"].strip()
    task = f"On June 2017, the following claim was made: {claim}\nQ: Was this claim true or false?"
    answer = str(row["label"]).lower()

    article_sentence_group = {
        k: list(v) for k, v in groupby(evidence_sentences, operator.itemgetter(0))
    }

    sample_articles = {}
    statuses = []
    wiki_worked = True
    for article in article_sentence_group:
        cleaned_article = clean_fever(article)
        wiki, worked = search(article)
        wiki = wiki.strip()
        if worked != "success":
            wiki_worked = False

        sample_articles[cleaned_article] = wiki
        statuses.append(worked)
    all_wiki_success = all(x in {"success", "fallback"} for x in statuses)

    trajectory = [{"task": task}]

    for article, evidences in article_sentence_group.items():
        cleaned_article = clean_fever(article)
        trajectory.extend(
            [
                {"thought": f"I need to search {cleaned_article}."},
                {
                    "action": '{"name": "Search", "arguments": {"topic": "'
                    + cleaned_article
                    + '"}}'
                },
                {
                    "observation": f"[Document]\n{sample_articles[cleaned_article]}\n[End]"
                },
            ]
        )

        for _title, _line, sent in evidences:
            trajectory.append({"observation": clean_fever(sent.split("\t")[0])})

    trajectory.extend(
        [
            {"thought": f"The claim is {answer}."},
            {"action": '{"name": "Finish", "arguments": {"topic": "' + answer + '"}}'},
        ]
    )

    traj_keys = [next(iter(t.keys())) for t in trajectory]
    traj_values = [next(iter(t.values())) for t in trajectory]

    rewoo_trajectory = [{"task": task}]

    for article, evidences in article_sentence_group.items():
        cleaned_article = clean_fever(article)
        rewoo_trajectory.extend(
            [
                {"thought": f"Search for more information about {cleaned_article}."},
                {
                    "action": '{"name": "Search", "arguments": {"topic": "'
                    + cleaned_article
                    + '"}}'
                },
                {
                    "observation": f"[Document]\n{sample_articles[cleaned_article]}\n[End]"
                },
            ]
        )

        for _title, _line, sent in evidences:
            rewoo_trajectory.append({"observation": clean_fever(sent.split("\t")[0])})

    rewoo_traj_keys = [next(iter(t.keys())) for t in rewoo_trajectory]
    rewoo_traj_values = [next(iter(t.values())) for t in rewoo_trajectory]

    return {
        "traj_keys": traj_keys,
        "traj_values": traj_values,
        "rewoo_traj_keys": rewoo_traj_keys,
        "rewoo_traj_values": rewoo_traj_values,
        "all_wiki_success": all_wiki_success,
        "wiki_worked": wiki_worked,
        "articles": list(sample_articles.values()),
        "statuses": statuses,
    }


def sentencify(row: dict[str, Any]) -> dict[str, str]:
    evidence_sentences = row["evidence_sentences"]

    article_sentence_group = {
        clean_fever(k): list(v)
        for k, v in groupby(evidence_sentences, operator.itemgetter(0))
    }

    sentences = []
    for evidences in article_sentence_group.values():
        for _title, _line, sent in evidences:
            sentences.append(clean_fever(sent.split("\t")[0]))

    return {"cot": " ".join(sentences).strip().replace("\n", " ").strip()}


fever_ds = fever_ds.map(
    lambda x: {"label": str(x["label"]).lower()},
    num_proc=4,
)

fever_ds["train"] = (
    fever_ds["train"].map(trajectorize, num_proc=4).map(sentencify, num_proc=4)
)


print(
    "Wiki lookup failures:",
    fever_ds["train"].filter(lambda x: x["all_wiki_success"] is False),
)


fever_ds["train"] = fever_ds["train"].filter(lambda x: x["wiki_worked"] is True)
fever_ds["train"] = fever_ds["train"].remove_columns(
    column_names=["wiki_worked", "all_wiki_success", "statuses"]
)
print(fever_ds)

new_split = fever_ds["train"].train_test_split(test_size=1024)
fever_ds["train"] = new_split["train"]
fever_ds["validation"] = new_split["test"]
fever_ds.save_to_disk("var/fever_trajectified")

# Make sure the saved dataset is loaded correctly
ds = load_from_disk("var/fever_trajectified")
print(ds)
