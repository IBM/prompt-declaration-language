from typing import Any, Optional, TypeAlias

from genai.schema import (
    ModerationParameters,
    PromptTemplateData,
    TextGenerationParameters,
)
from pydantic import BaseModel, ConfigDict, Field, InstanceOf, RootModel

ScopeType: TypeAlias = dict[str, Any]

ExpressionType: TypeAlias = Any
# (
#     str
#     | int
#     | float
#     | bool
#     | None
#     | list["ExpressionType"]
#     | dict[str, "ExpressionType"]
# )


class ConditionExpr(BaseModel):
    result: Optional[bool] = None


class EndsWithArgs(BaseModel):
    arg0: "DocumentType"
    arg1: ExpressionType


class EndsWithCondition(ConditionExpr):
    ends_with: EndsWithArgs


class ContainsArgs(BaseModel):
    arg0: "DocumentType"
    arg1: ExpressionType


class ContainsCondition(ConditionExpr):
    contains: ContainsArgs


ConditionType: TypeAlias = str | EndsWithCondition | ContainsCondition


class Block(BaseModel):
    """PDL program block"""

    model_config = ConfigDict(extra="forbid")
    description: Optional[str] = None
    spec: Any = None  # TODO
    defs: dict[str, "DocumentType"] = {}
    assign: Optional[str] = Field(default=None, alias="def")
    show_result: bool = True
    result: Optional[Any] = None


class FunctionBlock(Block):
    model_config = ConfigDict(extra="allow")
    show_result: bool = False
    params: Optional[dict[str, Any]]
    scope: Optional[ScopeType] = None

    _body: Optional["BlockType"] = None

    @property
    def body(self) -> Optional["BlockType"]:
        if self._body is None and self.model_extra is not None:
            self._body = Program.model_validate(
                {"description": "function body"} | self.model_extra
            ).root
        return self._body


class CallBlock(Block):
    model_config = ConfigDict(extra="forbid")
    call: str
    args: dict[str, Any] = {}


class PDLTextGenerationParameters(TextGenerationParameters):
    model_config = ConfigDict(extra="forbid")


class ModelBlock(Block):
    model_config = ConfigDict(extra="forbid")
    model: str
    input: Optional["DocumentType"] = None
    prompt_id: Optional[str] = None
    parameters: Optional[PDLTextGenerationParameters] = None
    moderations: Optional[ModerationParameters] = None
    data: Optional[PromptTemplateData] = None
    constraints: Any = None  # TODO


class CodeBlock(Block):
    model_config = ConfigDict(extra="forbid")
    lan: str
    code: "DocumentType"


class ApiBlock(Block):
    model_config = ConfigDict(extra="forbid")
    api: str
    url: str
    input: "DocumentType"


class GetBlock(Block):
    model_config = ConfigDict(extra="forbid")
    get: str


class ValueBlock(Block):
    model_config = ConfigDict(extra="forbid")
    value: ExpressionType


class SequenceBlock(Block):
    model_config = ConfigDict(extra="forbid")
    document: "DocumentType"


class IfBlock(Block):
    model_config = ConfigDict(extra="forbid")
    document: "DocumentType"
    condition: ConditionType


class RepeatsBlock(Block):
    model_config = ConfigDict(extra="forbid")
    document: "DocumentType"
    repeats: int
    trace: list["DocumentType"] = []


class RepeatsUntilBlock(Block):
    model_config = ConfigDict(extra="forbid")
    document: "DocumentType"
    repeats_until: ConditionType
    trace: list["DocumentType"] = []


class ErrorBlock(Block):
    model_config = ConfigDict(extra="forbid")
    msg: str
    block: "BlockType"


class InputBlock(Block):
    message: Optional[str] = None
    multiline: bool = False
    json_content: bool = False


class InputFileBlock(InputBlock):
    model_config = ConfigDict(extra="forbid")
    filename: str


class InputStdinBlock(InputBlock):
    model_config = ConfigDict(extra="forbid")
    stdin: bool


BlockType: TypeAlias = (
    FunctionBlock
    | CallBlock
    | ModelBlock
    | CodeBlock
    | ApiBlock
    | GetBlock
    | ValueBlock
    | IfBlock
    | RepeatsBlock
    | RepeatsUntilBlock
    | SequenceBlock
    | ErrorBlock
    | InputFileBlock
    | InputStdinBlock
    | InstanceOf[Block]
)
DocumentType: TypeAlias = str | BlockType | list[str | BlockType]  # pyright: ignore


class Program(RootModel):
    """
    Prompt Description Program (PDL)
    """

    # root: dict[str, BlockType]
    root: BlockType
