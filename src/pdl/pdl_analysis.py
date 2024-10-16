import sys
from dataclasses import dataclass
from typing import Sequence

from .pdl_ast import (
    AdvancedBlockType,
    ArrayBlock,
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    ContributeTarget,
    DataBlock,
    EmptyBlock,
    ErrorBlock,
    ForBlock,
    FunctionBlock,
    GetBlock,
    IfBlock,
    IncludeBlock,
    LastOfBlock,
    MessageBlock,
    ModelBlock,
    ObjectBlock,
    Program,
    ReadBlock,
    RepeatBlock,
    RepeatUntilBlock,
    TextBlock,
)
from .pdl_ast_utils import iter_block_children


@dataclass
class UnusedConfig:
    implicit_ignore: bool

    def with_implicit_ignore(self, b):
        return UnusedConfig(implicit_ignore=b)


_DISPLAY_UNUSED_HINT = True


def unused_warning(block: BlockType):
    global _DISPLAY_UNUSED_HINT  # pylint: disable= global-statement
    print(f"Warning: the result of block `{block}` is not used.", file=sys.stderr)
    if _DISPLAY_UNUSED_HINT:
        _DISPLAY_UNUSED_HINT = False
        print(
            "         You might want to use a `text` block around the list or explicitly ignore the result with `contribute: [context]`.",
            file=sys.stderr,
        )


def unused_program(prog: Program) -> None:
    state = UnusedConfig(implicit_ignore=False)
    unused_advanced_block(state, LastOfBlock(lastOf=prog.root))


def unused_block(state, block: BlockType) -> None:
    if not isinstance(block, Block):
        if state.implicit_ignore:
            unused_warning(block)
        return
    unused_advanced_block(state, block)


def unused_advanced_block(state: UnusedConfig, block: AdvancedBlockType) -> None:
    if block.assign is not None:
        state = state.with_implicit_ignore(False)
    if ContributeTarget.RESULT not in block.contribute:
        state = state.with_implicit_ignore(False)
    match block:
        case LastOfBlock():
            if not isinstance(block.lastOf, str) and isinstance(block.lastOf, Sequence):
                state_with_ignore = state.with_implicit_ignore(True)
                for b in block.lastOf[:-1]:
                    unused_block(state_with_ignore, b)
                unused_block(state, block.lastOf[-1])
            else:
                unused_block(state, block.lastOf)
        # Leaf blocks without side effects
        case DataBlock() | FunctionBlock() | GetBlock() | ModelBlock() | ReadBlock():
            if state.implicit_ignore:
                unused_warning(block)
            return
        # Leaf blocks with side effects
        case CallBlock() | CodeBlock() | EmptyBlock() | ErrorBlock():
            return
        # Non-leaf blocks
        case (
            ArrayBlock()
            | ForBlock()
            | IfBlock()
            | IncludeBlock()
            | MessageBlock()
            | ObjectBlock()
            | RepeatBlock()
            | RepeatUntilBlock()
            | TextBlock()
        ):
            iter_block_children((lambda b: unused_block(state, b)), block)
        case _:
            assert False
