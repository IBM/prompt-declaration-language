"""PDL programs are represented by the Pydantic data structure defined in this file.
"""

from enum import StrEnum
from typing import Any, Literal, Optional, Sequence, TypeAlias, Union

from pydantic import BaseModel, ConfigDict, Field, RootModel

from .pdl_schema_utils import pdltype_to_jsonschema

ScopeType: TypeAlias = dict[str, Any]


Message: TypeAlias = dict[str, Any]
Messages: TypeAlias = list[Message]


class BlockKind(StrEnum):
    FUNCTION = "function"
    CALL = "call"
    MODEL = "model"
    CODE = "code"
    GET = "get"
    DATA = "data"
    TEXT = "text"
    LASTOF = "lastOf"
    ARRAY = "array"
    OBJECT = "object"
    MESSAGE = "message"
    IF = "if"
    MATCH = "match"
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


class LocalizedExpression(BaseModel):
    """Expression with location information"""

    model_config = ConfigDict(
        extra="forbid", use_attribute_docstrings=True, arbitrary_types_allowed=True
    )
    expr: Any
    location: Optional[LocationType] = None


ExpressionType: TypeAlias = Any | LocalizedExpression
# (
#     str
#     | int
#     | float
#     | bool
#     | None
#     | list["ExpressionType"]
#     | dict[str, "ExpressionType"]
# )


class Pattern(BaseModel):
    model_config = ConfigDict(extra="forbid")

    assign: Optional[str] = Field(default=None, alias="def")
    """Name of the variable used to store the value matched by the pattern.
    """


class OrPattern(Pattern):
    anyOf: list["PatternType"]


class ArrayPattern(Pattern):
    array: list["PatternType"]


class ObjectPattern(Pattern):
    object: dict[str, "PatternType"]


class AnyPattern(Pattern):
    any: Literal[None]


PatternType: TypeAlias = (
    None
    | bool
    | int
    | float
    | str
    | OrPattern
    | ArrayPattern
    | ObjectPattern
    | AnyPattern
)


class Parser(BaseModel):
    model_config = ConfigDict(extra="forbid")
    description: Optional[str] = None
    spec: Optional[dict[str, Any]] = None


class PdlParser(Parser):
    pdl: "BlockType"


class RegexParser(Parser):
    regex: str
    mode: Literal["search", "match", "fullmatch", "split", "findall"] = "fullmatch"


ParserType: TypeAlias = Literal["json", "jsonl", "yaml"] | PdlParser | RegexParser
RoleType: TypeAlias = Optional[str]


class ContributeTarget(StrEnum):
    RESULT = "result"
    CONTEXT = "context"


class ContributeValue(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: list[Any]


class Block(BaseModel):
    """Common fields for all PDL blocks."""

    model_config = ConfigDict(
        extra="forbid",
        use_attribute_docstrings=True,
        arbitrary_types_allowed=True,
    )

    description: Optional[str] = None
    """Documentation associated to the block.
    """
    spec: Any = None
    """Type specification of the result of the block.
    """
    defs: dict[str, "BlockType"] = {}
    """Set of definitions executed before the execution of the block.
    """
    assign: Optional[str] = Field(default=None, alias="def")
    """Name of the variable used to store the result of the execution of the block.
    """
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]] = [
        ContributeTarget.RESULT,
        ContributeTarget.CONTEXT,
    ]
    """Indicate if the block contributes to the result and background context.
    """
    parser: Optional[ParserType] = None
    """Parser to use to construct a value out of a string result."""
    fallback: Optional["BlockType"] = None
    """Block to execute in case of error.
    """
    role: RoleType = None
    """Role associated to the block and sub-blocks.
    """
    start_nanos: Optional[int] = 0
    """Time at which block execution began
    """
    end_nanos: Optional[int] = 0
    """Time at which block execution ended
    """
    timezone: Optional[str] = ""
    """Timezone of start_nanos and end_nanos
    """
    context: Optional[Messages] = []
    # Fields for internal use
    result: Optional[Any] = None
    location: Optional[LocationType] = None


class FunctionBlock(Block):
    """Function declaration."""

    kind: Literal[BlockKind.FUNCTION] = BlockKind.FUNCTION
    function: Optional[dict[str, Any]]
    """Functions parameters with their types.
    """
    returns: "BlockType" = Field(..., alias="return")
    """Body of the function
    """
    # Field for internal use
    scope: Optional[ScopeType] = None


class CallBlock(Block):
    """Calling a function."""

    kind: Literal[BlockKind.CALL] = BlockKind.CALL
    call: ExpressionType
    """Function to call.
    """
    args: ExpressionType = {}
    """Arguments of the function with their values.
    """
    # Field for internal use
    trace: Optional["BlockType"] = None


