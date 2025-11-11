from asyncio import AbstractEventLoop
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from pdl.pdl_context import DependentContext
from pdl.pdl_utils import Ref

from .pdl_ast import BlockType, LazyMessages, PdlUsage, RoleType, ScopeType
from .pdl_scheduler import create_event_loop_thread


class InterpreterState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    yield_result: bool = False
    """Stream the result on the standard output as soon as possible."""
    yield_background: bool = False
    """Stream the toplevel pdl_context on the standard output as soon as possible."""
    batch: int = 1
    """
    Stream the output of the LLM
    - batch=0: streaming
    - batch=1: call to generate with `input`
    """
    role: RoleType = "user"
    """Current role to add messages in the context."""
    cwd: Path = Path.cwd()
    """Current working directory."""
    id_stack: list[str] = []
    """Id generator for the UI."""

    # The following are shared variable that should be modified by side effects
    imported: dict[str, tuple[ScopeType, BlockType]] = {}
    """Cache containing the imported files."""
    event_loop: AbstractEventLoop = Field(default_factory=create_event_loop_thread)
    """Event loop to schedule LLM calls."""
    current_pdl_context: Ref[LazyMessages] = Field(
        default_factory=lambda: Ref(DependentContext([]))
    )
    """Current value of the context set at the beginning of the execution of the block."""
    replay: dict[str, Any] = {}
    """Dictionary that associate runtime block ids with their values to be able to replay an execution."""
    llm_usage: PdlUsage = PdlUsage()
    """Data structure where to accumulate LLMs usage."""

    def with_yield_result(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_result": b})

    def with_yield_background(self: "InterpreterState", b: bool) -> "InterpreterState":
        return self.model_copy(update={"yield_background": b})

    def with_role(self: "InterpreterState", role: RoleType) -> "InterpreterState":
        return self.model_copy(update={"role": role})

    def with_id(self: "InterpreterState", n: str) -> "InterpreterState":
        stack = self.id_stack if self.id_stack is not None else []
        return self.model_copy(update={"id_stack": stack + [n]})

    def with_iter(self: "InterpreterState", i: int) -> "InterpreterState":
        return self.with_id(str(i))

    def add_usage(self, usage: PdlUsage):
        self.llm_usage.model_calls += usage.model_calls
        self.llm_usage.completion_tokens += usage.completion_tokens
        self.llm_usage.prompt_tokens += usage.prompt_tokens
