import sys
from dataclasses import dataclass
from typing import Sequence

from .pdl_dumper import blocks_to_dict, dump_yaml

from .pdl_ast import (
    AdvancedBlockType,
    ArrayBlock,
    Block,
    BlocksType,
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
    print(f"Warning: the result of block `{dump_yaml(blocks_to_dict(block, json_compatible=True))}` is not used.", file=sys.stderr)
    if _DISPLAY_UNUSED_HINT:
        _DISPLAY_UNUSED_HINT = False
        print(
            "         You might want to use a `text` block around the list or explicitly ignore the result with `contribute: [context]`.",
            file=sys.stderr,
        )


def unused_program(prog: Program) -> None:
    state = UnusedConfig(implicit_ignore=False)
    unused_blocks(state, prog.root)


def unused_blocks(state: UnusedConfig, blocks: BlocksType) -> None:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        unused_advanced_block(state, LastOfBlock(lastOf=blocks))
    else:
        unused_block(state, blocks)


def unused_block(state, blocks: BlockType) -> None:
    if isinstance(blocks, Block):
        unused_advanced_block(state, blocks)
    else:
        if state.implicit_ignore:
            unused_warning(blocks)


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
        case ArrayBlock() | ObjectBlock() | TextBlock():
            if state.implicit_ignore:
                unused_warning(block)
            iter_block_children((lambda blocks: used_blocks(state, blocks)), block)
        # Leaf blocks
        case (
            DataBlock()
            | FunctionBlock()
            | GetBlock()
            | MessageBlock()
            | ModelBlock()
            | CallBlock()
            | CodeBlock()
            | EmptyBlock()
            | ReadBlock()
        ):
            if state.implicit_ignore:
                unused_warning(block)
            iter_block_children(
                (
                    lambda blocks: unused_blocks(
                        state.with_implicit_ignore(False), blocks
                    )
                ),
                block,
            )
        case ErrorBlock():
            pass
        # Non-leaf blocks
        case (
            ForBlock() | IfBlock() | IncludeBlock() | RepeatBlock() | RepeatUntilBlock()
        ):
            iter_block_children((lambda blocks: unused_blocks(state, blocks)), block)
        case _:
            assert False


def used_blocks(state: UnusedConfig, blocks: BlocksType) -> None:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        for block in blocks:
            unused_block(state.with_implicit_ignore(False), block)
    else:
        unused_block(state.with_implicit_ignore(False), blocks)
