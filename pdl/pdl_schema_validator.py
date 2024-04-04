from typing import Any

from jsonschema import ValidationError, validate

from .pdl_schema_error_analyzer import analyze_errors
from .pdl_schema_utils import get_json_schema, pdltype_to_jsonschema


def type_check_args(args: dict[str, Any], params: dict[str, Any]) -> list[str]:
    if (args == {} or args is None) and (params is None or params == {}):
        return []
    args_copy = args.copy()
    params_copy = params.copy()
    if args_copy is None:
        args_copy = {}
    if params_copy is None:
        params_copy = {}
    if "context" not in args_copy:
        args_copy["context"] = "context"
    if "context" not in params_copy:
        params_copy["context"] = "str"
    schema = get_json_schema(params_copy)
    if schema is None:
        return ["Error obtaining a valid schema from function parameters definition"]
    return type_check(args_copy, schema)


def type_check_spec(result: Any, spec: str | dict[str, Any] | list) -> list[str]:
    schema = pdltype_to_jsonschema(spec)
    if schema is None:
        return ["Error obtaining a valid schema from spec"]
    return type_check(result, schema)


def type_check(result: Any, schema: dict[str, Any]) -> list[str]:
    try:
        validate(instance=result, schema=schema)
    except ValidationError as e:
        errors = analyze_errors({}, schema, result)
        if len(errors) == 0:
            errors = [e.message]
        return errors
    return []
