from typing import Any, Optional, TypeAlias

from pydantic import BaseModel, RootModel


class BasicBlock(BaseModel):
    pass


class ModelBasicBlock(BasicBlock):
    model: str
    input: Optional["PromptType"] = None
    decoding: Optional[str] = None
    stop_sequences: Optional[list[str]] = None
    include_stop_sequences: bool = False
    params: Optional[Any] = None


class CodeBasicBlock(BasicBlock):
    lan: str
    code: "PromptsType"


class ApiBasicBlock(BasicBlock):
    api: str
    url: str
    input: "PromptType"


class VarBasicBlock(BasicBlock):
    var: str


class ValueBasicBlock(BasicBlock):
    value: Any


BasicBlockType: TypeAlias = (
    ModelBasicBlock | CodeBasicBlock | ApiBasicBlock | VarBasicBlock | ValueBasicBlock
)


class ConditionExpr(BaseModel):
    pass


class EndsWithArgs(BaseModel):
    arg0: "PromptType"
    arg1: str


class EndsWithCondition(ConditionExpr):
    ends_with: EndsWithArgs


class ContainsArgs(BaseModel):
    arg0: "PromptType"
    arg1: str


class ContainsCondition(ConditionExpr):
    contains: ContainsArgs


ConditionType: TypeAlias = str | EndsWithCondition | ContainsCondition


class Block(BaseModel):
    """PDL program block"""

    title: Optional[str] = None
    prompts: list["PromptType"]
    assign: Optional[str] = None
    show_result: bool = True


class IfBlock(Block):
    condition: ConditionType


class RepeatsBlock(Block):
    repeats: int


class RepeatsUntilBlock(Block):
    repeats_until: ConditionType


BlockType: TypeAlias = IfBlock | RepeatsBlock | RepeatsUntilBlock | Block
PromptType: TypeAlias = str | BlockType | BasicBlockType  # pyright: ignore
PromptsType: TypeAlias = list[PromptType]


class Program(RootModel):
    """
    Prompt Description Program (PDL)
    """

    # root: dict[str, BlockType]
    root: BlockType