class LitellmParameters(BaseModel):
    """Parameters passed to LiteLLM. More details at https://docs.litellm.ai/docs/completion/input."""

    model_config = ConfigDict(extra="allow", protected_namespaces=())
    timeout: Optional[Union[float, str]] | str = None
    """Timeout in seconds for completion requests (Defaults to 600 seconds).
    """
    temperature: Optional[float] | str = None
    """The temperature parameter for controlling the randomness of the output (default is 1.0).
    """
    top_p: Optional[float] | str = None
    """The top-p parameter for nucleus sampling (default is 1.0).
    """
    n: Optional[int] | str = None
    """The number of completions to generate (default is 1).
    """
    # stream: Optional[bool] = None
    # """If True, return a streaming response (default is False).
    # """
    # stream_options: Optional[dict] = None
    # """A dictionary containing options for the streaming response. Only set this when you set stream: true.
    # """
    stop: Optional[str | list[str]] | str = None
    """Up to 4 sequences where the LLM API will stop generating further tokens.
    """
    max_tokens: Optional[int] | str = None
    """The maximum number of tokens in the generated completion (default is infinity).
    """
    presence_penalty: Optional[float] | str = None
    """It is used to penalize new tokens based on their existence in the text so far.
    """
    frequency_penalty: Optional[float] | str = None
    """It is used to penalize new tokens based on their frequency in the text so far.
    """
    logit_bias: Optional[dict] | str = None
    """Used to modify the probability of specific tokens appearing in the completion.
    """
    user: Optional[str] | str = None
    """A unique identifier representing your end-user. This can help the LLM provider to monitor and detect abuse.
    """
    # openai v1.0+ new params
    response_format: Optional[dict] | str = None
    seed: Optional[int] | str = None
    tools: Optional[list] | str = None
    tool_choice: Optional[Union[str, dict]] | str = None
    logprobs: Optional[bool] | str = None
    """Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message
    """
    top_logprobs: Optional[int] | str = None
    """top_logprobs (int, optional): An integer between 0 and 5 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.
    """
    parallel_tool_calls: Optional[bool] | str = None
    # deployment_id = None
    extra_headers: Optional[dict] | str = None
    """Additional headers to include in the request.
    """
    # soon to be deprecated params by OpenAI
    functions: Optional[list] | str = None
    """A list of functions to apply to the conversation messages (default is an empty list)
    """
    function_call: Optional[str] | str = None
    """The name of the function to call within the conversation (default is an empty string)
    """
    # set api_base, api_version, api_key
    base_url: Optional[str] | str = None
    """Base URL for the API (default is None).
    """
    api_version: Optional[str] | str = None
    """API version (default is None).
    """
    api_key: Optional[str] | str = None
    """API key (default is None).
    """
    model_list: Optional[list] | str = None  # pass in a list of api_base,keys, etc.
    """List of api base, version, keys.
    """
    # Optional liteLLM function params
    mock_response: Optional[str] | str = None
    """If provided, return a mock completion response for testing or debugging purposes (default is None).
    """
    custom_llm_provider: Optional[str] | str = None
    """Used for Non-OpenAI LLMs, Example usage for bedrock, set model="amazon.titan-tg1-large" and custom_llm_provider="bedrock"
    """
    max_retries: Optional[int] | str = None
    """The number of retries to attempt (default is 0).
    """


class ModelPlatform(StrEnum):
    LITELLM = "litellm"


class ModelBlock(Block):
    kind: Literal[BlockKind.MODEL] = BlockKind.MODEL
    model: str | ExpressionType
    input: Optional["BlockType"] = None
    trace: Optional["BlockType"] = None
    modelResponse: Optional[str] = None


class LitellmModelBlock(ModelBlock):
    """Call a LLM through the LiteLLM API: https://docs.litellm.ai/."""

    platform: Literal[ModelPlatform.LITELLM] = ModelPlatform.LITELLM
    parameters: Optional[LitellmParameters | ExpressionType] = None


class CodeBlock(Block):
    """Execute a piece of code."""

    kind: Literal[BlockKind.CODE] = BlockKind.CODE
    lang: Literal["python", "command", "jinja", "pdl"]
    """Programming language of the code.
    """
    code: "BlockType"
    """Code to execute.
    """


class GetBlock(Block):
    """Get the value of a variable."""

    kind: Literal[BlockKind.GET] = BlockKind.GET
    get: str
    """Name of the variable to access."""


class DataBlock(Block):
    """Arbitrary JSON value."""

    kind: Literal[BlockKind.DATA] = BlockKind.DATA
    data: ExpressionType
    """Value defined."""
    raw: bool = False
    """Do not evaluate expressions inside strings."""


