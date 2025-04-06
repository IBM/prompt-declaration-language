"""
A tool to lint PDL (Prompt Declaration Language) files.

This linter is designed to help projects with multiple PDL files detect errors at build time.

Configuration:
-------------
The linter can be configured through either `pyproject.toml` or `.pdl-lint` file in your project root.
The `pyproject.toml` configuration takes precedence over `.pdl-lint`.

Example configuration in pyproject.toml:
-------------------------------------
[tool.pdl-lint]
# List of paths to ignore (relative to project root)
ignore = ["tests/", "docs/", "examples/example.pdl"]

# Logging configuration
log_file = "pdl-lint.log"  # Path to log file (optional)
file_log_level = "DEBUG"   # Log level for file: CRITICAL, FATAL, ERROR, WARNING, WARN, INFO, DEBUG, NOTSET
file_log_format = "%(asctime)s %(name)s: %(message)s"  # Format for file logging

# Console logging configuration
console_log_enabled = true  # Whether to log to console
console_log_level = "INFO"  # Log level for console
console_log_format = "%(message)s"  # Format for console logging

# Debug mode
debug = false  # Enable debug-level logging by default

Usage:
------
1. Command Line:
   $ pdl-lint [options] [path...]

   Options:
   -r, --recursive    Lint all PDL files in the directory recursively
   --debug            Enable debug logging
   --no-debug         Disable debug logging
   -l, --log-file     Specify log file path

2. As a Python Module:
   from pdl.pdl_linter import run_linter
   exit_code = run_linter()

Features:
---------
- Automatic project root detection based on common indicators (.git, .hg, pyproject.toml, etc.)
- Configurable file and directory ignore patterns
- Flexible logging configuration for both file and console output
- Support for recursive directory scanning
- Graceful handling of configuration errors
- Detailed error reporting with file locations

The linter will:
- Skip files not ending in .pdl
- Ignore files and directories specified in the configuration
- Report syntax errors and other issues in PDL files
- Provide detailed logging of the linting process

Exit Codes:
----------
0 - All files linted successfully
1 - One or more files failed linting
"""

import argparse
import logging
import sys
import tomllib
from pathlib import Path
from typing import Any, List, Literal, Self

from pydantic import BaseModel, ConfigDict, Field

from pdl.pdl_parser import PDLParseError
from pdl.pdl_parser import parse_file as parse_pdl_file

logger = logging.getLogger(__name__)


def _guess_project_root_dir(start_path: Path = Path.cwd()) -> Path | None:
    """
    Guess the project root directory starting from the current working directory.

    Returns:
        The project root directory or None if the current working directory couldn't be
        determined to be part of a project.
    """
    path = start_path
    path = path.absolute()

    def is_fs_root(path: Path) -> bool:
        return path == path.parent

    # For cases where a weak indicator is found, we will append the path to this list
    # and pick the last path because it is more likely to be the project root.
    project_root_candidates = []
    while not is_fs_root(path):
        match path:
            case path if path.joinpath(".git").is_dir():
                # .git directory is a strong indicator of a project's root directory
                # NOTE: Git submodules only have a .git file in its top-level directory
                return path
            case path if path.joinpath(".hg").is_dir():
                # .hg directory is a good indicator of a project's root directory
                # NOTE: Mercurial sub-repositories will not interfere
                return path
            case path if path.joinpath("pyproject.toml").is_file():
                # The existence of a pyproject.toml file is a good indicator.
                # However, in a setting where there are multiple 'workspace members' or namespace packages,
                # there will be a pyproject.toml or setup.py file in every namespace package's root directory.
                # See:
                # - https://packaging.python.org/en/latest/guides/packaging-namespace-packages/
                # - https://docs.astral.sh/uv/concepts/projects/workspaces/
                project_root_candidates.append(path)
            case path if path.joinpath("requirements.txt").is_file():
                # The existence of a requirements.txt file is a good indicator because
                # it is a common way to manage dependencies for Python projects.
                # However, there is a chance that the requirements.txt file is not in the project root.
                project_root_candidates.append(path)
            case path if path.joinpath("setup.py").is_file():
                # The existence of a setup.py file is a good indicator.
                # However, in a setting where there are multiple 'workspace members' or namespace packages,
                # there will be a pyproject.toml or setup.py file in every namespace package's root directory.
                # See:
                # - https://packaging.python.org/en/latest/guides/packaging-namespace-packages/
                # - https://docs.astral.sh/uv/concepts/projects/workspaces/
                project_root_candidates.append(path)
            case _:
                pass
        # If no strong indicator is found, move up one level.
        path = path.parent

    # If no strong indicator is found, return the last candidate.
    return project_root_candidates[-1] if project_root_candidates else None


