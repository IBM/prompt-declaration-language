# Based off implementation by OpenAI: https://github.com/openai/human-eval/blob/master/human_eval/execution.py
# The original work above is licensed under MIT: https://github.com/openai/human-eval/blob/master/LICENSE
# pylint: skip-file
# type: ignore
import contextlib
import faulthandler
import io
import os
import platform
import signal
import tempfile
from pathlib import Path
from typing import Any


def safer_exec(
    code: str,
    globals_scope: dict[str, Any],
    timeout: float = 3600,
    swallowio: bool = False,
):
    """
    Executes Python code with some common, dangerous modules monkeypatched to nop. Default timeout of 1 hr.
    """
    with create_tempdir(), reliability_guard(), swallow_io(swallowio), time_limit(
        timeout
    ):
        # WARNING
        # This program exists to execute untrusted model-generated code. Although
        # it is highly unlikely that model-generated code will do something overtly
        # malicious in response to this test suite, model-generated code may act
        # destructively due to a lack of model capability or alignment.
        # Users are strongly encouraged to sandbox execution if model-generated code
        # is executed, so that it does not perform destructive actions on
        # their host or network.
        exec(code, globals_scope)


@contextlib.contextmanager
def time_limit(seconds: float):
    def signal_handler(signum, frame):
        msg = "Timed out!"
        raise TimeoutError(msg)

    signal.setitimer(signal.ITIMER_REAL, seconds)
    signal.signal(signal.SIGALRM, signal_handler)
    try:
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)


@contextlib.contextmanager
def swallow_io(enable: bool):
    if not enable:
        yield
        return

    stream = WriteOnlyStringIO()
    with (
        contextlib.redirect_stdout(stream),
        contextlib.redirect_stderr(
            stream,
        ),
        RedirectStdin(stream),
    ):
        yield


@contextlib.contextmanager
def create_tempdir():
    with tempfile.TemporaryDirectory() as dirname, chdir(dirname):
        yield dirname


class WriteOnlyStringIO(io.StringIO):
    """StringIO that throws an exception when it's read from."""

    def read(self, *args, **kwargs):
        raise OSError

    def readline(self, *args, **kwargs):
        raise OSError

    def readlines(self, *args, **kwargs):
        raise OSError

    def readable(self, *args, **kwargs):
        """Returns True if the IO object can be read."""
        return False


class RedirectStdin(contextlib._RedirectStream):  # type: ignore
    _stream = "stdin"


@contextlib.contextmanager
def chdir(root):
    if root == ".":
        yield
        return
    cwd = Path.cwd()
    os.chdir(root)
    try:
        yield
    finally:
        os.chdir(cwd)


def raise_disabled(*args, **kwargs):
    raise NotImplementedError("This module has been disabled for safety.")


@contextlib.contextmanager
def reliability_guard(maximum_memory_bytes: int | None = None):
    """
    Disables various destructive functions and prevents the generated code
    from interfering with the test (e.g. fork bomb, killing other processes,
    removing filesystem files, etc.).

    Warning:
    -------
    This function is NOT a security sandbox. Untrusted code, including, model-
    generated code, should not be blindly executed outside of one. See the
    Codex paper for more information about OpenAI's code sandbox, and proceed
    with caution.

    """
    if maximum_memory_bytes is not None:
        import resource

        resource.setrlimit(
            resource.RLIMIT_AS,
            (maximum_memory_bytes, maximum_memory_bytes),
        )
        resource.setrlimit(
            resource.RLIMIT_DATA,
            (maximum_memory_bytes, maximum_memory_bytes),
        )
        if platform.uname().system != "Darwin":
            resource.setrlimit(
                resource.RLIMIT_STACK,
                (maximum_memory_bytes, maximum_memory_bytes),
            )

    faulthandler.disable()

    import builtins
    import os
    import shutil
    import subprocess

    builtins_exit = builtins.exit
    builtins_quit = builtins.quit
    builtins_open = builtins.open
    builtin_help = builtins.help
    os_kill = os.kill
    os_system = os.system
    os_putenv = os.putenv
    os_remove = os.remove
    os_removedirs = os.removedirs
    os_rmdir = os.rmdir
    os_fchdir = os.fchdir
    os_setuid = os.setuid
    os_fork = os.fork
    os_forkpty = os.forkpty
    os_killpg = os.killpg
    os_rename = os.rename
    os_renames = os.renames
    os_truncate = os.truncate
    os_replace = os.replace
    os_unlink = os.unlink
    os_fchmod = os.fchmod
    os_fchown = os.fchown
    os_chmod = os.chmod
    os_chown = os.chown
    os_chroot = os.chroot
    os_fchdir = os.fchdir
    os_lchflags = os.lchflags
    os_lchmod = os.lchmod
    os_lchown = os.lchown
    os_getcwd = os.getcwd
    os_chdir = os.chdir
    shutil_rmtree = shutil.rmtree
    shutil_move = shutil.move
    shutil_chown = shutil.chown
    subprocess_Popen = subprocess.Popen

    builtins.exit = raise_disabled
    builtins.quit = raise_disabled
    builtins.open = raise_disabled
    builtins.help = raise_disabled
    os.kill = raise_disabled
    os.system = raise_disabled
    os.putenv = raise_disabled
    os.remove = raise_disabled
    os.removedirs = raise_disabled
    os.rmdir = raise_disabled
    os.fchdir = raise_disabled
    os.setuid = raise_disabled
    os.fork = raise_disabled
    os.forkpty = raise_disabled
    os.killpg = raise_disabled
    os.rename = raise_disabled
    os.renames = raise_disabled
    os.truncate = raise_disabled
    os.replace = raise_disabled
    os.unlink = raise_disabled
    os.fchmod = raise_disabled
    os.fchown = raise_disabled
    os.chmod = raise_disabled
    os.chown = raise_disabled
    os.chroot = raise_disabled
    os.fchdir = raise_disabled
    os.lchflags = raise_disabled
    os.lchmod = raise_disabled
    os.lchown = raise_disabled
    os.getcwd = raise_disabled
    os.chdir = raise_disabled
    shutil.rmtree = raise_disabled
    shutil.move = raise_disabled
    shutil.chown = raise_disabled
    subprocess.Popen = raise_disabled

    try:
        yield
    finally:
        builtins.exit = builtins_exit
        builtins.quit = builtins_quit
        builtins.open = builtins_open
        builtins.help = builtin_help
        os.kill = os_kill
        os.system = os_system
        os.putenv = os_putenv
        os.remove = os_remove
        os.removedirs = os_removedirs
        os.rmdir = os_rmdir
        os.fchdir = os_fchdir
        os.setuid = os_setuid
        os.fork = os_fork
        os.forkpty = os_forkpty
        os.killpg = os_killpg
        os.rename = os_rename
        os.renames = os_renames
        os.truncate = os_truncate
        os.replace = os_replace
        os.unlink = os_unlink
        os.fchmod = os_fchmod
        os.fchown = os_fchown
        os.chmod = os_chmod
        os.chown = os_chown
        os.chroot = os_chroot
        os.fchdir = os_fchdir
        os.lchflags = os_lchflags
        os.lchmod = os_lchmod
        os.lchown = os_lchown
        os.getcwd = os_getcwd
        os.chdir = os_chdir
        shutil.rmtree = shutil_rmtree
        shutil.move = shutil_move
        shutil.chown = shutil_chown
        subprocess.Popen = subprocess_Popen