class TextBlock(Block):
    """Create the concatenation of the stringify version of the result of each block of the list of blocks."""

    kind: Literal[BlockKind.TEXT] = BlockKind.TEXT
    text: "BlockOrBlocksType"
    """Body of the text.
    """


class LastOfBlock(Block):
    """Return the value of the last block if the list of blocks."""

    kind: Literal[BlockKind.LASTOF] = BlockKind.LASTOF
    lastOf: list["BlockType"]


class ArrayBlock(Block):
    """Return the array of values computed by each block of the list of blocks."""

    kind: Literal[BlockKind.ARRAY] = BlockKind.ARRAY
    array: list["BlockType"]


class ObjectBlock(Block):
    """Return the object where the value of each field is defined by a block. If the body of the object is an array, the resulting object is the union of the objects computed by each element of the array."""

    kind: Literal[BlockKind.OBJECT] = BlockKind.OBJECT
    object: dict[str, "BlockType"] | list["BlockType"]


class MessageBlock(Block):
    """Create a message."""

    kind: Literal[BlockKind.MESSAGE] = BlockKind.MESSAGE
    role: RoleType  # pyright: ignore
    """Role of associated to the message."""  # pyright: ignore
    content: "BlockType"
    """Content of the message."""


class IfBlock(Block):
    """Conditional control structure."""

    kind: Literal[BlockKind.IF] = BlockKind.IF
    condition: ExpressionType = Field(alias="if")
    """Condition.
    """
    then: "BlockType"
    """Branch to exectute if the condition is true.
    """
    elses: Optional["BlockType"] = Field(default=None, alias="else")
    """Branch to execute if the condition is false.
    """
    # Field for internal use
    if_result: Optional[bool] = None


class MatchCase(BaseModel):
    """Case of a match."""

    model_config = ConfigDict(extra="forbid")
    case: Optional[PatternType] = None
    """Value to match.
    """
    if_: Optional[ExpressionType] = Field(default=None, alias="if")
    """Boolean condition to satisfy.
    """
    then: "BlockType"
    """Branch to execute if the value is matched and the condition is satisfied.
    """


class MatchBlock(Block):
    """Match control structure."""

    kind: Literal[BlockKind.MATCH] = BlockKind.MATCH
    match_: ExpressionType = Field(alias="match")
    """Matched expression.
    """
    with_: list[MatchCase] = Field(alias="with")


class IterationType(StrEnum):
    LASTOF = "lastOf"
    ARRAY = "array"
    TEXT = "text"


class JoinConfig(BaseModel):
    """Configure how loop iterations should be combined."""

    model_config = ConfigDict(extra="forbid", use_attribute_docstrings=True)


class JoinText(JoinConfig):
    iteration_type: Literal[IterationType.TEXT] = Field(
        alias="as", default=IterationType.TEXT
    )
    """String concatenation of the result of each iteration.
    """

    join_string: str = Field(alias="with", default="")
    """String used to concatenate each iteration of the loop.
    """


class JoinArray(JoinConfig):
    iteration_type: Literal[IterationType.ARRAY] = Field(alias="as")
    """Return the result of each iteration as an array.
    """


class JoinLastOf(JoinConfig):
    iteration_type: Literal[IterationType.LASTOF] = Field(alias="as")
    """Return the result of the last iteration.
    """


JoinType: TypeAlias = JoinText | JoinArray | JoinLastOf


class ForBlock(Block):
    """Iteration over arrays."""

    kind: Literal[BlockKind.FOR] = BlockKind.FOR
    fors: dict[str, ExpressionType] = Field(alias="for")
    """Arrays to iterate over.
    """
    repeat: "BlockType"
    """Body of the loop.
    """
    join: JoinType = JoinText()
    """Define how to combine the result of each iteration.
    """
    # Field for internal use
    trace: Optional[list["BlockType"]] = None


class RepeatBlock(Block):
    """Repeat the execution of a block for a fixed number of iterations."""

    kind: Literal[BlockKind.REPEAT] = BlockKind.REPEAT
    repeat: "BlockType"
    """Body of the loop.
    """
    num_iterations: int
    """Number of iterations to perform.
    """
    join: JoinType = JoinText()
    """Define how to combine the result of each iteration.
    """
    # Field for internal use
    trace: Optional[list["BlockType"]] = None


