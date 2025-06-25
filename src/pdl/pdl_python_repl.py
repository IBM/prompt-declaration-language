import re
import warnings
from collections.abc import Callable, Mapping

from IPython.core.interactiveshell import InteractiveShell
from IPython.utils.capture import capture_output

PATCH_RECURSION_LIMIT = (
    "import sys; "
    "sys.setrecursionlimit = lambda *args, **kwargs: "
    "print('Setting recursion limit is disabled')"
)


class PythonREPL:
    """A tool for running python code in a REPL using multiprocessing."""

    def __init__(
        self,
        name_to_func_mapping: Mapping[str, Callable],
        timeout: int = 30,
    ) -> None:
        super().__init__()
        try:
            # isort: off
            from multiprocess import (  # pylint: disable=import-outside-toplevel
                Manager,  # pyright: ignore
                Process,  # pyright: ignore
            )

            # isort: on

            self.manager = Manager
            self.process = Process
        except ImportError as exc:
            raise ImportError(
                "The 'multiprocess' package is required. Please install it using: "
                "pip install multiprocess",
            ) from exc
        self.user_ns = name_to_func_mapping
        self.timeout = timeout
        warnings.filterwarnings("ignore", "Attempting to work in a virtualenv")

    def _run_code_in_process(self, code: str, namespace: dict, timeout: float) -> str:
        """
        Function to run the given code in a separate process.
        """

        def target(return_dict: dict[str, str]) -> None:
            try:
                shell = InteractiveShell.instance(user_ns=namespace, colors="NoColor")

                # Disable certain functions for safety
                shell.run_cell(
                    raw_cell=PATCH_RECURSION_LIMIT,
                    store_history=False,
                    silent=True,
                )

                with capture_output() as captured:
                    _ = shell.run_cell(code, store_history=False, silent=True)

                shell.cleanup()
                output = captured.stdout or "[Executed Successfully with No Output]"
                output = re.sub(
                    r"File .*Projects/pdl/repl.py:(\d+)",
                    r"File <hidden_filepath>:\1",
                    output,
                )
                return_dict["output"] = (
                    output[:2000] + "...\n[Output Truncated]"
                    if len(output) > 2000
                    else output
                )
            except Exception as e:
                return_dict["output"] = f"Error: {e!s}"

        # Shared dictionary to store the output
        manager = self.manager()
        return_dict = manager.dict()

        process = self.process(
            target=target, args=(return_dict,)
        )  # pylint: disable=not-callable
        process.start()
        process.join(timeout)

        if process.is_alive():
            process.terminate()
            return "TimeoutError: Execution exceeded the time limit."

        return return_dict.get("output", "Error: Unknown error occurred.")

    def __call__(self, query: str) -> str:
        """Use the tool and return observation by executing in a separate process."""
        namespace = dict(self.user_ns)  # Shallow copy of the namespace
        return self._run_code_in_process(query, namespace, self.timeout)
