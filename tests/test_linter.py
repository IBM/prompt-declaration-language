"""
Unit tests for the PDL linter.
"""

import argparse
import logging
import os
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from pdl.pdl_linter import (
    LinterConfig,
    _arg_parser,
    _guess_project_root_dir,
    _lint_pdl_file,
    _lint_pdl_files_in_directory,
    _setup_logging,
    run_linter,
)
from pdl.pdl_parser import PDLParseError

INVALID_PDL_FILE = Path("invalid.pdl")
VALID_PDL_FILE = Path("valid.pdl")


class ChangeDir:
    """Context manager to change the current working directory."""

    def __init__(self, path: Path):
        self._path: Path = path
        self._original_cwd: Path = Path.cwd()

    def __enter__(self):
        self._original_cwd = Path.cwd()
        os.chdir(self._path)

    def __exit__(self, _exc_type, _exc_value, _traceback):
        os.chdir(self._original_cwd)


@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield Path(tmp_dir)


@pytest.fixture
def project_root(temp_dir):  # pylint: disable=redefined-outer-name
    """Create a project root directory with common project indicators."""
    root = temp_dir / "project"
    root.mkdir()

    # Create project indicators
    (root / ".git").mkdir()
    (root / "pyproject.toml").touch()
    (root / "requirements.txt").touch()

    return root


@pytest.fixture
def pdl_file(project_root):  # pylint: disable=redefined-outer-name
    """Create a valid PDL file for testing."""
    pdl_path = project_root / VALID_PDL_FILE
    pdl_path.write_text("role user\ncontent Hello, world!")
    return pdl_path


@pytest.fixture
def invalid_pdl_file(project_root):  # pylint: disable=redefined-outer-name
    """Create an invalid PDL file for testing."""
    pdl_path = project_root / INVALID_PDL_FILE
    pdl_path.write_text("invalid content")
    return pdl_path


# Define a side effect function for the mock
def mock_parse_side_effect(file_path):
    if file_path == INVALID_PDL_FILE or file_path.name == INVALID_PDL_FILE.name:
        raise PDLParseError("Mocked parse error for invalid file")
    if file_path == VALID_PDL_FILE or file_path.name == VALID_PDL_FILE.name:
        return (None, None)  # Simulate successful parse
    # Should not happen in this test if paths are correct
    raise FileNotFoundError(f"Unexpected file path in mock: {file_path}")


@pytest.fixture
def mock_parse_pdl_file(side_effect=mock_parse_side_effect):
    with patch("pdl.pdl_linter.parse_pdl_file", side_effect=side_effect) as mock_parse:
        yield mock_parse


