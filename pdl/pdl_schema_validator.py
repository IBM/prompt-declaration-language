from typing import Any

from jsonschema import ValidationError, validate

from .pdl_schema_error_analyzer import analyze_errors
from .pdl_schema_utils import get_json_schema


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
    try:
        validate(instance=args_copy, schema=schema)
    except ValidationError:
        return analyze_errors({}, schema, args_copy)
    return []
