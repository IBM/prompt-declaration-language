import argparse
from dataclasses import dataclass
import datetime
import pathlib
from typing import List, Tuple, Dict, Optional, TypedDict
from statistics import mean, stdev
from sys import stderr

from benchmark import AggregatedResults, Experiment, Stats

@dataclass
class Key():
    task: str
    dataset: str
    pdl_path: str
    model: str
    algorithm: str
    temperature: float
    particles: int
    num_tests: int
    retry: int
    
    # def __hash__(self):
    #     return hash((self['task'], self['dataset'], self['model'], self["algorithm"], self["temperature"], self["particles"], self["num_tests"], self["retry"]))

    # def __eq__(self, other):
    #     if not isinstance(other, Key):
    #         return NotImplemented
    #     return self['task'] == other["task"] and self['dataset'] == other["dataset"] and self['model'] == other["model"] and self["algorithm"] == other["algorithm"] and self["temperature"] == other["temperature"] and self["particles"] == other["particles"] and self["num_tests"] == other["num_tests"] and self["retry"] == other["retry"]

    def __hash__(self):
        return hash((self.task, self.dataset, self.model, self.algorithm, self.temperature, self.particles, self.num_tests, self.retry))

    def __eq__(self, other):
        if not isinstance(other, Key):
            return NotImplemented
        return self.task == other.task and self.dataset == other.dataset and self.model == other.model and self.algorithm == other.algorithm and self.temperature == other.temperature and self.particles == other.particles and self.num_tests == other.num_tests and self.retry == other.retry

@dataclass
class TaskModel():
    task: str
    model: str
    
    def __hash__(self):
        return hash((self.task, self.model))

    def __eq__(self, other):
        if not isinstance(other, TaskModel):
            return NotImplemented
        return self.task == other.task and self.model == other.model 


def aggregate_experiments_by_config(
    experiments: list[Experiment],
) -> dict[Key, dict]:
    by_key: Dict[Key, dict] = {}
    for run in experiments:
        cfg = run.config
        key: Key = Key(
            task = cfg.task,
            dataset = cfg.dataset,
            pdl_path = cfg.pdl_path,
            model = cfg.model,
            algorithm = cfg.algorithm,
            temperature = cfg.temperature,
            particles = cfg.particles,
            num_tests = cfg.num_tests,
            retry = cfg.retry
        )        
        runs = by_key.setdefault(key, [])
        runs.append(run)
        if run.config.num_tests != run.result.total:
            print(f"% Warning {cfg.aggregated_results_path}: missing {run.config.num_tests - run.result.total} tests")
        if len(run.result.exceptions) > 0:
            print(f"% Warning {cfg.aggregated_results_path}: {len(run.result.exceptions)} exceptions")
    aggregated_experiments = {}
    for key, experiments in by_key.items():
        runs = [ exp.result for exp in experiments ]
        aggregated_experiments[key] = { "experiments": experiments, "stats": runs_stats(runs) }
    return aggregated_experiments

def sort_aggregated_experiments(aggregated_experiments):
    rows: list[tuple[Key, dict]] = [(key, val) for key, val in aggregated_experiments.items()]
    rows.sort(key=lambda r: (r[0].task, r[0].retry, r[0].pdl_path, r[0].particles, r[0].temperature, r[0].model, _sort_tag_algo(r[0].algorithm)))
    return rows

def _sort_tag_algo(algo: str):
    if algo.endswith("maj"):
        t = f"0-{algo}"
    elif algo.endswith("is"):
        t = f"1-{algo}"
    elif algo.endswith("smc"):
        t = f"2-{algo}"
    else:
        t = algo
    return t

def stats(elements: list) -> Optional[Tuple[float, float]]:
    match len(elements):
        case 0:
            return None
        case 1:
            return elements[0], 0.0        
    return (mean(elements), stdev(elements))

