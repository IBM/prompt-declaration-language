"""PDL programs are represented by the Pydantic data structure defined in this file.
"""

from enum import StrEnum
from typing import (
    Annotated,
    Any,
    Generic,
    Literal,
    Mapping,
    Optional,
    Sequence,
    TypeAlias,
    TypeVar,
    Union,
)

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, RootModel
from pydantic.json_schema import SkipJsonSchema

from .pdl_lazy import PdlDict, PdlLazy
from .pdl_schema_utils import pdltype_to_jsonschema


def _ensure_lower(value):
    if isinstance(value, str):
        return value.lower()
    return value


ScopeType: TypeAlias = PdlDict[str, Any]


ModelInput: TypeAlias = Sequence[Mapping[str, Any]]


LazyMessage: TypeAlias = PdlLazy[dict[str, Any]]
LazyMessages: TypeAlias = PdlLazy[list[dict[str, Any]]]


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
    READ = "read"
    INCLUDE = "include"
    IMPORT = "import"
    EMPTY = "empty"
    ERROR = "error"


class PdlLocationType(BaseModel):
    """Internal data structure to keep track of the source location information."""

    model_config = ConfigDict(extra="forbid")
    path: list[str]
    file: str
    table: dict[str, int]


empty_block_location = PdlLocationType(file="", path=[], table={})


LocalizedExpressionT = TypeVar("LocalizedExpressionT")


class LocalizedExpression(BaseModel, Generic[LocalizedExpressionT]):
    """Internal data structure for expressions with location information."""

    model_config = ConfigDict(
        extra="forbid",
        use_attribute_docstrings=True,
        arbitrary_types_allowed=True,
        model_title_generator=(lambda _: "LocalizedExpression"),
    )
    expr: LocalizedExpressionT
    pdl__location: Optional[PdlLocationType] = None


ExpressionTypeT = TypeVar("ExpressionTypeT")
ExpressionType: TypeAlias = ExpressionTypeT | str | LocalizedExpression[ExpressionTypeT]


class Pattern(BaseModel):
    """Patterns allowed to match values in a `case` clause."""

    model_config = ConfigDict(extra="forbid")
    def_: Optional[str] = Field(default=None, alias="def")
    """Name of the variable used to store the value matched by the pattern.
    """


class OrPattern(Pattern):
    anyOf: list["PatternType"]
    """Match any of the patterns."""


class ArrayPattern(Pattern):
    array: list["PatternType"]
    """Match an array."""


class ObjectPattern(Pattern):
    object: dict[str, "PatternType"]
    """Match an object."""


class AnyPattern(Pattern):
    any: Literal[None]
    """Match any value."""


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
    """Common fields for all parsers (`parser` field)."""

    model_config = ConfigDict(extra="forbid")
    description: Optional[str] = None
    """Documentation associated to the parser.
    """
    spec: Optional[dict[str, Any]] = None
    """Expected type of the parsed value.
    """


class PdlParser(Parser):
    pdl: "BlockType"
    """Use a PDL program as a parser specification."""


class RegexParser(Parser):
    """A regular expression parser"""

    regex: str
    """Regular expression to parse the value."""
    mode: Annotated[
        Literal["search", "match", "fullmatch", "split", "findall"],
        BeforeValidator(_ensure_lower),
    ] = "fullmatch"
    """Function used to parse to value (https://docs.python.org/3/library/re.html)."""


ParserType: TypeAlias = Literal["json", "jsonl", "yaml"] | PdlParser | RegexParser


RoleType: TypeAlias = Optional[str]


class ContributeTarget(StrEnum):
    RESULT = "result"
    CONTEXT = "context"


class ContributeValue(BaseModel):
    value: ExpressionType[list[Any]]
    model_config = ConfigDict(extra="forbid")


