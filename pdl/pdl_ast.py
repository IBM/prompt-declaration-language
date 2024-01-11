from typing import Any, Literal, Optional, TypeAlias, Union

from pydantic import BaseModel, RootModel


class Lookup(BaseModel):
    show_result: bool = True


class ModelLookup(Lookup):
    model: str
    input: Union[Literal["context"], "block"]
    decoding: Optional[str] = None
    stop_sequences: Optional[list[str]] = None
    include_stop_sequences: bool = False
    params: Optional[Any] = None


class CodeLookup(Lookup):
    lan: str
    code: list["str_or_block"]


class ApiLookup(Lookup):
    api: str
    url: str
    input: "block"


lookup: TypeAlias = ModelLookup | CodeLookup | ApiLookup


class ConditionExpr(BaseModel):
    pass


class EndsWithArgs(BaseModel):
    arg0: "str_or_value_block"
    arg1: str


class EndsWithCondition(ConditionExpr):
    ends_with: EndsWithArgs


class ContainsArgs(BaseModel):
    arg0: "str_or_value_block"
    arg1: str


class ContainsCondition(ConditionExpr):
    contains: ContainsArgs


condition_type: TypeAlias = str | EndsWithCondition | ContainsCondition


class Block(BaseModel):
    """PDL program block"""

    condition: Optional[condition_type] = None
    repeats: Optional[int] = None
    repeats_until: Optional[condition_type] = None


class PromptsBlock(Block):
    prompts: list["str_or_block"]


class LookupBlock(Block):
    var: str
    lookup: lookup


class ValueBlock(Block):
    value: Any


block: TypeAlias = PromptsBlock | LookupBlock | ValueBlock
str_or_block: TypeAlias = str | block
str_or_value_block: TypeAlias = str | ValueBlock


class Program(RootModel):
    """
    Prompt Description Program (PDL)
    """

    # title: str
    root: block