def runs_stats(runs: list[AggregatedResults]):
    success_expectation_list = [ run.success_expectation for run in runs ]
    mode_success_rate_list = [ (run.mode.successes / run.total) for run in runs ]
    pass_at_1_success_rate_list = [ (run.pass_at_1.successes / run.total) for run in runs if run.pass_at_1 is not None ]
    pass_at_k_success_rate_list = [ (run.pass_at_k.successes / run.total) for run in runs ]
    time_list = [ run.total_time / run.total for run in runs ]
    model_calls_list = [ run.llm_usage.model_calls / run.total for run in runs ]
    prompt_tokens_list = [ run.llm_usage.prompt_tokens / run.total for run in runs ]
    completion_tokens_list = [ run.llm_usage.completion_tokens / run.total for run in runs ]
    return {
        "success_expectation": stats(success_expectation_list),
        "mode": stats(mode_success_rate_list),
        "pass_at_1": stats(pass_at_1_success_rate_list),
        "pass_at_k": stats(pass_at_k_success_rate_list),
        "time": stats(time_list),
        "model_calls": stats(model_calls_list),
        "prompt_tokens": stats(prompt_tokens_list),
        "completion_tokens": stats(completion_tokens_list),
    }

# --- LaTeX rendering ---------------------------------------------------------

def make_caption(experiments: list[Experiment]):
    assert len(experiments) > 0
    experiment = experiments[0]
    config = experiment.config
    task = config.task
    dataset = config.dataset
    pdl_path = config.pdl_path
    temperature = config.temperature
    particles = config.particles
    num_tests = config.num_tests
    assert all(
        [
            exp.config.task == task and
            exp.config.dataset == dataset and
            exp.config.pdl_path == pdl_path and
            exp.config.temperature == temperature and
            exp.config.particles == particles and
            exp.config.num_tests == num_tests
            for exp in experiments
        ]
    )
    return f"Results for the {task} benchmark (program: \\texttt{{{pdl_path}}}, data: \\texttt{{{dataset}}}) on {num_tests} samples with temperature {temperature} and {particles} particles."