class PdlTiming(BaseModel):
    """Internal data structure to record timing information in the trace."""

    model_config = ConfigDict(extra="forbid")
    start_nanos: Optional[int] = 0
    """Time at which block execution began.
    """
    end_nanos: Optional[int] = 0
    """Time at which block execution ended.
    """
    first_use_nanos: Optional[int] = 0
    """Time at which the value of the block was needed for the first time.
    """
    timezone: Optional[str] = ""
    """Timezone of start_nanos and end_nanos.
    """


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
    def_: Optional[str] = Field(default=None, alias="def")
    """Name of the variable used to store the result of the execution of the block.
    """
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]] = [
        ContributeTarget.RESULT,
        ContributeTarget.CONTEXT,
    ]
    """Indicate if the block contributes to the result and background context.
    """
    parser: Annotated[Optional[ParserType], BeforeValidator(_ensure_lower)] = None
    """Parser to use to construct a value out of a string result."""
    fallback: Optional["BlockType"] = None
    """Block to execute in case of error.
    """
    role: RoleType = None
    """Role associated to the block and sub-blocks.
    Typical roles are `system`, `user`, and `assistant`,
    but there may be other roles such as `available_tools`.
    """
    context: Optional[ModelInput] = []
    """Current context
    """
    # Fields for internal use
    pdl__id: Optional[str] = ""
    """Unique identifier for this block
    """
    pdl__result: Optional[Any] = None
    """Result of the execution of the block"""
    pdl__location: Optional[PdlLocationType] = None
    pdl__timing: Optional[PdlTiming] = None


class LeafBlock(Block):
    # Field for internal use
    pdl__is_leaf: Literal[True] = True


class StructuredBlock(Block):
    # Field for internal use
    pdl__is_leaf: Literal[False] = False


class FunctionBlock(LeafBlock):
    """Function declaration."""

    kind: Literal[BlockKind.FUNCTION] = BlockKind.FUNCTION
    function: Optional[dict[str, Any]]
    """Functions parameters with their types.
    """
    returns: "BlockType" = Field(..., alias="return")
    """Body of the function
    """
    # Field for internal use
    pdl__scope: SkipJsonSchema[Optional[ScopeType]] = Field(default=None, repr=False)


class CallBlock(LeafBlock):
    """Calling a function."""

    kind: Literal[BlockKind.CALL] = BlockKind.CALL
    call: ExpressionType
    """Function to call.
    """
    args: ExpressionType = {}
    """Arguments of the function with their values.
    """
    # Field for internal use
    pdl__trace: Optional["BlockType"] = None


class LitellmParameters(BaseModel):
    """Parameters passed to LiteLLM. More details at [https://docs.litellm.ai/docs/completion/input](https://docs.litellm.ai/docs/completion/input).

    Note that not all models and platforms accept all parameters.
    """

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
    GRANITEIO = "granite-io"


class ModelBlock(LeafBlock):
    """Common fields for the `model` blocks."""

    kind: Literal[BlockKind.MODEL] = BlockKind.MODEL
    model: ExpressionType
    """Model to use.
    """
    input: "BlockType" = "${ pdl_context }"
    """Messages to send to the model.
    """
    modelResponse: Optional[str] = None
    """Variable where to store the raw response of the model.
    """
    # Field for internal use
    pdl__trace: Optional["BlockType"] = None


class LitellmModelBlock(ModelBlock):
    """
    Call an LLM through [the LiteLLM API](https://docs.litellm.ai/).

    Example:
    ```PDL
    - model: ollama/granite-code:8b
      parameters:
        stop: ['!']
    ```
    """

    platform: Literal[ModelPlatform.LITELLM] = ModelPlatform.LITELLM
    """Optional field to ensure that the block is using LiteLLM.
    """
    model: ExpressionType[str]
    """Name of the model following the LiteLLM convention.
    """
    parameters: Optional[LitellmParameters | ExpressionType[dict]] = None
    """Parameters to send to the model.
    """


