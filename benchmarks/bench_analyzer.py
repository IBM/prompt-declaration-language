"""
Benchmark Results Analyzer

This module analyzes benchmark experiment results and generates LaTeX tables.
It processes aggregated benchmark data, computes statistics, and formats results.

Key functionality:
- Aggregates experiments by configuration parameters
- Computes mean and standard deviation statistics
- Generates multiple LaTeX table formats (full, compact, total)
- Formats model names, algorithms, and metrics for display
"""

import argparse
import pathlib
from dataclasses import dataclass
from statistics import mean as compute_mean
from statistics import stdev as compute_stdev
from sys import stderr
from typing import Any

from benchmark import AggregatedResults, Experiment


@dataclass
class Key:  # pylint: disable=too-many-instance-attributes
    """
    Unique identifier for a benchmark experiment configuration.
    
    Groups experiments by all configuration parameters to enable aggregation
    of multiple runs with identical settings. Used as a dictionary key to
    organize and compare experiment results.
    
    Attributes:
        task: Name of the benchmark task (e.g., "gsm8k", "mbpp")
        dataset: Dataset identifier used for the task
        pdl_path: Path to the PDL program file
        model: LLM model name/identifier
        algorithm: Inference algorithm (e.g., "parallel-maj", "parallel-smc")
        temperature: Sampling temperature parameter
        particles: Number of particles for probabilistic inference
        num_tests: Total number of test cases
        retry: Retry attempt number for this configuration
    """
    task: str
    dataset: str
    pdl_path: str
    model: str
    algorithm: str
    temperature: float
    particles: int
    num_tests: int
    retry: int

    def __hash__(self):
        return hash(
            (
                self.task,
                self.dataset,
                self.model,
                self.algorithm,
                self.temperature,
                self.particles,
                self.num_tests,
                self.retry,
            )
        )

    def __eq__(self, other):
        """Check equality by comparing all configuration parameters."""
        if not isinstance(other, Key):
            return NotImplemented
        return (
            self.task == other.task
            and self.dataset == other.dataset
            and self.model == other.model
            and self.algorithm == other.algorithm
            and self.temperature == other.temperature
            and self.particles == other.particles
            and self.num_tests == other.num_tests
            and self.retry == other.retry
        )


@dataclass
class TaskModel:
    """
    Simplified key for grouping experiments by task and model only.
    
    Used for generating summary tables that compare different algorithms
    for the same task-model combination.
    
    Attributes:
        task: Name of the benchmark task
        model: LLM model name/identifier
    """
    task: str
    model: str

    def __hash__(self):
        return hash((self.task, self.model))

    def __eq__(self, other):
        """Check equality by comparing task and model."""
        if not isinstance(other, TaskModel):
            return NotImplemented
        return self.task == other.task and self.model == other.model


def aggregate_experiments_by_config(
    experiments: list[Experiment],
) -> dict[Key, dict[str, Any]]:
    """
    Group experiments by configuration and compute aggregate statistics.
    
    Takes a list of experiment results and groups them by their configuration
    parameters (task, model, algorithm, etc.). For each unique configuration,
    computes statistical summaries across all runs with that configuration.
    
    Also prints warnings for incomplete experiments (missing tests or exceptions).
    
    Args:
        experiments: List of Experiment objects to aggregate
        
    Returns:
        Dictionary mapping each unique Key to a dict containing:
        - "experiments": Original list of all experiments
        - "stats": Computed statistics (mean, stdev) for various metrics
    """
    by_key: dict[Key, list[Experiment]] = {}
    
    # Group experiments by configuration key
    for run in experiments:
        cfg = run.config
        key: Key = Key(
            task=cfg.task,
            dataset=cfg.dataset,
            pdl_path=cfg.pdl_path,
            model=cfg.model,
            algorithm=cfg.algorithm,
            temperature=cfg.temperature,
            particles=cfg.particles,
            num_tests=cfg.num_tests,
            retry=cfg.retry,
        )
        runs = by_key.setdefault(key, [])
        runs.append(run)
        
        # Warn about incomplete or failed experiments
        if run.config.num_tests != run.result.total:
            print(
                f"% Warning {cfg.aggregated_results_path}: missing {run.config.num_tests - run.result.total} tests"
            )
        if len(run.result.exceptions) > 0:
            print(
                f"% Warning {cfg.aggregated_results_path}: {len(run.result.exceptions)} exceptions"
            )
    
    # Compute statistics for each configuration
    aggregated_experiments: dict[Key, dict[str, Any]] = {}
    for key, experiments_subset in by_key.items():
        runs = [exp.result for exp in experiments_subset]
        aggregated_experiments[key] = {
            "experiments": experiments,
            "stats": runs_stats(runs),
        }
    return aggregated_experiments