class RepeatUntilBlock(Block):
    """Repeat the execution of a block until a condition is satisfied."""

    kind: Literal[BlockKind.REPEAT_UNTIL] = BlockKind.REPEAT_UNTIL
    repeat: "BlockType"
    """Body of the loop.
    """
    until: ExpressionType
    """Condition of the loop.
    """
    join: JoinType = JoinText()
    """Define how to combine the result of each iteration.
    """
    # Field for internal use
    trace: Optional[list["BlockType"]] = None


class ReadBlock(Block):
    """Read from a file or standard input."""

    kind: Literal[BlockKind.READ] = BlockKind.READ
    read: ExpressionType | None
    """Name of the file to read. If `None`, read the standard input.
    """
    message: Optional[str] = None
    """Message to prompt the user to enter a value.
    """
    multiline: bool = False
    """Indicate if one or multiple lines shoud be read.
    """


class IncludeBlock(Block):
    """Include a PDL file."""

    kind: Literal[BlockKind.INCLUDE] = BlockKind.INCLUDE
    include: str
    """Name of the file to include.
    """
    # Field for internal use
    trace: Optional["BlockType"] = None


class ErrorBlock(Block):
    kind: Literal[BlockKind.ERROR] = BlockKind.ERROR
    msg: str
    program: "BlockType"


class EmptyBlock(Block):
    """Block without an action. It can contain definitions."""

    kind: Literal[BlockKind.EMPTY] = BlockKind.EMPTY


AdvancedBlockType: TypeAlias = (
    FunctionBlock
    | CallBlock
    | LitellmModelBlock
    | CodeBlock
    | GetBlock
    | DataBlock
    | IfBlock
    | MatchBlock
    | RepeatBlock
    | RepeatUntilBlock
    | ForBlock
    | TextBlock
    | LastOfBlock
    | ArrayBlock
    | ObjectBlock
    | MessageBlock
    | ReadBlock
    | IncludeBlock
    | ErrorBlock
    | EmptyBlock
)
"""Different types of structured blocks.
"""
BlockType: TypeAlias = None | bool | int | float | str | AdvancedBlockType
"""All kinds of blocks.
"""
BlockOrBlocksType: TypeAlias = BlockType | list[BlockType]  # pyright: ignore
"""Block or list of blocks.
"""


class Program(RootModel):
    """
    Prompt Declaration Language program (PDL)
    """

    root: BlockType
    """Entry point to parse a PDL program using Pydantic.
    """


class PdlBlock(RootModel):
    # This class is used to introduce that a type in the generate JsonSchema
    root: BlockType


class PDLException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


MAX_NEW_TOKENS = 1024
MIN_NEW_TOKENS = 1
REPETITION_PENALTY = 1.05
TEMPERATURE_SAMPLING = 0.7
TOP_P_SAMPLING = 0.85
TOP_K_SAMPLING = 50
DECODING_METHOD = "greedy"


def set_structured_decoding_parameters(
    spec: Any,
    parameters: Optional[dict[str, Any]],
) -> dict[str, Any]:
    if parameters is None:
        parameters = {}

    if (
        spec is not None
        and parameters["response_format"] is None
        and "guided_decoding_backend" not in parameters
    ):
        schema = pdltype_to_jsonschema(spec, True)
        parameters["guided_decoding_backend"] = "lm-format-enforcer"
        parameters["guided_json"] = schema
        # parameters["response_format"] = { "type": "json_schema", "json_schema": schema , "strict": True }
    return parameters


def get_default_model_parameters() -> list[dict[str, Any]]:
    """Model-specific defaults to apply"""
    return [
        {
            "*watsonx/*": {
                "temperature": 0,
            },
        },
        {
            "*watsonx_text*": {
                "decoding_method": DECODING_METHOD,
                "max_tokens": MAX_NEW_TOKENS,
                "min_new_tokens": MIN_NEW_TOKENS,
                "repetition_penalty": REPETITION_PENALTY,
            },
        },
        {
            "replicate*granite-3.0*": {
                "temperature": 0,
                "roles": {
                    "system": {
                        "pre_message": "<|start_of_role|>system<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "user": {
                        "pre_message": "<|start_of_role|>user<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "assistant": {
                        "pre_message": "<|start_of_role|>assistant<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "available_tools": {
                        "pre_message": "<|start_of_role|>available_tools<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "tool_response": {
                        "pre_message": "<|start_of_role|>tool_response<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                },
                "final_prompt_value": "<|start_of_role|>assistant<|end_of_role|>",
            }
        },
    ]


def get_sampling_defaults() -> list[dict[str, Any]]:
    """Model-specific defaults to apply if we are sampling."""
    return [
        {
            "*": {
                "temperature": TEMPERATURE_SAMPLING,
                "top_k": TOP_K_SAMPLING,
                "top_p": TOP_P_SAMPLING,
            }
        }
    ]