class GraniteioModelBlock(ModelBlock):
    """Call an LLM through the granite-io API."""

    platform: Literal[ModelPlatform.GRANITEIO] = ModelPlatform.GRANITEIO
    """Optional field to ensure that the block is using granite-io.
    """
    model: ExpressionType[object]
    """Model name used by the backend.
    """
    backend: ExpressionType[str | dict[str, Any]]
    """Backend name and configuration.
    """
    processor: Optional[ExpressionType[str]] = None
    """IO Processor name.
    """
    parameters: Optional[ExpressionType[dict[str, Any]]] = None
    """Parameters sent to the model.
    """


class CodeBlock(LeafBlock):
    """
    Execute a piece of code.

    Example:
    ```PDL
    - def: N
      lang: python
      code: |
        import random
        # (In PDL, set `result` to the output you wish for your code block.)
        result = random.randint(1, 20)
    ```
    """

    kind: Literal[BlockKind.CODE] = BlockKind.CODE
    lang: Annotated[
        Literal["python", "command", "jinja", "pdl"], BeforeValidator(_ensure_lower)
    ]
    """Programming language of the code.
    """
    code: "BlockType"
    """Code to execute.
    """


class GetBlock(LeafBlock):
    """
    Get the value of a variable.

    The GetBlock is deprecated.  Use DataBlock instead.
    """

    kind: Literal[BlockKind.GET] = BlockKind.GET
    get: str
    """Name of the variable to access."""


class DataBlock(LeafBlock):
    """
    Arbitrary value, equivalent to JSON.

    Example. As part of a `defs` section, set `numbers` to the list `[1, 2, 3, 4]`:
    ```PDL
    defs:
      numbers:
        data: [1, 2, 3, 4]
    ```

    Example.  Evaluate `${ TEST.answer }` in
    [Jinja](https://jinja.palletsprojects.com/en/stable/), passing
    the result to a regex parser with capture groups.  Set
    `EXTRACTED_GROUND_TRUTH` to an object with attribute `answer`,
    a string, containing the value of the capture group.
    ```PDL
    - data: ${ TEST.answer }
      parser:
        regex: "(.|\\n)*#### (?P<answer>([0-9])*)\\n*"
        spec:
          answer: str
      def: EXTRACTED_GROUND_TRUTH
    ```
    """

    kind: Literal[BlockKind.DATA] = BlockKind.DATA
    data: ExpressionType[Any]
    """Value defined."""
    raw: bool = False
    """Do not evaluate expressions inside strings."""


class TextBlock(StructuredBlock):
    """Create the concatenation of the stringify version of the result of each block of the list of blocks."""

    kind: Literal[BlockKind.TEXT] = BlockKind.TEXT
    text: "BlockOrBlocksType"
    """Body of the text.
    """


class LastOfBlock(StructuredBlock):
    """Return the value of the last block if the list of blocks."""

    kind: Literal[BlockKind.LASTOF] = BlockKind.LASTOF
    lastOf: list["BlockType"]
    """Sequence of blocks to execute."""


class ArrayBlock(StructuredBlock):
    """Return the array of values computed by each block of the list of blocks."""

    kind: Literal[BlockKind.ARRAY] = BlockKind.ARRAY
    array: list["BlockType"]
    """Elements of the array."""


class ObjectBlock(StructuredBlock):
    """Return the object where the value of each field is defined by a block. If the body of the object is an array, the resulting object is the union of the objects computed by each element of the array."""

    kind: Literal[BlockKind.OBJECT] = BlockKind.OBJECT
    object: dict[str, "BlockType"] | list["BlockType"]


class MessageBlock(StructuredBlock):
    """Create a message."""

    kind: Literal[BlockKind.MESSAGE] = BlockKind.MESSAGE
    role: RoleType  # pyright: ignore
    """Role of associated to the message.
    Typical roles are `system`, `user`, and `assistant`,
    but there may be other roles such as `available_tools`.
    """  # pyright: ignore
    content: "BlockType"
    """Content of the message."""