LogLevelLiteral = Literal[
    "CRITICAL",
    "FATAL",
    "ERROR",
    "WARNING",
    "WARN",
    "INFO",
    "DEBUG",
    "NOTSET",
]


class LinterConfig(BaseModel):
    """
    Configuration for the PDL linter.
    """

    project_root: Path = Field(exclude=True)
    """
    The root directory of the project.
    """

    ignore: set[Path] = Field(default_factory=set)
    """
    A list of paths to ignore.
    """

    log_file: Path | None = Field(default=None)
    """
    The file to log to.
    """

    file_log_level: LogLevelLiteral = Field(default="DEBUG")
    """
    The level for logging to a file.
    """

    file_log_format: str = Field(default="%(asctime)s %(name)s: %(message)s")
    """
    The format for logging to a file.
    """

    console_log_enabled: bool = Field(default=True)
    """
    Whether to log to the console.
    """

    console_log_level: LogLevelLiteral = Field(default="INFO")
    """
    The level for logging to the console.
    """

    console_log_format: str = Field(default="%(message)s")
    """
    The format for logging to the console.
    """

    debug: bool = Field(default=False)
    """
    Whether to enable debug-level logging by default.
    """

    model_config = ConfigDict(extra="allow")
    """
    Allow extra fields in the configuration. We shouldn't have to fail a build if extra fields are present.
    Instead, we will notify the user about the extra fields that have no effect on the linter.
    """

    directories_to_ignore: set[Path] = Field(exclude=True, default_factory=set)
    """
    A list of directories to ignore.
    """

    def model_post_init(self, __context: Any) -> None:
        """
        Post-initialize the model.
        """
        valid_paths_to_ignore = set()
        for path in self.ignore:
            if path.is_absolute():
                logger.warning(
                    "⚠️  Ignoring path '%s' because it is an absolute path."
                    " Use a relative path instead.",
                    path,
                )
                continue

            absolute_path = self.project_root / path
            if not absolute_path.exists():
                logger.warning(
                    "⚠️  Ignoring path '%s' because it does not exist.",
                    path,
                )
                continue

            valid_paths_to_ignore.add(path)

            if absolute_path.is_dir():
                self.directories_to_ignore.add(path)

        self.ignore = valid_paths_to_ignore

    def should_ignore(self, path: Path) -> bool:
        """
        Check if a path should be ignored.
        """
        logger.debug("Checking if %s should be ignored.", path)
        match path:
            case path if not path.absolute().is_relative_to(self.project_root):
                logger.debug(" ⏩  Not within the project root %s.", self.project_root)
                return True

            case path if path.is_file() and path.suffix != ".pdl":
                logger.debug(" ⏩  Not a *.pdl file.")
                return True

            case path if path in self.ignore:
                logger.debug(" ⏩  In the ignore list.")
                return True

            case path if any(
                path.is_relative_to(d) for d in self.directories_to_ignore
            ):
                logger.debug(" ⏩  In a directory marked to be ignored.")
                return True

            case _:
                logger.debug(" ✅  Good to lint.")
                return False

    @classmethod
    def load(cls) -> Self:
        """
        Load the linter configuration from pyproject.toml or .pdl-lint.

        Preference will be given to the pyproject.toml file if it contains a [tool.pdl-lint] section.
        The .pdl-lint file will only be used when either the pyproject.toml file is not found,
        or when the pyproject.toml file doesn't have a [tool.pdl-lint] section.
        """
        project_root_dir = _guess_project_root_dir() or Path.cwd()
        pyproject_path = project_root_dir / "pyproject.toml"
        pdl_lint_path = project_root_dir / ".pdl-lint"

        config_data: dict[str, Any] = {}
        config_source: Path | None = None

        # Try pyproject.toml first
        if pyproject_path.is_file():
            try:
                toml_data = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))
                if "tool" in toml_data and "pdl-lint" in toml_data["tool"]:
                    config_data = toml_data["tool"]["pdl-lint"]
                    config_source = pyproject_path
                    logger.debug(
                        "Loading config from %s [tool.pdl-lint]", config_source
                    )
            except tomllib.TOMLDecodeError as e:
                logger.warning(
                    "⚠️  Error reading %s: %s. Skipping.",
                    pyproject_path,
                    e,
                )
            except Exception as e:
                logger.warning(
                    "⚠️  Unexpected error processing %s: %s. Skipping.",
                    pyproject_path,
                    e,
                )

        # If no config found in pyproject.toml, try .pdl-lint
        if not config_source and pdl_lint_path.is_file():
            try:
                toml_data = tomllib.loads(pdl_lint_path.read_text(encoding="utf-8"))
                # .pdl-lint can have the config at the root or under [pdl-lint]
                if "pdl-lint" in toml_data:
                    config_data = toml_data["pdl-lint"]
                elif all(
                    k not in ["tool", "project", "build-system"] for k in toml_data
                ):
                    # Assume root level config if no standard sections are present
                    config_data = toml_data
                config_source = pdl_lint_path
                logger.debug("Loading config from %s", config_source)
            except tomllib.TOMLDecodeError as e:
                logger.warning(
                    "⚠️  Error reading %s: %s. Skipping.",
                    pdl_lint_path,
                    e,
                )
            except Exception as e:
                logger.warning(
                    "⚠️  Unexpected error processing %s: %s. Skipping.",
                    pdl_lint_path,
                    e,
                )

        if not config_source:
            logger.warning(
                "⚠️  No PDL linter configuration file found or section usable in %s."
                " Using default configuration.",
                project_root_dir,
            )

        linter_config = cls.model_validate(
            {"project_root": project_root_dir, **config_data}
        )

        if linter_config.model_extra and config_source:
            logger.warning(
                "⚠️  Unrecognized fields for pdl-lint configuration in %s."
                " These fields will be ignored:",
                config_source,
            )
            for key, value in linter_config.model_extra.items():
                logger.warning("  %s = %s", key, repr(value))
            logger.warning("")  # Add a blank line for readability

        return linter_config