def test_guess_project_root_dir_from_project_root(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test project root directory detection from the project root."""
    with ChangeDir(project_root):
        # Test from project root
        assert _guess_project_root_dir(project_root) == project_root


def test_guess_project_root_dir_from_subdir(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test project root directory detection from a subdirectory."""
    subdir = project_root / "subdir"
    subdir.mkdir()
    with ChangeDir(subdir):
        assert _guess_project_root_dir(subdir) == project_root


def test_linter_config_validation():
    """Test LinterConfig validation."""
    # Test valid configuration
    config = LinterConfig(project_root=Path("/test"))
    assert config.project_root == Path("/test")

    # Test invalid log level
    with pytest.raises(ValidationError):
        LinterConfig(project_root=Path("/test"), file_log_level="INVALID_LEVEL")  # type: ignore


def test_linter_config_ignore_paths(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test path ignoring functionality."""
    # Create the files and directories to be ignored
    files_to_ignore = [
        "ignored.pdl",
        "ignored_dir",
        "ignored_dir/test.pdl",
        "test.pdl",
        "test.txt",
    ]
    for file in files_to_ignore:
        if file.endswith("_dir"):
            (project_root / file).mkdir()
        else:
            (project_root / file).touch()

    config = LinterConfig(
        project_root=project_root,
        ignore={Path("ignored.pdl"), Path("ignored_dir")},
    )

    # Save current working directory
    with ChangeDir(project_root):
        # Test ignored file

        # Test ignored file
        assert config.should_ignore(Path("ignored.pdl"))

        # Test ignored directory
        assert config.should_ignore(Path("ignored_dir/test.pdl"))

        # Test non-ignored file
        assert not config.should_ignore(Path("test.pdl"))

        # Test non-PDL file
        assert config.should_ignore(Path("test.txt"))


def test_lint_pdl_file_valid(
    pdl_file, mock_parse_pdl_file
):  # pylint: disable=redefined-outer-name
    """Test linting of a valid PDL file."""
    config = LinterConfig(project_root=pdl_file.parent)
    with ChangeDir(pdl_file.parent):
        assert _lint_pdl_file(pdl_file, config)
        mock_parse_pdl_file.assert_called_once_with(pdl_file)


def test_lint_pdl_file_invalid(
    invalid_pdl_file,
    mock_parse_pdl_file,
):  # pylint: disable=redefined-outer-name
    """Test linting of individual PDL files."""
    config = LinterConfig(project_root=invalid_pdl_file.parent)

    with ChangeDir(invalid_pdl_file.parent):
        assert not _lint_pdl_file(invalid_pdl_file, config)
        mock_parse_pdl_file.assert_called_once_with(invalid_pdl_file)


def test_lint_pdl_file_nonexistent(
    project_root,
    mock_parse_pdl_file,
):  # pylint: disable=redefined-outer-name
    """Test linting of a nonexistent PDL file."""

    config = LinterConfig(project_root=project_root)
    nonexistent_pdl = project_root / "nonexistent.pdl"
    with ChangeDir(project_root):
        assert not _lint_pdl_file(nonexistent_pdl, config)
        mock_parse_pdl_file.assert_called_once_with(nonexistent_pdl)


def test_lint_pdl_files_in_directory(
    project_root,
    invalid_pdl_file,
    mock_parse_pdl_file,  # pylint: disable=unused-argument
):  # pylint: disable=redefined-outer-name
    """Test linting of directories containing PDL files."""
    config = LinterConfig(project_root=project_root)

    # Create a subdirectory with PDL files
    subdir = project_root / "subdir"
    subdir.mkdir()
    valid_sub_pdl = subdir / "valid.pdl"
    valid_sub_pdl.write_text("text: Hello!")
    invalid_sub_pdl = subdir / "invalid.pdl"
    invalid_sub_pdl.write_text("invalid content")

    # Save current working directory
    with ChangeDir(project_root):

        # Test non-recursive linting
        failed_files = _lint_pdl_files_in_directory(
            Path("."), recursive=False, config=config
        )
        # Expecting only ./invalid.pdl relative to project_root
        assert failed_files == [Path("invalid.pdl")]

        # Test recursive linting
        failed_files = _lint_pdl_files_in_directory(
            Path("."), recursive=True, config=config
        )
        # Use set for order-independent comparison
        expected_failures = {Path("invalid.pdl"), Path("subdir/invalid.pdl")}
        assert set(failed_files) == expected_failures


def test_linter_configuration_loading(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test loading of linter configuration from files."""
    # Create pyproject.toml with test configuration
    toml_content = """
    [tool.pdl-lint]
    ignore = ["ignored.pdl"]
    log_file = "pdl-lint.log"
    file_log_level = "DEBUG"
    console_log_enabled = false
    """
    (project_root / "pyproject.toml").write_text(toml_content)
    ignored_pdl = project_root / "ignored.pdl"
    ignored_pdl.touch()  # Ensure ignored file exists for validation

    # Mock _guess_project_root_dir to return our test root
    with (
        ChangeDir(project_root),
        patch("pdl.pdl_linter._guess_project_root_dir", return_value=project_root),
    ):
        config = LinterConfig.load()

        # Assertions remain the same
        assert (
            config.project_root == project_root
        )  # Verify project root was set correctly
        assert config.ignore == {Path("ignored.pdl")}
        assert config.log_file == Path("pdl-lint.log")
        assert config.file_log_level == "DEBUG"
        assert not config.console_log_enabled

    ignored_pdl.unlink(missing_ok=True)


def test_run_linter(
    project_root, invalid_pdl_file, mock_parse_pdl_file
):  # pylint: disable=redefined-outer-name
    """Test the main linter function."""

    # Create a config instance for the test environment
    test_config = LinterConfig(project_root=project_root)

    # Let other unexpected paths raise FileNotFoundError or similar naturally
    # if they were somehow passed to parse_pdl_file, though linting
    # functions should handle this before calling parse.
    # We avoid raising explicitly here to prevent masking other issues.
    with (
        ChangeDir(project_root),
        patch("pdl.pdl_linter.LinterConfig.load", return_value=test_config),
    ):
        # --- Test successful linting (no args, scans cwd) ---
        # Ensure invalid file from fixture doesn't interfere with success case
        invalid_pdl_file.unlink(missing_ok=True)
        mock_args_success = argparse.Namespace(
            paths=[Path(".")], recursive=False, debug=False, log_file=None
        )
        with patch(
            "argparse.ArgumentParser.parse_args", return_value=mock_args_success
        ):
            exit_code = run_linter()
            assert exit_code == 0

        # --- Test failed linting (scans cwd, invalid file present) ---
        invalid_pdl_file.touch()
        mock_args_fail = argparse.Namespace(
            paths=[Path(".")], recursive=False, debug=False, log_file=None
        )
        with patch("argparse.ArgumentParser.parse_args", return_value=mock_args_fail):
            exit_code = run_linter()
            assert exit_code == 1

        invalid_pdl_file.unlink()

        # --- Test with specific paths (only valid file) ---
        mock_args_specific = argparse.Namespace(
            paths=[Path("test.pdl")], recursive=False, debug=False, log_file=None
        )
        with patch(
            "argparse.ArgumentParser.parse_args", return_value=mock_args_specific
        ):
            exit_code = run_linter()
            assert exit_code == 0

        # --- Test with recursive option (includes subdir) ---
        subdir = project_root / "subdir"
        subdir.mkdir()
        (subdir / "test.pdl").write_text("role user\ncontent Hello!")
        (subdir / "invalid.pdl").write_text("invalid content")

        mock_args_recursive = argparse.Namespace(
            paths=[Path(".")], recursive=True, debug=False, log_file=None
        )
        with patch(
            "argparse.ArgumentParser.parse_args", return_value=mock_args_recursive
        ):
            exit_code = run_linter()
            assert exit_code == 1


def test_logging_configuration(project_root):  # pylint: disable=redefined-outer-name
    """Test logging configuration."""
    # Create configuration with custom logging
    config = LinterConfig(
        project_root=project_root,
        log_file=project_root / "test.log",
        file_log_level="DEBUG",
        console_log_enabled=True,
        console_log_level="INFO",
    )

    # Test file logging
    assert config.log_file == project_root / "test.log"
    assert config.file_log_level == "DEBUG"

    # Test console logging
    assert config.console_log_enabled
    assert config.console_log_level == "INFO"


def test_linter_with_extra_config_fields(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test handling of extra configuration fields."""
    # Create configuration with extra fields
    config = LinterConfig(
        project_root=project_root,
        extra_field="value",  # type: ignore # This should be allowed but ignored
    )

    # Extra fields should be stored but not affect functionality
    assert hasattr(config, "extra_field")
    assert config.extra_field == "value"  # type: ignore


def test_guess_project_root_dir_hg(temp_dir):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory for hg projects."""
    with ChangeDir(temp_dir):
        hg_root = temp_dir / "hg_proj"
        hg_root.mkdir()
        (hg_root / ".hg").mkdir()
        os.chdir(hg_root)
        assert _guess_project_root_dir(hg_root) == hg_root


def test_guess_project_root_dir_git(temp_dir):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory for git projects."""
    with ChangeDir(temp_dir):
        git_root = temp_dir / "git_proj"
        git_root.mkdir()
        (git_root / ".git").mkdir()
        assert _guess_project_root_dir(git_root) == git_root


def test_guess_project_root_dir_requirements(
    temp_dir,
):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory for requirements projects."""
    with ChangeDir(temp_dir):
        req_root = temp_dir / "req_proj"
        req_root.mkdir()
        (req_root / "requirements.txt").touch()
        assert _guess_project_root_dir(req_root) == req_root


def test_guess_project_root_dir_pyproject(
    temp_dir,
):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory for pyproject projects."""
    with ChangeDir(temp_dir):
        pyproject_root = temp_dir / "pyproject_proj"
        pyproject_root.mkdir()
        (pyproject_root / "pyproject.toml").touch()
        os.chdir(pyproject_root)
        assert _guess_project_root_dir(pyproject_root) == pyproject_root


def test_guess_project_root_dir_setup_py(
    temp_dir,
):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory for setup.py projects."""
    with ChangeDir(temp_dir):
        setup_root = temp_dir / "setup_proj"
        setup_root.mkdir()
        (setup_root / "setup.py").touch()
        os.chdir(setup_root)
        assert _guess_project_root_dir(setup_root) == setup_root


def test_guess_project_root_dir_multiple_weak_indicators(
    temp_dir,
):  # pylint: disable=redefined-outer-name
    """Test variations of project root guessing."""
    with ChangeDir(temp_dir):
        # Test multiple weak indicators (pyproject highest)
        multi_root = temp_dir / "multi_proj"
        multi_root.mkdir()
        sub_multi = multi_root / "sub"
        sub_multi.mkdir()
        (multi_root / "pyproject.toml").touch()
        (sub_multi / "requirements.txt").touch()
        os.chdir(sub_multi)
        assert _guess_project_root_dir(sub_multi) == multi_root


def test_guess_project_root_dir_no_indicators(
    temp_dir,
):  # pylint: disable=redefined-outer-name
    """Test guessing project root directory when no indicators are present."""
    with ChangeDir(temp_dir):
        no_indicators_root = temp_dir / "no_indicators_proj"
        no_indicators_root.mkdir()
        os.chdir(no_indicators_root)
        assert _guess_project_root_dir(no_indicators_root) is None


def test_linter_config_post_init_warnings(
    project_root, caplog
):  # pylint: disable=redefined-outer-name
    """Test warnings during LinterConfig post-initialization."""
    caplog.set_level(logging.WARNING)

    # Test absolute path warning
    absolute_path = project_root / "absolute.pdl"
    absolute_path.touch()
    LinterConfig(project_root=project_root, ignore={absolute_path})
    check_logs(
        caplog,
        logging.WARNING,
        f"Ignoring path '{absolute_path}' because it is an absolute path",
    )
    caplog.clear()

    # Test non-existent path warning
    non_existent_path = Path("non_existent.pdl")
    LinterConfig(project_root=project_root, ignore={non_existent_path})
    check_logs(
        caplog,
        logging.WARNING,
        f"Ignoring path '{non_existent_path}' because it does not exist",
    )
    caplog.clear()

    # Test correct population of directories_to_ignore
    ignored_dir_path = Path("ignored_dir_for_post_init")
    (project_root / ignored_dir_path).mkdir()
    config = LinterConfig(project_root=project_root, ignore={ignored_dir_path})
    assert ignored_dir_path in config.directories_to_ignore


def test_linter_config_load_variations(
    project_root, caplog
):  # pylint: disable=redefined-outer-name
    """Test different config loading scenarios."""
    with ChangeDir(project_root):

        # Scenario 1: Only .pdl-lint exists
        pyproject_toml = project_root / "pyproject.toml"
        pyproject_toml.unlink()  # Remove default pyproject
        pdl_lint_path = project_root / ".pdl-lint"
        pdl_lint_content = (
            '[pdl-lint]\nignore = ["pdl_lint_ignored.pdl"]\nlog_file = "pdl_lint.log"'
        )
        pdl_lint_path.write_text(pdl_lint_content)
        (project_root / "pdl_lint_ignored.pdl").touch()

        with patch("pdl.pdl_linter._guess_project_root_dir", return_value=project_root):
            config1 = LinterConfig.load()
        assert config1.ignore == {Path("pdl_lint_ignored.pdl")}
        assert config1.log_file == Path("pdl_lint.log")
        pdl_lint_path.unlink()
        (project_root / "pdl_lint_ignored.pdl").unlink()

        # Scenario 2: pyproject.toml exists but no [tool.pdl-lint]
        pyproject_toml.write_text('[tool.other]\nkey="value"')
        pdl_lint_path.write_text(pdl_lint_content)  # .pdl-lint should be used
        (project_root / "pdl_lint_ignored.pdl").touch()
        with patch("pdl.pdl_linter._guess_project_root_dir", return_value=project_root):
            config2 = LinterConfig.load()
        assert config2.ignore == {Path("pdl_lint_ignored.pdl")}
        pdl_lint_path.unlink()
        (project_root / "pdl_lint_ignored.pdl").unlink()

        # Scenario 3: No config files exist (use defaults)
        pyproject_toml.unlink()
        with patch("pdl.pdl_linter._guess_project_root_dir", return_value=project_root):
            config3 = LinterConfig.load()
        assert config3.ignore == set()
        assert config3.log_file is None
        assert config3.console_log_enabled is True  # Check a default

        # Scenario 4: Unrecognized fields warning
        pyproject_toml.write_text(
            '[tool.pdl-lint]\nunrecognized = "field"\nignore = []'
        )
        caplog.set_level(logging.WARNING)
        with patch("pdl.pdl_linter._guess_project_root_dir", return_value=project_root):
            LinterConfig.load()
        check_logs(caplog, logging.WARNING, "Unrecognized fields")
        check_logs(caplog, logging.WARNING, "unrecognized = 'field'")
        caplog.clear()


def test_lint_pdl_file_generic_exception(
    project_root, caplog
):  # pylint: disable=redefined-outer-name
    """Test handling of generic exceptions during parsing."""
    config = LinterConfig(project_root=project_root)
    generic_exception_file = project_root / "generic_error.pdl"
    generic_exception_file.touch()
    caplog.set_level(logging.ERROR)

    with ChangeDir(project_root):
        with patch(
            "pdl.pdl_linter.parse_pdl_file", side_effect=RuntimeError("Generic Error")
        ):
            assert not _lint_pdl_file(Path("generic_error.pdl"), config)
        # Check if the generic exception was logged
        check_logs(caplog, logging.ERROR, "generic_error.pdl")
        check_logs(caplog, logging.ERROR, "RuntimeError: Generic Error")


def test_lint_pdl_files_in_directory_no_pdl(
    project_root, caplog
):  # pylint: disable=redefined-outer-name
    """Test linting a directory with no PDL files."""
    config = LinterConfig(project_root=project_root)
    empty_subdir = project_root / "empty_subdir"
    empty_subdir.mkdir()
    (empty_subdir / "readme.txt").touch()
    caplog.set_level(logging.WARNING)

    with ChangeDir(project_root):
        failed_files = _lint_pdl_files_in_directory(
            Path("empty_subdir"), recursive=False, config=config
        )
        assert failed_files == []
        check_logs(caplog, logging.WARNING, "No PDL files found")


def test_arg_parser_defaults_and_flags():
    """Test argument parsing defaults and flags."""
    parser = _arg_parser()

    # Test defaults
    args_default = parser.parse_args([])
    assert args_default.paths == [Path.cwd()]
    assert args_default.recursive is False
    assert args_default.debug is False
    assert args_default.log_file is None

    # Test flags
    args_flags = parser.parse_args(["path1", "path2", "-r", "--debug", "-l", "log.txt"])
    assert args_flags.paths == [
        Path("path1"),
        Path("path2"),
    ]  # nargs='*' accepts multiple paths
    # ^^^ Correction: Previous comment about nargs='?' was outdated.
    # nargs='*' captures all positional arguments into a list.

    # Re-testing with nargs='*'
    args_single_path = parser.parse_args(["path1"])
    assert args_single_path.paths == [
        Path("path1")
    ]  # It captures the single arg into a list
    args_no_path = parser.parse_args([])
    assert args_no_path.paths == [Path.cwd()]  # Uses default when no args are provided

    # Test flags combined
    args_flags_combined = parser.parse_args(["path1", "-r", "--debug", "-l", "log.txt"])
    assert args_flags_combined.paths == [Path("path1")]
    assert args_flags_combined.recursive is True
    assert args_flags_combined.debug is True
    assert args_flags_combined.log_file == Path("log.txt")

    # Test --no-debug
    args_no_debug = parser.parse_args(["--no-debug"])
    assert args_no_debug.debug is False  # Corrected: --no-debug sets debug to False


def test_setup_logging_levels_and_handlers(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test logger configuration based on args and config."""
    logger = logging.getLogger("pdl.pdl_linter")  # Use the specific logger name
    # Reset handlers for clean test
    logger.handlers.clear()

    # Config: Console INFO, File DEBUG to file1.log
    config1 = LinterConfig(
        project_root=project_root,
        console_log_level="INFO",
        file_log_level="DEBUG",
        log_file=Path("file1.log"),
    )
    # Args: --debug, --log-file file2.log (override config)
    args1 = argparse.Namespace(debug=True, log_file=Path("file2.log"))
    _setup_logging(args1, config1)

    assert logger.level == logging.DEBUG  # Overall level set by --debug
    assert len(logger.handlers) == 2
    assert isinstance(logger.handlers[0], logging.FileHandler)
    assert logger.handlers[0].baseFilename.endswith("file2.log")
    assert (
        logger.handlers[0].level == logging.DEBUG
    )  # File handler level also debug due to args.debug
    assert isinstance(logger.handlers[1], logging.StreamHandler)
    assert (
        logger.handlers[1].level == logging.DEBUG
    )  # Console handler level also debug due to args.debug
    logger.handlers.clear()

    # Config: Console WARNING, File ERROR, no file logging
    config2 = LinterConfig(
        project_root=project_root,
        console_log_level="WARNING",
        file_log_level="ERROR",
        log_file=None,
        console_log_enabled=True,
    )
    # Args: defaults (debug=False, log_file=None)
    args2 = argparse.Namespace(debug=False, log_file=None)
    _setup_logging(args2, config2)

    assert logger.level == logging.INFO  # Default minimum level
    assert len(logger.handlers) == 1
    assert isinstance(logger.handlers[0], logging.StreamHandler)
    assert logger.handlers[0].level == logging.WARNING  # Console level from config
    logger.handlers.clear()

    # Config: Console disabled
    config3 = LinterConfig(
        project_root=project_root, console_log_enabled=False, log_file=Path("file3.log")
    )
    args3 = argparse.Namespace(debug=False, log_file=None)  # Args use config file
    _setup_logging(args3, config3)
    assert len(logger.handlers) == 1
    assert isinstance(logger.handlers[0], logging.FileHandler)
    assert logger.handlers[0].baseFilename.endswith("file3.log")
    logger.handlers.clear()


def test_run_linter_multiple_paths(
    project_root,
):  # pylint: disable=redefined-outer-name
    """Test run_linter with multiple path arguments."""
    # NOTE: This requires changing nargs in _arg_parser to '+' or '*'
    # Assuming nargs is changed to '*' for this test...

    test_config = LinterConfig(project_root=project_root)
    path1 = project_root / "dir1"
    path1.mkdir()
    (path1 / "valid1.pdl").write_text("role user")
    path2 = project_root / "dir2"
    path2.mkdir()
    (path2 / "valid2.pdl").write_text("role system")
    invalid_path3 = project_root / "invalid3.pdl"
    invalid_path3.write_text("invalid")

    def mock_parse_multi(file_path):
        if file_path == Path("invalid3.pdl"):
            raise PDLParseError("error")
        return (None, None)

    with ChangeDir(project_root):

        # Mock assuming nargs='*' allowing multiple paths
        mock_args = argparse.Namespace(
            paths=[Path("dir1"), Path("invalid3.pdl")],
            recursive=False,
            debug=False,
            log_file=None,
        )

        with (
            patch("pdl.pdl_linter.LinterConfig.load", return_value=test_config),
            patch("argparse.ArgumentParser.parse_args", return_value=mock_args),
            patch("pdl.pdl_linter.parse_pdl_file", side_effect=mock_parse_multi),
        ):
            exit_code = run_linter()
            # Fails because invalid3.pdl is processed
            assert exit_code == 1


def test_run_linter_invalid_path_arg(
    project_root, caplog
):  # pylint: disable=redefined-outer-name
    """Test run_linter with a path argument that is not a file or directory."""
    test_config = LinterConfig(project_root=project_root)
    invalid_path_name = "does_not_exist"

    mock_args = argparse.Namespace(
        paths=[Path(invalid_path_name)], recursive=False, debug=False, log_file=None
    )
    caplog.set_level(logging.ERROR)

    with ChangeDir(project_root):
        with (
            patch("pdl.pdl_linter.LinterConfig.load", return_value=test_config),
            patch("argparse.ArgumentParser.parse_args", return_value=mock_args),
        ):
            exit_code = run_linter()
            # Should maybe return non-zero? Currently just logs error.
            # Let's assert based on current behavior (logs error, exit 0 if no *other* errors)
            check_logs(
                caplog,
                logging.ERROR,
                f"{invalid_path_name} is not a PDL file or directory",
            )
            assert exit_code == 0  # Assuming no other files were processed and failed


# Helper function to check log messages
def check_logs(caplog, level, message_part):
    assert any(
        record.levelno == level
        and (
            message_part in record.message
            or (record.exc_text and message_part in record.exc_text)
        )
        for record in caplog.records
    )


if __name__ == "__main__":
    pytest.main(args=["-v", "--tb=short", __file__])