class IfBlock(StructuredBlock):
    """
    Conditional control structure.

    Example:
    ```PDL
    - if: ${ eval == 'no' }
      then:
        text:
        - read:
          message: "Why not?\\n"
    ```
    """

    kind: Literal[BlockKind.IF] = BlockKind.IF
    condition: ExpressionType[bool] = Field(alias="if")
    """Condition.
    """
    then: "BlockType"
    """Branch to execute if the condition is true.
    """
    else_: Optional["BlockType"] = Field(default=None, alias="else")
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
    if_: Optional[ExpressionType[bool]] = Field(default=None, alias="if")
    """Boolean condition to satisfy.
    """
    then: "BlockType"
    """Branch to execute if the value is matched and the condition is satisfied.
    """
    # Field for internal use
    pdl__case_result: Optional[bool] = None
    pdl__if_result: Optional[bool] = None
    pdl__matched: Optional[bool] = None


class MatchBlock(StructuredBlock):
    """Match control structure."""

    kind: Literal[BlockKind.MATCH] = BlockKind.MATCH
    match_: ExpressionType[Any] = Field(alias="match")
    """Matched expression.
    """
    with_: list[MatchCase] = Field(alias="with")
    """List of cases to match.
    """


class IterationType(StrEnum):
    LASTOF = "lastOf"
    ARRAY = "array"
    OBJECT = "object"
    TEXT = "text"


class JoinConfig(BaseModel):
    """Configure how loop iterations should be combined."""

    model_config = ConfigDict(extra="forbid", use_attribute_docstrings=True)


class JoinText(JoinConfig):
    as_: Literal[IterationType.TEXT] = Field(alias="as", default=IterationType.TEXT)
    """String concatenation of the result of each iteration.
    """

    with_: str = Field(alias="with", default="")
    """String used to concatenate each iteration of the loop.
    """


class JoinArray(JoinConfig):
    as_: Literal[IterationType.ARRAY] = Field(alias="as")
    """Return the result of each iteration as an array.
    """


class JoinObject(JoinConfig):
    as_: Literal[IterationType.OBJECT] = Field(alias="as")
    """Return the union of the objects created at each iteration.
    """


class JoinLastOf(JoinConfig):
    as_: Literal[IterationType.LASTOF] = Field(alias="as")
    """Return the result of the last iteration.
    """


JoinType: TypeAlias = JoinText | JoinArray | JoinObject | JoinLastOf


class RepeatBlock(StructuredBlock):
    """
    Repeat the execution of a block.

    For loop example:
    ```PDL
    for:
        number: [1, 2, 3, 4]
        name: ["Bob", "Carol", "David", "Ernest"]
    repeat:
        "${ name }'s number is ${ number }\\n"
    ```
    """

    kind: Literal[BlockKind.REPEAT] = BlockKind.REPEAT
    for_: Optional[dict[str, ExpressionType[list]]] = Field(default=None, alias="for")
    """Arrays to iterate over.
    """
    while_: ExpressionType[bool] = Field(default=True, alias="while")
    """Condition to stay at the beginning of the loop.
    """
    repeat: "BlockType"
    """Body of the loop.
    """
    until: ExpressionType[bool] = False
    """Condition to exit at the end of the loop.
    """
    max_iterations: Optional[ExpressionType[int]] = None
    """Maximal number of iterations to perform.
    """
    join: JoinType = JoinText()
    """Define how to combine the result of each iteration.
    """
    # Field for internal use
    pdl__trace: Optional[list["BlockType"]] = None


class ReadBlock(LeafBlock):
    """Read from a file or standard input."""

    kind: Literal[BlockKind.READ] = BlockKind.READ
    read: ExpressionType[str] | None
    """Name of the file to read. If `None`, read the standard input.
    """
    message: Optional[str] = None
    """Message to prompt the user to enter a value.
    """
    multiline: bool = False
    """Indicate if one or multiple lines should be read.
    """


