from typing import Any, Literal, Optional, TypeAlias, Union

from pydantic import BaseModel, RootModel


class Lookup(BaseModel):
    show_result: bool = True


class ModelLookup(Lookup):
    model: str
    input: Union[Literal["context"], "BlockType"]
    decoding: Optional[str] = None
    stop_sequences: Optional[list[str]] = None
    include_stop_sequences: bool = False
    params: Optional[Any] = None


class CodeLookup(Lookup):
    lan: str
    code: list["StrOrBlockType"]


class ApiLookup(Lookup):
    api: str
    url: str
    input: "BlockType"


LookupType: TypeAlias = ModelLookup | CodeLookup | ApiLookup


class ConditionExpr(BaseModel):
    pass


class EndsWithArgs(BaseModel):
    arg0: "StrOrValueBlockType"
    arg1: str


class EndsWithCondition(ConditionExpr):
    ends_with: EndsWithArgs


class ContainsArgs(BaseModel):
    arg0: "StrOrValueBlockType"
    arg1: str


class ContainsCondition(ConditionExpr):
    contains: ContainsArgs


ConditionType: TypeAlias = str | EndsWithCondition | ContainsCondition


class Block(BaseModel):
    """PDL program block"""

    condition: Optional[ConditionType] = None
    repeats: Optional[int] = None
    repeats_until: Optional[ConditionType] = None


class PromptsBlock(Block):
    prompts: list["StrOrBlockType"]


class LookupBlock(Block):
    var: str
    lookup: LookupType


class ValueBlock(Block):
    value: Any


BlockType: TypeAlias = PromptsBlock | LookupBlock | ValueBlock
StrOrBlockType: TypeAlias = str | BlockType  # pyright: ignore
StrOrValueBlockType: TypeAlias = str | ValueBlock


class Program(RootModel):
    """
    Prompt Description Program (PDL)
    """

    # title: str
    root: BlockType