def sort_aggregated_experiments(
    aggregated_experiments: dict[Key, dict[str, Any]],
) -> list[tuple[Key, dict]]:
    """
    Sort aggregated experiments for consistent table ordering.
    
    Sorts by: task, retry, pdl_path, particles, temperature, model, algorithm.
    Algorithms are further sorted by type (maj, is, smc) using _sort_tag_algo.
    
    Args:
        aggregated_experiments: Dictionary of aggregated experiment data
        
    Returns:
        Sorted list of (Key, stats_dict) tuples
    """
    rows: list[tuple[Key, dict]] = list(aggregated_experiments.items())
    rows.sort(
        key=lambda r: (
            r[0].task,
            r[0].retry,
            r[0].pdl_path,
            r[0].particles,
            r[0].temperature,
            r[0].model,
            _sort_tag_algo(r[0].algorithm),
        )
    )
    return rows


def _sort_tag_algo(algo: str):
    """
    Create sort key for algorithms to ensure consistent ordering.
    
    Prefixes algorithms with numbers to control sort order:
    - "maj" (majority voting) algorithms first (0-)
    - "is" (importance sampling) algorithms second (1-)
    - "smc" (sequential Monte Carlo) algorithms third (2-)
    - Other algorithms last (no prefix)
    
    Args:
        algo: Algorithm name string
        
    Returns:
        Sort key string with numeric prefix
    """
    if algo.endswith("maj"):
        t = f"0-{algo}"
    elif algo.endswith("is"):
        t = f"1-{algo}"
    elif algo.endswith("smc"):
        t = f"2-{algo}"
    else:
        t = algo
    return t


def compute_stats(elements: list) -> tuple[float, float] | None:
    """
    Compute mean and standard deviation for a list of values.
    
    Handles edge cases:
    - Empty list: returns None
    - Single element: returns (value, 0.0) since no variance
    - Multiple elements: returns (mean, stdev)
    
    Args:
        elements: List of numeric values
        
    Returns:
        Tuple of (mean, stdev) or None if empty list
    """
    match len(elements):
        case 0:
            return None
        case 1:
            return elements[0], 0.0
    return (compute_mean(elements), compute_stdev(elements))


def runs_stats(runs: list[AggregatedResults]):
    """
    Compute statistics across multiple benchmark runs.
    
    Extracts various metrics from each run and computes mean/stdev:
    - success_expectation: Expected success rate from probabilistic inference
    - mode: Success rate of the most likely outcome
    - pass_at_1: Success rate of the first sample
    - pass_at_k: Success rate considering top-k samples
    - time: Average time per test case
    - model_calls: Average LLM API calls per test case
    - prompt_tokens: Average prompt tokens per test case
    - completion_tokens: Average completion tokens per test case
    
    Args:
        runs: List of AggregatedResults from multiple experiment runs
        
    Returns:
        Dictionary mapping metric names to (mean, stdev) tuples
    """
    success_expectation_list = [run.success_expectation for run in runs]
    mode_success_rate_list = [(run.mode.successes / run.total) for run in runs]
    pass_at_1_success_rate_list = [
        (run.pass_at_1.successes / run.total)
        for run in runs
        if run.pass_at_1 is not None
    ]
    pass_at_k_success_rate_list = [
        (run.pass_at_k.successes / run.total) for run in runs
    ]
    time_list = [run.total_time / run.total for run in runs]
    model_calls_list = [run.llm_usage.model_calls / run.total for run in runs]
    prompt_tokens_list = [run.llm_usage.prompt_tokens / run.total for run in runs]
    completion_tokens_list = [
        run.llm_usage.completion_tokens / run.total for run in runs
    ]
    return {
        "success_expectation": compute_stats(success_expectation_list),
        "mode": compute_stats(mode_success_rate_list),
        "pass_at_1": compute_stats(pass_at_1_success_rate_list),
        "pass_at_k": compute_stats(pass_at_k_success_rate_list),
        "time": compute_stats(time_list),
        "model_calls": compute_stats(model_calls_list),
        "prompt_tokens": compute_stats(prompt_tokens_list),
        "completion_tokens": compute_stats(completion_tokens_list),
    }