def _lint_pdl_file(file_path: Path, config: LinterConfig) -> bool:
    """
    Lint a PDL file.
    """
    if config.should_ignore(file_path):
        logger.info(" - ℹ️  SKIPPING %s (in ignore list)", file_path)
        return True

    try:
        _, _ = parse_pdl_file(file_path)
        logger.info(" - ✅  %s", file_path)
        return True
    except PDLParseError as e:
        logger.error(" - ❌  %s", file_path)
        logger.error("     %s: %s", type(e).__name__, e.message)
        return False
    except Exception:
        logger.exception(" - ❌  %s", file_path)
        return False


def _lint_pdl_files_in_directory(
    directory: Path, recursive: bool, config: LinterConfig
) -> List[Path]:
    """
    Lint all PDL files in a directory.

    Args:
        directory: The directory containing the PDL files to lint.
        recursive: Whether to lint the PDL files in the directory recursively.
        config: The configuration for the linter.
    Returns:
        A list of files that failed linting.

    Raises:
        NotADirectoryError: If the given path is not a directory.
    """

    if not directory.is_dir():
        raise NotADirectoryError(f"'{directory}' is not a directory")

    # Convert the directory to a path relative to the project root.
    # NOTE: The directory is made absolute to avoid issues with resolving relative paths.
    absolute_path = directory.absolute()
    relative_path = absolute_path.relative_to(config.project_root)
    if config.should_ignore(relative_path):
        logger.info(
            " - ℹ️  SKIPPING all files in %s because it is in the ignore list.",
            absolute_path,
        )
        return []

    pdl_files = list(
        pdl
        for pdl in (
            relative_path.rglob("*.pdl") if recursive else relative_path.glob("*.pdl")
        )
        if pdl.is_file()
    )

    if len(pdl_files) == 0:
        logger.warning("No PDL files found in %s", absolute_path)
        return []

    logger.info(
        "Linting %d PDL files in %s %s...",
        len(pdl_files),
        absolute_path,
        "(recursively)" if recursive else "",
    )

    failed_files = []

    for file in pdl_files:
        if not _lint_pdl_file(file, config):
            failed_files.append(file)

    return failed_files