def experiments_to_latex(
    experiments: list[Experiment],
    label: str = "tab:results",
    decimals_rate: int = 1,  # percent decimals for rate
    decimals_sd: int = 1,    # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    caption = make_caption(experiments)
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)

    # Column spec
    cols = ["l", "l", "r", "r", "r", "r", "r", "r", "r", "r"]
    header = ["model", "algo ", "mode", "E(succ)", "pass@1", "pass@k", "LLM calls", "prompt", "completion", "time" ]
    # header = [ _esc_latex(s) for s in header ]

    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\centering")
    lines.append(r"\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    for k, v in agg_rows:
        
        row = [
            format_model(k.model),
            format_algorithm(k.algorithm),
            format_rate_stats(v["stats"]["mode"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["success_expectation"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["pass_at_1"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["pass_at_k"], decimals_rate, decimals_sd),
            format_stats(v["stats"]["model_calls"], 1, decimals_sd),
            format_stats(v["stats"]["prompt_tokens"], decimals_stats, decimals_sd),
            format_stats(v["stats"]["completion_tokens"], decimals_stats, decimals_sd),
            format_time_stats(v["stats"]["time"], decimals_sd)
        ]
        # row = [ _esc_latex(x) for x in row]
        lines.append(" & ".join(row) + r" \\")

    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}")
    lines.append(f"\\caption{{{_esc_latex(caption)}}}")
    lines.append(f"\\label{{{_esc_latex(label)}}}")
    lines.append(r"\end{table}")

    return "\n".join(lines)

def group_aggregated_experiments(agg: list[dict[Key, dict]])-> dict:
    res: dict[TaskModel, dict] = {}
    for exp in agg:
        key = exp[0]
        tm = TaskModel(task=key.task, model=key.model)
        if tm not in res.keys():
            res[tm] = {}
        res[tm][key.algorithm] = exp[1]["stats"]["mode"]
        if key.algorithm == "parallel-maj":
            res[tm]["pass_at_1"] = exp[1]["stats"]["success_expectation"]
            res[tm]["pass_at_k"] = exp[1]["stats"]["pass_at_k"]
    return res

def get_max_array(data):
    max_val = max(data)
    return [1 if x == max_val else 0 for x in data]

def experiments_to_latex_total(
    experiments: list[Experiment],
    label: str = "tab:results",
    decimals_rate: int = 1,  # percent decimals for rate
    decimals_sd: int = 1,    # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    caption = "Results for PPDL as an inference scaling framework"
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)
    agg_rows_grouped = group_aggregated_experiments(agg_rows)

    # Column spec
    cols = ["c", "c", "c", "c", "c", "c"]
    header = ["model", "pass@1", "maj", "is", "smc", "pass@k"]
    # header = [ _esc_latex(s) for s in header ]

    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\setlength{\tabcolsep}{3pt}")
    lines.append(r"\centerline{\scriptsize\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    prev_task = None
    for k, v in agg_rows_grouped.items():
        
        if prev_task != k.task:
            lines.append(r"\midrule")
            lines.append(r"{\bf " + k.task + " } & & & & & \\\\")
            lines.append(r"\midrule")
            first = True
        prev_task = k.task
        bolds = get_max_array([v["parallel-maj"], v["parallel-is"],v["parallel-smc"]])
        row = [
            format_model(k.model),
            format_rate_stats(v["pass_at_1"], decimals_rate, decimals_sd),
            format_rate_stats(v["parallel-maj"], decimals_rate, decimals_sd, bolds[0]),
            format_rate_stats(v["parallel-is"], decimals_rate, decimals_sd, bolds[1]),
            format_rate_stats(v["parallel-smc"], decimals_rate, decimals_sd, bolds[2]),
            format_rate_stats(v["pass_at_k"], decimals_rate, decimals_sd),
        ]
        # row = [ _esc_latex(x) for x in row]
        lines.append(" & ".join(row) + r" \\")

    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}}")
    lines.append(f"\\caption{{{_esc_latex(caption)}}}")
    lines.append(f"\\label{{{_esc_latex(label)}}}")
    lines.append(r"\end{table}")

    return "\n".join(lines)


def experiments_to_latex_compact(
    experiments: list[Experiment],
    label: str = "tab:results",
    decimals_rate: int = 1,  # percent decimals for rate
    decimals_sd: int = 1,    # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    caption = make_caption(experiments)
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)

    # Column spec
    cols = ["l", "l", "r", "r", "r", "r", "r"]
    header = ["model", "algo ", "mode", "E(succ)", "pass@k", "LLM calls", "time" ]
    # header = [ _esc_latex(s) for s in header ]

    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\centering")
    lines.append(r"\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    prev_model = None
    for k, v in agg_rows:
        
        if prev_model is not None and prev_model != k.model:
            lines.append(r"\midrule")
        prev_model = k.model
        row = [
            format_model(k.model),
            format_algorithm(k.algorithm),
            format_rate_stats(v["stats"]["mode"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["success_expectation"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["pass_at_k"], decimals_rate, decimals_sd),
            format_stats(v["stats"]["model_calls"], 1, decimals_sd),
            format_time_stats(v["stats"]["time"], decimals_sd)
        ]
        # row = [ _esc_latex(x) for x in row]
        lines.append(" & ".join(row) + r" \\")

    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}")
    lines.append(f"\\caption{{{_esc_latex(caption)}}}")
    lines.append(f"\\label{{{_esc_latex(label)}}}")
    lines.append(r"\end{table}")

    return "\n".join(lines)


def format_rate_stats(stats, decimals_rate, decimals_sd, bold=False):
    if stats is None:
        return "-"
    rate, sd = stats
    rate_str = f"{rate*100:.{decimals_rate}f}\\%"
    if bold:
        rate_str = "{\\bf " + rate_str + "}"
    sd_str = f"{sd*100:.{decimals_sd}f}"
    return rate_str + " {\\tiny $\\pm$ " + sd_str + "}\\"

def format_stats(stats, decimals_stats, decimals_sd):
    if stats is None:
        return "-"
    mean, sd = stats
    mean_str = format_number(mean, decimals_stats)
    sd_str = format_number(sd, decimals_sd)
    return f"{mean_str} $\\pm$ {sd_str}"

def format_time_stats(stats, decimals_sd):
    if stats is None:
        return "-"
    mean, sd = stats
    mean_str = format_time(mean)
    sd_str = format_number(sd, decimals_sd)
    return f"{mean_str} $\\pm$ {sd_str}"


def format_number(number, decimals):
    if abs(number) < 1000:
        return f"{number:.{decimals}f}"
    else:
    # elif abs(number) < 1_000_000:
        return f"{number / 1000:.{decimals}f}k"
    # elif abs(number) < 1_000_000_000:
    #     return f"{number / 1_000_000:.1f}M"
    # elif abs(number) < 1_000_000_000_000:
    #     return f"{number / 1_000_000_000:.1f}B"
    # else:
    #     return f"{number / 1_000_000_000_000:.1f}T"

def format_model(model: str):
    # if model.endswith("llama-4-maverick-17b-128e-instruct-fp8"):
    #     m = "llama4-maverick"
    # elif model.endswith("gpt-oss-120b"):
    #     m = "gpt-oss-120b"
    # elif model.endswith("granite-4-h-small"):
    #     m = "granite4-small"
    # elif model.endswith("llama-3-3-70b-instruct"):
    #     m = "llama3.3-70b"
    # else:
    #     m = model
    match model:
        case x if "granite-4-h-small" in x or "granite-4.0-h-small" in x:
            m = "gr4sm"
        case x if "granite-4-h-tiny" in x or "granite-4.0-h-tiny" in x:
            m = "granite4tiny"
        case x if "granite-4-micro" in x or "granite-4.0-micro" in x:
            m = "gr4mi"
        case x if "gpt-oss-120b" in x:
            m = "gpt120"
        case x if "gpt-oss-20b" in x:
            m = "gpt20"
        case x if "llama-3-3-70b-instruct" in x:
            m = "llama3"
        case x if "llama-4-maverick-17b-128e-instruct-fp8" in x:
            m = "lla4mvk"
        case x if "Llama-4-Scout-17B-16E-Instruct" in x:
            m = "lla4sct"
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
    return m

def format_algorithm(algo: str):
    return algo.removeprefix("parallel-")

def format_time(seconds):
    seconds_i = int(seconds)
    hours = seconds_i // 3600
    minutes = (seconds_i % 3600) // 60
    seconds_i = seconds_i % 60
    if hours != 0:
        return f"{hours:02}:{minutes:02}:{seconds_i:02}"
    if minutes != 0:
        return f"{minutes:02}:{seconds_i:02}"
    return f"{seconds:.1f}"

def _esc_latex(s: str) -> str:
    if s is None:
        return ""
    return (str(s)
            # .replace('\\', r'\textbackslash{}')
            # .replace('\\', r'\\')
            .replace('_', r'\_')
            .replace('%', r'\%')
            .replace('&', r'\&')
            .replace('#', r'\#')
            # .replace('{', r'\{')
            # .replace('}', r'\}')
            .replace('$', r'\$'))

def files_to_latex(files):
    experiments = []
    for file_name in files:
        print(f"% analyse: {file_name}")
        file_path = pathlib.Path(file_name)
        file_content = file_path.read_text()
        experiment = Experiment.model_validate_json(file_content)
        experiments.append(experiment)
    #latex = experiments_to_latex_compact(experiments)
    latex = experiments_to_latex_total(experiments)
    return latex

def main():
    parser = argparse.ArgumentParser(
        description="Analyse benchmark results",
    )
    parser.add_argument("files", nargs='+', help="Aggregated results files to process.")
    args = parser.parse_args()
    latex = files_to_latex(args.files)
    print(latex)
    
if __name__ == "__main__":
    main()