# --- LaTeX Table Generation --------------------------------------------------


def make_caption(experiments: list[Experiment]):
    """
    Generate a descriptive caption for a LaTeX table.
    
    Extracts common configuration parameters from experiments and formats
    them into a caption describing the benchmark, program, dataset, and
    experimental parameters.
    
    Assumes all experiments share the same task, dataset, pdl_path,
    temperature, particles, and num_tests (verified by assertion).
    
    Args:
        experiments: List of experiments to generate caption for
        
    Returns:
        LaTeX-formatted caption string
    """
    assert len(experiments) > 0
    experiment = experiments[0]
    config = experiment.config
    task = config.task
    dataset = config.dataset
    pdl_path = config.pdl_path
    temperature = config.temperature
    particles = config.particles
    num_tests = config.num_tests
    # Verify all experiments have matching configuration
    assert all(
        (
            exp.config.task == task
            and exp.config.dataset == dataset
            and exp.config.pdl_path == pdl_path
            and exp.config.temperature == temperature
            and exp.config.particles == particles
            and exp.config.num_tests == num_tests
            for exp in experiments
        )
    )
    return f"Results for the {task} benchmark (program: \\texttt{{{pdl_path}}}, data: \\texttt{{{dataset}}}) on {num_tests} samples with temperature {temperature} and {particles} particles."