def _arg_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help=(
            "Lint all PDL files in the directory recursively. "
            "NOTE: This is only applicable when linting for files in a directory."
        ),
        required=False,
        default=False,
    )

    debug_flag = parser.add_mutually_exclusive_group(
        required=False,
    )
    debug_flag.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging.",
        dest="debug",
        default=False,
    )
    debug_flag.add_argument(
        "--no-debug",
        action="store_false",
        help="Disable debug logging.",
        dest="debug",
        default=True,
    )

    parser.add_argument(
        "-l",
        "--log-file",
        type=Path,
        help="The file to log to.",
        default=None,
    )

    parser.add_argument(
        "paths",
        type=Path,
        help="The path(s) to lint.",
        nargs="*",  # Allow zero or more paths
        default=[Path.cwd()],  # Default to cwd if no paths provided
    )

    return parser


def _setup_logging(args: argparse.Namespace, config: LinterConfig):
    """
    Setup logging for the linter.
    """
    log_file = args.log_file or config.log_file
    if log_file is not None:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(logging.Formatter(config.file_log_format))
        file_handler.setLevel(logging.DEBUG if args.debug else config.file_log_level)
        logger.addHandler(file_handler)

    if config.console_log_enabled:
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(logging.Formatter(config.console_log_format))
        stream_handler.setLevel(
            logging.DEBUG if args.debug else config.console_log_level
        )
        logger.addHandler(stream_handler)

    is_debug = args.debug or config.debug
    if is_debug:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)


def run_linter() -> int:
    """
    Run the PDL linter with the given arguments.

    Returns:
        The exit code of the linter.
    """
    config = LinterConfig.load()

    parser = _arg_parser()
    args = parser.parse_args()

    _setup_logging(args, config)
    logger.debug("Project root: %s", config.project_root)
    logger.debug("Linter config: %s", config.model_dump_json(indent=2))

    files_that_failed_linting = []

    logger.debug("Paths to lint: %s", args.paths)

    for path in args.paths:
        match path:
            case Path() as file if file.is_file():
                if not _lint_pdl_file(file, config):
                    files_that_failed_linting.append(file)
            case Path() as directory if directory.is_dir():
                files_that_failed_linting.extend(
                    _lint_pdl_files_in_directory(directory, args.recursive, config)
                )
            case _:
                logger.error(
                    "‼️  Error: %s is not a PDL file or directory. SKIPPING...",
                    path,
                )

    logger.info("-" * 100)
    if not files_that_failed_linting:
        logger.info("🎉  All files linted successfully 🎉")
        return 0

    logger.error(
        "😮  Linting failed for %d file(s):",
        len(files_that_failed_linting),
    )
    for file in files_that_failed_linting:
        logger.error(" - %s", file)
    return 1


if __name__ == "__main__":
    sys.exit(run_linter())
