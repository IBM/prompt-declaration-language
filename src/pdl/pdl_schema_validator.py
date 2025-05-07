# pylint: disable=import-outside-toplevel
from typing import Any, Optional

from .pdl_ast import FunctionBlock, PdlTypeType
from .pdl_location_utils import get_loc_string
from .pdl_schema_error_analyzer import analyze_errors
from .pdl_schema_utils import get_json_schema, pdltype_to_jsonschema


def type_check_args(
    args: Optional[dict[str, Any]], params: Optional[dict[str, Any]], loc
) -> list[str]:
    if (args == {} or args is None) and (params is None or params == {}):
        return []
    if args is None:
        args_copy = {}
    else:
        args_copy = args.copy()
    if params is None:
        params_copy = {}
    else:
        params_copy = params.copy()
    # if "pdl_context" not in args_copy:
    #     args_copy["pdl_context"] = "pdl_context"
    # if "pdl_context" not in params_copy:
    if "pdl_context" in args_copy:
        # params_copy["pdl_context"] = [{"role": "str?", "content": "str"}]
        params_copy["pdl_context"] = ["obj"]
    for k, v in args_copy.items():
        if isinstance(v, FunctionBlock):
            args_copy[k] = v.model_dump()
    schema = get_json_schema(params_copy, False)
    if schema is None:
        return ["Error obtaining a valid schema from function parameters definition"]
    return type_check(args_copy, schema, loc)


def type_check_spec(result: Any, spec: Optional[PdlTypeType], loc) -> list[str]:
    schema = pdltype_to_jsonschema(spec, False)
    if schema is None:
        return ["Error obtaining a valid schema from spec"]
    return type_check(result, schema, loc)


def type_check(result: Any, schema: dict[str, Any], loc) -> list[str]:
    from jsonschema import ValidationError, validate

    try:
        validate(instance=result, schema=schema)
    except ValidationError as e:
        errors = analyze_errors({}, schema, result, loc)
        if len(errors) == 0:
            errors = [get_loc_string(loc) + e.message]
        return errors
    return []
