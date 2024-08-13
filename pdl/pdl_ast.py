from enum import StrEnum
from typing import Any, Literal, Optional, TypeAlias

from genai.schema import (
    DecodingMethod,
    ModerationParameters,
    PromptTemplateData,
    TextGenerationParameters,
)
from pydantic import BaseModel, ConfigDict, Field, RootModel

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


class BlockKind(StrEnum):
    FUNCTION = "function"
    CALL = "call"
    MODEL = "model"
    CODE = "code"
    API = "api"
    GET = "get"
    DATA = "data"
    DOCUMENT = "document"
    SEQUENCE = "sequence"
    ARRAY = "array"
    IF = "if"
    REPEAT = "repeat"
    REPEAT_UNTIL = "repeat_until"
    READ = "read"
    INCLUDE = "include"
    EMPTY = "empty"
    FOR = "for"
    ERROR = "error"


class LocationType(BaseModel):
    model_config = ConfigDict(extra="forbid")
    path: list[str]
    file: str
    table: dict[str, int]


empty_block_location = LocationType(file="", path=[], table={})


class Parser(BaseModel):
    model_config = ConfigDict(extra="forbid")
    description: Optional[str] = None
    spec: Optional[dict[str, Any]] = None


class PdlParser(Parser):
    model_config = ConfigDict(extra="forbid")
    pdl: "BlocksType"


class RegexParser(Parser):
    model_config = ConfigDict(extra="forbid")
    regex: str
    mode: Literal["search", "match", "fullmatch", "split", "findall"] = "fullmatch"


ParserType: TypeAlias = Literal["json", "yaml"] | PdlParser | RegexParser


class Block(BaseModel):
    """PDL program block"""

    model_config = ConfigDict(extra="forbid")
    description: Optional[str] = None
    spec: Any = None
    defs: dict[str, "BlocksType"] = {}
    assign: Optional[str] = Field(default=None, alias="def")
    show_result: bool = True
    result: Optional[Any] = None
    parser: Optional[ParserType] = None
    location: Optional[LocationType] = None
    has_error: bool = False
    fallback: Optional["BlocksType"] = None


class FunctionBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.FUNCTION] = BlockKind.FUNCTION
    function: Optional[dict[str, Any]]
    returns: "BlocksType" = Field(..., alias="return")
    scope: Optional[ScopeType] = None


class CallBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.CALL] = BlockKind.CALL
    call: str
    args: dict[str, Any] = {}
    trace: Optional["BlocksType"] = None


class BamTextGenerationParameters(TextGenerationParameters):
    model_config = ConfigDict(extra="forbid")


class ModelPlatform(StrEnum):
    BAM = "bam"
    WATSONX = "watsonx"


class ModelBlock(Block):
    kind: Literal[BlockKind.MODEL] = BlockKind.MODEL
    model: str
    input: Optional["BlocksType"] = None
    trace: Optional["BlockType"] = None


class BamModelBlock(ModelBlock):
    model_config = ConfigDict(extra="forbid")
    platform: Literal[ModelPlatform.BAM] = ModelPlatform.BAM
    prompt_id: Optional[str] = None
    parameters: Optional[BamTextGenerationParameters | dict] = None
    moderations: Optional[ModerationParameters] = None
    data: Optional[PromptTemplateData] = None
    constraints: Any = None  # TODO


class WatsonxModelBlock(ModelBlock):
    model_config = ConfigDict(extra="forbid")
    platform: Literal[ModelPlatform.WATSONX] = ModelPlatform.WATSONX
    params: Optional[dict] = None
    guardrails: Optional[bool] = None
    guardrails_hap_params: Optional[dict] = None


class CodeBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.CODE] = BlockKind.CODE
    lan: Literal["python"]
    code: "BlocksType"


class ApiBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.API] = BlockKind.API
    api: str
    url: str
    input: "BlocksType"


class GetBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.GET] = BlockKind.GET
    get: str


class DataBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.DATA] = BlockKind.DATA
    data: ExpressionType


class DocumentBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.DOCUMENT] = BlockKind.DOCUMENT
    document: "BlocksType"


class SequenceBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.SEQUENCE] = BlockKind.SEQUENCE
    sequence: "BlocksType"


class ArrayBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.ARRAY] = BlockKind.ARRAY
    array: "BlocksType"


class IfBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.IF] = BlockKind.IF
    condition: ExpressionType = Field(alias="if")
    then: "BlocksType"
    elses: Optional["BlocksType"] = Field(default=None, alias="else")
    if_result: Optional[bool] = None


class IterationType(StrEnum):
    SEQUENCE = "sequence"
    ARRAY = "array"
    DOCUMENT = "document"


class ForBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.FOR] = BlockKind.FOR
    fors: dict[str, Any] = Field(alias="for")
    repeat: "BlocksType"
    iteration_type: IterationType = Field(alias="as", default=IterationType.ARRAY)
    trace: Optional[list["BlocksType"]] = None


class RepeatBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.REPEAT] = BlockKind.REPEAT
    repeat: "BlocksType"
    num_iterations: int
    iteration_type: IterationType = Field(alias="as", default=IterationType.SEQUENCE)
    trace: Optional[list["BlocksType"]] = None


class RepeatUntilBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.REPEAT_UNTIL] = BlockKind.REPEAT_UNTIL
    repeat: "BlocksType"
    until: ExpressionType
    iteration_type: IterationType = Field(alias="as", default=IterationType.SEQUENCE)
    trace: Optional[list["BlocksType"]] = None


class ReadBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.READ] = BlockKind.READ
    read: str | None
    message: Optional[str] = None
    multiline: bool = False


class IncludeBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.INCLUDE] = BlockKind.INCLUDE
    include: str
    trace: Optional["BlockType"] = None


class ErrorBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.ERROR] = BlockKind.ERROR
    msg: str
    program: "BlocksType"


class EmptyBlock(Block):
    model_config = ConfigDict(extra="forbid")
    kind: Literal[BlockKind.EMPTY] = BlockKind.EMPTY


AdvancedBlockType: TypeAlias = (
    FunctionBlock
    | CallBlock
    | WatsonxModelBlock
    | BamModelBlock
    | CodeBlock
    | ApiBlock
    | GetBlock
    | DataBlock
    | IfBlock
    | RepeatBlock
    | RepeatUntilBlock
    | ForBlock
    | DocumentBlock
    | SequenceBlock
    | ArrayBlock
    | ReadBlock
    | IncludeBlock
    | ErrorBlock
    | EmptyBlock
)

BlockType: TypeAlias = int | float | str | AdvancedBlockType
BlocksType: TypeAlias = BlockType | list[BlockType]  # pyright: ignore


class Program(RootModel):
    """
    Prompt Description Program (PDL)
    """

    # root: dict[str, BlockType]
    root: BlockType


class PdlBlock(RootModel):
    # This class is used to introduce that a type in the generate JsonSchema
    root: BlockType


class PdlBlocks(RootModel):
    # This class is used to introduce that a type in the generate JsonSchema
    root: BlocksType


class PDLException(Exception):
    def __init__(self, msg):
        self.msg = msg


MAX_NEW_TOKENS = 1024
MIN_NEW_TOKENS = 1
REPETITION_PENATLY = 1.05
TEMPERATURE_SAMPLING = 0.7
TOP_P_SAMPLING = 0.85
TOP_K_SAMPLING = 50
DECODING_METHOD = "greedy"


def empty_text_generation_parameters() -> BamTextGenerationParameters:
    return BamTextGenerationParameters(
        beam_width=None,
        max_new_tokens=None,
        min_new_tokens=None,
        random_seed=None,
        repetition_penalty=None,
        stop_sequences=None,
        temperature=None,
        time_limit=None,
        top_k=None,
        top_p=None,
        truncate_input_tokens=None,
        typical_p=None,
    )


def set_default_model_params(
    parameters: Optional[dict | BamTextGenerationParameters],
) -> BamTextGenerationParameters:
    if parameters is None:
        params = empty_text_generation_parameters()
    elif isinstance(parameters, BamTextGenerationParameters):
        params = parameters
    else:
        params = BamTextGenerationParameters(**parameters)
    if params.decoding_method is None:
        params.decoding_method = (  # pylint: disable=attribute-defined-outside-init
            DecodingMethod.GREEDY
        )
    if params.max_new_tokens is None:
        params.max_new_tokens = (  # pylint: disable=attribute-defined-outside-init
            MAX_NEW_TOKENS
        )
    if params.min_new_tokens is None:
        params.min_new_tokens = (  # pylint: disable=attribute-defined-outside-init
            MIN_NEW_TOKENS
        )
    if params.repetition_penalty is None:
        params.repetition_penalty = (  # pylint: disable=attribute-defined-outside-init
            REPETITION_PENATLY
        )
    if params.decoding_method == DecodingMethod.SAMPLE:
        if params.temperature is None:
            params.temperature = (  # pylint: disable=attribute-defined-outside-init
                TEMPERATURE_SAMPLING
            )
        if params.top_k is None:
            params.top_k = (  # pylint: disable=attribute-defined-outside-init
                TOP_K_SAMPLING
            )
        if params.top_p is None:
            params.top_p = (  # pylint: disable=attribute-defined-outside-init
                TOP_P_SAMPLING
            )
    return params


# See: https://cloud.ibm.com/apidocs/watsonx-ai#deployments-text-generation
def set_default_model_parameters(
    parameters: Optional[dict[str, Any]],
) -> dict[str, str]:
    if parameters is None:
        parameters = {}

    if "decoding_method" not in parameters:
        parameters[
            "decoding_method"
        ] = DECODING_METHOD  # pylint: disable=attribute-defined-outside-init
    if "max_new_tokens" not in parameters:
        parameters[
            "max_new_tokens"
        ] = MAX_NEW_TOKENS  # pylint: disable=attribute-defined-outside-init
    if "min_new_tokens" not in parameters:
        parameters[
            "min_new_tokens"
        ] = MIN_NEW_TOKENS  # pylint: disable=attribute-defined-outside-init
    if "repetition_penalty" not in parameters:
        parameters[
            "repetition_penalty"
        ] = REPETITION_PENATLY  # pylint: disable=attribute-defined-outside-init
    if parameters["decoding_method"] == "sample":
        if "temperature" not in parameters:
            parameters[
                "temperature"
            ] = TEMPERATURE_SAMPLING  # pylint: disable=attribute-defined-outside-init
        if "top_k" not in parameters:
            parameters[
                "top_k"
            ] = TOP_K_SAMPLING  # pylint: disable=attribute-defined-outside-init
        if "top_p" not in parameters:
            parameters[
                "top_p"
            ] = TOP_P_SAMPLING  # pylint: disable=attribute-defined-outside-init
    return parameters