class IncludeBlock(StructuredBlock):
    """Include a PDL file."""

    kind: Literal[BlockKind.INCLUDE] = BlockKind.INCLUDE
    include: str
    """Name of the file to include.
    """
    # Field for internal use
    pdl__trace: Optional["BlockType"] = None


class ImportBlock(LeafBlock):
    """Import a PDL file."""

    kind: Literal[BlockKind.IMPORT] = BlockKind.IMPORT
    import_: str = Field(alias="import")
    """Name of the file to import.
    """
    # Field for internal use
    pdl__trace: Optional["BlockType"] = None


class ErrorBlock(LeafBlock):
    """Block representing an error generated at runtime."""

    kind: Literal[BlockKind.ERROR] = BlockKind.ERROR
    msg: str
    """Error message.
    """
    program: "BlockType"
    """Block that raised the error.
    """


class EmptyBlock(LeafBlock):
    """Block without an action. It can contain definitions."""

    kind: Literal[BlockKind.EMPTY] = BlockKind.EMPTY


AdvancedBlockType: TypeAlias = (
    FunctionBlock
    | CallBlock
    | LitellmModelBlock
    | GraniteioModelBlock
    | CodeBlock
    | GetBlock
    | DataBlock
    | IfBlock
    | MatchBlock
    | RepeatBlock
    | TextBlock
    | LastOfBlock
    | ArrayBlock
    | ObjectBlock
    | MessageBlock
    | ReadBlock
    | IncludeBlock
    | ImportBlock
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


class PDLRuntimeError(PDLException):
    def __init__(
        self,
        message: str,
        loc: Optional[PdlLocationType] = None,
        trace: Optional[BlockType] = None,
        fallback: Optional[Any] = None,
    ):
        super().__init__(message)
        self.loc = loc
        self.pdl__trace = trace
        self.fallback = fallback
        self.message = message


class PDLRuntimeExpressionError(PDLRuntimeError):
    pass


class PDLRuntimeParserError(PDLRuntimeError):
    pass


class PDLRuntimeProcessBlocksError(PDLException):
    def __init__(
        self,
        message: str,
        blocks: list[BlockType],
        loc: Optional[PdlLocationType] = None,
        fallback: Optional[Any] = None,
    ):
        super().__init__(message)
        self.loc = loc
        self.blocks = blocks
        self.fallback = fallback
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
        and "response_format" not in parameters
        and "guided_decoding_backend" not in parameters
    ):
        schema = pdltype_to_jsonschema(spec, True)

        parameters["guided_decoding_backend"] = "lm-format-enforcer"
        parameters["guided_json"] = schema
        parameters["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": "schema",
                "schema": schema,
                "strict": True,
            },
        }
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
        # Note that Replicate may no longer support granite 3.0
        {
            "*granite-3.0*": {
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
        # Note that we match both granite-3.0 and 3.1 rather than using a granite-3.* wildcard
        {
            "*granite-3.1*": {
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
                    "tools": {
                        "pre_message": "<|start_of_role|>tools<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "tool_response": {
                        "pre_message": "<|start_of_role|>tool_response<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "documents": {
                        "pre_message": "<|start_of_role|>documents<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                },
                "final_prompt_value": "<|start_of_role|>assistant<|end_of_role|>",
            }
        },
        {
            "*granite-3.2*": {
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
                    "tools": {
                        "pre_message": "<|start_of_role|>tools<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "tool_response": {
                        "pre_message": "<|start_of_role|>tool_response<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                    "documents": {
                        "pre_message": "<|start_of_role|>documents<|end_of_role|>",
                        "post_message": "<|end_of_text|>",
                    },
                },
                "final_prompt_value": "<|start_of_role|>assistant<|end_of_role|>",
            }
        },
        # models on Ollama (e.g. granite-code, granite3-dense, granite3.1-dense)
        {
            "ollama/*": {
                "temperature": 0,
            },
        },
        {
            "ollama_chat/*": {
                "temperature": 0,
            },
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