def experiments_to_latex(
    experiments: list[Experiment],
    label: str = "tab:results",
    decimals_rate: int = 1,  # percent decimals for rate
    decimals_sd: int = 1,  # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    """
    Generate a full LaTeX table with all metrics.
    
    Creates a comprehensive table showing model, algorithm, and all performance
    metrics including mode, success expectation, pass@1, pass@k, LLM calls,
    token usage, and time.
    
    Args:
        experiments: List of experiments to include in table
        label: LaTeX label for cross-referencing
        decimals_rate: Decimal places for success rates (as percentages)
        decimals_sd: Decimal places for standard deviations
        decimals_stats: Decimal places for other statistics
        
    Returns:
        Complete LaTeX table as a string
    """
    caption = make_caption(experiments)
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)

    # Column specifications: l=left-aligned, r=right-aligned
    cols = ["l", "l", "r", "r", "r", "r", "r", "r", "r", "r"]
    header = [
        "model",
        "algo ",
        "mode",
        "E(succ)",
        "pass@1",
        "pass@k",
        "LLM calls",
        "prompt",
        "completion",
        "time",
    ]
    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\centering")
    lines.append(r"\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    # Generate table rows
    for k, v in agg_rows:
        row = [
            format_model(k.model),
            format_algorithm(k.algorithm),
            format_rate_stats(v["stats"]["mode"], decimals_rate, decimals_sd),
            format_rate_stats(
                v["stats"]["success_expectation"], decimals_rate, decimals_sd
            ),
            format_rate_stats(v["stats"]["pass_at_1"], decimals_rate, decimals_sd),
            format_rate_stats(v["stats"]["pass_at_k"], decimals_rate, decimals_sd),
            format_stats(v["stats"]["model_calls"], 1, decimals_sd),
            format_stats(v["stats"]["prompt_tokens"], decimals_stats, decimals_sd),
            format_stats(v["stats"]["completion_tokens"], decimals_stats, decimals_sd),
            format_time_stats(v["stats"]["time"], decimals_sd),
        ]
        lines.append(" & ".join(row) + r" \\")

    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}")
    lines.append(f"\\caption{{{_esc_latex(caption)}}}")
    lines.append(f"\\label{{{_esc_latex(label)}}}")
    lines.append(r"\end{table}")

    return "\n".join(lines)


def group_aggregated_experiments(
    agg: list[tuple[Key, dict[str, Any]]],
) -> dict[TaskModel, dict[str, Any]]:
    """
    Group experiments by task and model for summary tables.
    
    Reorganizes aggregated experiments to compare different algorithms
    for the same task-model combination. Extracts mode statistics for
    each algorithm and pass@1/pass@k from the parallel-maj baseline.
    
    Args:
        agg: List of (Key, stats_dict) tuples from aggregated experiments
        
    Returns:
        Dictionary mapping TaskModel to algorithm statistics
    """
    res: dict[TaskModel, dict[str, Any]] = {}
    for exp in agg:
        key, value = exp
        tm = TaskModel(task=key.task, model=key.model)
        d = res.setdefault(tm, {})
        d[key.algorithm] = value["stats"]["mode"]
        # Store pass@1 and pass@k from the majority voting baseline
        if key.algorithm == "parallel-maj":
            d["pass_at_1"] = value["stats"]["success_expectation"]
            d["pass_at_k"] = value["stats"]["pass_at_k"]
    return res


def get_max_array(data):
    """
    Create a binary array indicating which elements equal the maximum.
    
    Used to bold the best-performing algorithm in tables.
    
    Args:
        data: List of numeric values
        
    Returns:
        List of 1s and 0s, where 1 indicates the maximum value
    """
    max_val = max(data)
    return [1 if x == max_val else 0 for x in data]


def experiments_to_latex_total(
    experiments: list[Experiment],
    label: str = "tab:results",
    decimals_rate: int = 1,  # percent decimals for rate
    decimals_sd: int = 1,  # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    """
    Generate a compact summary table comparing algorithms.
    
    Creates a condensed table showing pass@1, three algorithm variants
    (maj, is, smc), and pass@k for each model. Groups results by task
    and bolds the best-performing algorithm for each model.
    
    Args:
        experiments: List of experiments to include in table
        label: LaTeX label for cross-referencing
        decimals_rate: Decimal places for success rates (as percentages)
        decimals_sd: Decimal places for standard deviations
        decimals_stats: Decimal places for other statistics (unused here)
        
    Returns:
        Complete LaTeX table as a string
    """
    caption = "Results for PPDL as an inference scaling framework"
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)
    agg_rows_grouped = group_aggregated_experiments(agg_rows)

    # Column specifications: c=center-aligned
    cols = ["c", "c", "c", "c", "c", "c"]
    header = ["model", "pass@1", "maj", "is", "smc", "pass@k"]

    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\setlength{\tabcolsep}{3pt}")
    lines.append(r"\centerline{\scriptsize\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    # Generate table rows, grouping by task
    prev_task = None
    for k, v in agg_rows_grouped.items():
        # Add task separator when task changes
        if prev_task != k.task:
            lines.append(r"\midrule")
            lines.append(r"{\bf " + k.task + " } & & & & & \\\\")
            lines.append(r"\midrule")
        prev_task = k.task
        
        # Determine which algorithm performed best for bolding
        bolds = get_max_array([v["parallel-maj"], v["parallel-is"], v["parallel-smc"]])
        row = [
            format_model(k.model),
            format_rate_stats(v["pass_at_1"], decimals_rate, decimals_sd),
            format_rate_stats(v["parallel-maj"], decimals_rate, decimals_sd, bolds[0]),
            format_rate_stats(v["parallel-is"], decimals_rate, decimals_sd, bolds[1]),
            format_rate_stats(v["parallel-smc"], decimals_rate, decimals_sd, bolds[2]),
            format_rate_stats(v["pass_at_k"], decimals_rate, decimals_sd),
        ]
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
    decimals_sd: int = 1,  # percent decimals for sd (shown in percentage points
    decimals_stats: int = 1,  # percent decimals for rate
) -> str:
    """
    Generate a compact LaTeX table with key metrics only.
    
    Similar to experiments_to_latex but omits pass@1, prompt tokens, and
    completion tokens to save space. Includes model separators between
    different models.
    
    Args:
        experiments: List of experiments to include in table
        label: LaTeX label for cross-referencing
        decimals_rate: Decimal places for success rates (as percentages)
        decimals_sd: Decimal places for standard deviations
        decimals_stats: Decimal places for other statistics
        
    Returns:
        Complete LaTeX table as a string
    """
    caption = make_caption(experiments)
    agg = aggregate_experiments_by_config(experiments)
    agg_rows = sort_aggregated_experiments(agg)

    # Column specifications
    cols = ["l", "l", "r", "r", "r", "r", "r"]
    header = ["model", "algo ", "mode", "E(succ)", "pass@k", "LLM calls", "time"]

    lines = []
    lines.append(r"\begin{table}[ht]")
    lines.append(r"\centering")
    lines.append(r"\begin{tabular}{" + "".join(cols) + r"}")
    lines.append(r"\toprule")
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    # Generate table rows with model separators
    prev_model = None
    for k, v in agg_rows:
        # Add separator line when model changes
        if prev_model is not None and prev_model != k.model:
            lines.append(r"\midrule")
        prev_model = k.model
        row = [
            format_model(k.model),
            format_algorithm(k.algorithm),
            format_rate_stats(v["stats"]["mode"], decimals_rate, decimals_sd),
            format_rate_stats(
                v["stats"]["success_expectation"], decimals_rate, decimals_sd
            ),
            format_rate_stats(v["stats"]["pass_at_k"], decimals_rate, decimals_sd),
            format_stats(v["stats"]["model_calls"], 1, decimals_sd),
            format_time_stats(v["stats"]["time"], decimals_sd),
        ]
        lines.append(" & ".join(row) + r" \\")

    lines.append(r"\bottomrule")
    lines.append(r"\end{tabular}")
    lines.append(f"\\caption{{{_esc_latex(caption)}}}")
    lines.append(f"\\label{{{_esc_latex(label)}}}")
    lines.append(r"\end{table}")

    return "\n".join(lines)


def format_rate_stats(stats, decimals_rate, decimals_sd, bold=False):
    """
    Format success rate statistics for LaTeX display.
    
    Converts rates to percentages and formats with standard deviation.
    Optionally bolds the rate for emphasis (e.g., best result).
    
    Args:
        stats: Tuple of (rate, stdev) or None
        decimals_rate: Decimal places for the rate percentage
        decimals_sd: Decimal places for the standard deviation
        bold: Whether to bold the rate value
        
    Returns:
        LaTeX-formatted string like "85.3% ± 2.1" or "-" if None
    """
    if stats is None:
        return "-"
    rate, sd = stats
    rate_str = f"{rate*100:.{decimals_rate}f}\\%"
    if bold:
        rate_str = "{\\bf " + rate_str + "}"
    sd_str = f"{sd*100:.{decimals_sd}f}"
    return rate_str + " {\\tiny $\\pm$ " + sd_str + "}\\"


def format_stats(stats, decimals_stats, decimals_sd):
    """
    Format general statistics (non-rate) for LaTeX display.
    
    Used for metrics like token counts and LLM calls. Formats large
    numbers with 'k' suffix (e.g., "1.5k" for 1500).
    
    Args:
        stats: Tuple of (mean, stdev) or None
        decimals_stats: Decimal places for the mean
        decimals_sd: Decimal places for the standard deviation
        
    Returns:
        LaTeX-formatted string like "1.5k ± 0.2k" or "-" if None
    """
    if stats is None:
        return "-"
    mean, sd = stats
    mean_str = format_number(mean, decimals_stats)
    sd_str = format_number(sd, decimals_sd)
    return f"{mean_str} $\\pm$ {sd_str}"


def format_time_stats(stats, decimals_sd):
    """
    Format time statistics for LaTeX display.
    
    Uses human-readable time format (HH:MM:SS or MM:SS or seconds)
    for the mean, and numeric format for standard deviation.
    
    Args:
        stats: Tuple of (mean_seconds, stdev_seconds) or None
        decimals_sd: Decimal places for the standard deviation
        
    Returns:
        LaTeX-formatted string like "02:35 ± 12.3" or "-" if None
    """
    if stats is None:
        return "-"
    mean, sd = stats
    mean_str = format_time(mean)
    sd_str = format_number(sd, decimals_sd)
    return f"{mean_str} $\\pm$ {sd_str}"


def format_number(number, decimals):
    """
    Format numbers with appropriate scale suffix.
    
    Numbers < 1000 are shown as-is.
    Numbers >= 1000 are shown in thousands with 'k' suffix.
    
    Args:
        number: Numeric value to format
        decimals: Decimal places to display
        
    Returns:
        Formatted string (e.g., "123.4" or "1.5k")
    """
    if abs(number) < 1000:
        return f"{number:.{decimals}f}"
    return f"{number / 1000:.{decimals}f}k"


def format_model(model: str):
    """
    Convert full model names to abbreviated forms for tables.
    
    Maps long model identifiers to short, consistent abbreviations
    suitable for table display. Prints a warning for unknown models.
    
    Args:
        model: Full model name/identifier
        
    Returns:
        Abbreviated model name (e.g., "gr4sm" for granite-4-h-small)
    """
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
    """
    Remove "parallel-" prefix from algorithm names for display.
    
    Args:
        algo: Algorithm name (e.g., "parallel-maj")
        
    Returns:
        Shortened name (e.g., "maj")
    """
    return algo.removeprefix("parallel-")


def format_time(seconds):
    """
    Format time duration in human-readable format.
    
    Formats as:
    - "HH:MM:SS" if >= 1 hour
    - "MM:SS" if >= 1 minute
    - "SS.S" (with decimal) if < 1 minute
    
    Args:
        seconds: Time duration in seconds
        
    Returns:
        Formatted time string
    """
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
    """
    Escape special LaTeX characters in strings.
    
    Converts characters that have special meaning in LaTeX to their
    escaped equivalents to prevent compilation errors.
    
    Args:
        s: String to escape (can be None)
        
    Returns:
        LaTeX-safe string with special characters escaped
    """
    if s is None:
        return ""
    return (
        str(s)
        .replace("_", r"\_")
        .replace("%", r"\%")
        .replace("&", r"\&")
        .replace("#", r"\#")
        .replace("$", r"\$")
    )


def files_to_latex(files):
    """
    Load experiment files and generate a LaTeX table.
    
    Reads JSON experiment result files, parses them into Experiment objects,
    and generates a summary LaTeX table using experiments_to_latex_total.
    
    Args:
        files: List of file paths to aggregated experiment result files
        
    Returns:
        LaTeX table string
    """
    experiments = []
    for file_name in files:
        print(f"% analyse: {file_name}")
        file_path = pathlib.Path(file_name)
        file_content = file_path.read_text(encoding="utf-8")
        experiment = Experiment.model_validate_json(file_content)
        experiments.append(experiment)
    latex = experiments_to_latex_total(experiments)
    return latex


def main():
    """
    Command-line entry point for the benchmark analyzer.
    
    Parses command-line arguments to get result file paths, processes them,
    and outputs a LaTeX table to stdout.
    
    Usage:
        python bench_analyzer.py result1.json result2.json ...
    """
    parser = argparse.ArgumentParser(
        description="Analyse benchmark results and generate LaTeX tables",
    )
    parser.add_argument("files", nargs="+", help="Aggregated results files to process.")
    args = parser.parse_args()
    latex = files_to_latex(args.files)
    print(latex)


if __name__ == "__main__":
    main()
