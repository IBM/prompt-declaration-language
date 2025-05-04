import fnmatch
import json
from typing import Any, Generator, Generic, Sequence, TypeVar

from .pdl_ast import (
    ContributeTarget,
    ContributeValue,
    ExpressionType,
    FunctionBlock,
    LazyMessages,
    LocalizedExpression,
    get_sampling_defaults,
)
from .pdl_lazy import lazy_apply2

GeneratorWrapperYieldT = TypeVar("GeneratorWrapperYieldT")
GeneratorWrapperSendT = TypeVar("GeneratorWrapperSendT")
GeneratorWrapperReturnT = TypeVar("GeneratorWrapperReturnT")


class GeneratorWrapper(
    Generic[GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT]
):
    value: GeneratorWrapperReturnT

    def __init__(
        self,
        gen: Generator[
            GeneratorWrapperYieldT, GeneratorWrapperSendT, GeneratorWrapperReturnT
        ],
    ):
        self.gen = gen

    def __iter__(self):
        self.value = yield from self.gen


GeneratorReturnT = TypeVar("GeneratorReturnT")


def step_to_completion(gen: Generator[Any, Any, GeneratorReturnT]) -> GeneratorReturnT:
    w = GeneratorWrapper(gen)
    for _ in w:
        pass
    return w.value


ToAsyncT = TypeVar("ToAsyncT")


async def to_async(value: ToAsyncT) -> ToAsyncT:
    return value


def stringify(result):
    if isinstance(result, str):
        s = result
    elif isinstance(result, FunctionBlock):
        s = ""
    else:
        try:
            s = json.dumps(result)
        except TypeError:
            s = str(result)
    return s


ValueOfExprT = TypeVar("ValueOfExprT")


def value_of_expr(expr: ExpressionType[ValueOfExprT]) -> ValueOfExprT:
    if isinstance(expr, LocalizedExpression):
        if "pdl__result" in expr.model_fields_set:
            v = expr.pdl__result
        else:
            v = expr.pdl__expr
    else:
        v = expr
    return v  # type: ignore


def replace_contribute_value(
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]],
    value: ContributeValue,
):
    ret = []
    for item in contribute:
        if isinstance(item, dict) and isinstance(
            item[ContributeTarget.CONTEXT], ContributeValue
        ):
            item = value
        ret.append(item)
    return ret


def get_contribute_value(
    contribute: Sequence[ContributeTarget | dict[str, ContributeValue]] | None,
):
    if contribute is None:
        return None
    for item in contribute:
        if isinstance(item, dict) and isinstance(
            item[ContributeTarget.CONTEXT], ContributeValue
        ):
            return item[ContributeTarget.CONTEXT].value
    return None


def _messages_concat(
    messages1: list[dict[str, Any]], messages2: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    return messages1 + messages2


def lazy_messages_concat(
    messages1: LazyMessages, messages2: LazyMessages
) -> LazyMessages:
    return lazy_apply2(_messages_concat, messages1, messages2)


def messages_to_str(messages: LazyMessages) -> str:
    return "\n".join([str(msg) for msg in messages.result()])


def remove_none_values_from_message(message: dict) -> dict[str, Any]:
    ret = {}
    for key, value in message.items():
        if key == "content":
            ret[key] = value
        if value is not None:
            if isinstance(value, dict):
                ret[key] = remove_none_values_from_message(value)
            else:
                ret[key] = value
    return ret


def apply_defaults(
    model_id: str,
    params: dict[str, Any],
    all_model_defaults: list[dict[str, dict[str, Any]]],
) -> dict[str, Any]:
    # Never apply defaults to granite-20b-code-instruct-r1.1
    if "granite-20b-code-instruct-r1.1" in model_id:
        return params

    parameters = apply_raw_defaults(model_id, params, all_model_defaults)

    if "decoding_method" in parameters and parameters["decoding_method"] == "sample":
        parameters = apply_raw_defaults(model_id, parameters, get_sampling_defaults())

    return parameters


def apply_raw_defaults(
    model_id: str,
    params: dict[str, Any],
    model_defaults: list[dict[str, dict[str, Any]]],
) -> dict[str, Any]:
    """Apply defaults to params based on a list of model defaults

    Args:
        model_id: A PDL model ID
        params: The explicit parameters set by in PDL
        model_defaults: A list of dicts, where the keys are globs for model id, and the value is a dict of defaults

    Returns:
        The parameters to send to the LLM
    """

    assert isinstance(model_id, str), f"model_id is a {type(model_id)}"
    assert params is None or isinstance(params, dict), f"params is a {type(params)}"
    assert isinstance(
        model_defaults, list
    ), f"model_defaults is a {type(model_defaults)}"

    # Construct defaults for this model.  If more than one set of default
    # applies, the last seen default "wins".
    default_union = {}
    for model_default in model_defaults:
        assert isinstance(model_default, dict)
        for model_glob, glob_defaults in model_default.items():
            if not isinstance(glob_defaults, dict):
                raise ValueError(
                    f"invalid default type {type(glob_defaults)} for model matcher {model_glob}"
                )
            assert isinstance(glob_defaults, dict)
            if fnmatch.fnmatchcase(model_id, model_glob):
                # print(f"model {model_id} matches {model_glob}, applying {glob_defaults}")
                for k, v in glob_defaults.items():
                    default_union[k] = v

    # Apply final list of defaults to explicit parameters
    retval = {} if params is None else dict(params)
    for k, v in default_union.items():
        if k not in retval or retval[k] is None:
            retval[k] = v
    return retval


def validate_scope(scope: dict):
    """Throw an exception if any key in scope is invalid"""
    validate_pdl_model_defaults(scope["pdl_model_default_parameters"])


def validate_pdl_model_defaults(model_defaults: list[dict[str, dict[str, Any]]]):
    """Throw an exception if the model_defaults is not in expected format"""

    for model_default in model_defaults:
        assert isinstance(model_default, dict)
        for model_glob, glob_defaults in model_default.items():
            if not isinstance(glob_defaults, dict):
                raise ValueError(
                    f"invalid defaults {glob_defaults} for model matcher {model_glob}"
                )
            assert isinstance(glob_defaults, dict)
