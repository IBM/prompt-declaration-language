import warnings
from typing import Any, Optional

json_types_convert = {
    "string": str,
    "boolean": bool,
    "integer": int,
    "number": float,
    "array": list,
    "object": dict,
}


def convert_to_json_type(a_type):
    for k, v in json_types_convert.items():
        if a_type == v:
            return k
    return None


_PDLTYPE_TO_JSONSCHEMA_NAME = {
    "null": "null",
    "bool": "boolean",
    "str": "string",
    "float": "number",
    "int": "integer",
    "list": "array",
    "obj": "object",
}


def pdltype_to_jsonschema(  # pylint: disable=too-many-return-statements
    pdl_type: str | dict[str, Any] | list
) -> dict[str, Any]:
    match pdl_type:
        case {"enum": choices}:
            return {"enum": choices}
        case None:
            return {"type": "null"}
        case "bool" | "str" | "float" | "int" | "list" | "obj":
            return {"type": _PDLTYPE_TO_JSONSCHEMA_NAME[pdl_type]}
        case {"str": dict() as details}:
            return {"type": "string", **details}
        case {"float": dict() as details}:
            return {"type": "number", **details}
        case {"int": dict() as details}:
            return {"type": "integer", **details}
        case {"list": str() as type_name}:
            return {"type": "array", "items": pdltype_to_jsonschema(type_name)}
        case {"list": dict() as details}:
            ikws = ["enum", *_PDLTYPE_TO_JSONSCHEMA_NAME.keys()]
            items_details = {k: v for k, v in details.items() if k in ikws}
            if len(items_details) != 1:
                raise ValueError(f"invalid PDL type {pdl_type}")
            other_details = {k: v for k, v in details.items() if k not in ikws}
            return {
                "type": "array",
                "items": pdltype_to_jsonschema(items_details),
                **other_details,
            }
        case list() as type_list:
            if len(type_list) != 1:
                raise ValueError(f"invalid PDL type {pdl_type}")
            return {
                "type": "array",
                "items": pdltype_to_jsonschema(type_list[0]),
            }
        case {"obj": dict() as pdl_props}:
            return get_json_schema_object(pdl_props)
        case dict() as pdl_props:
            return get_json_schema_object(pdl_props)
    raise ValueError(f"invalid PDL type {pdl_type}")


def get_json_schema_object(pdl_props: dict) -> dict[str, Any]:
    props = {}
    required = []
    for name, prop_type in pdl_props.items():
        if isinstance(prop_type, dict) and "optional" in prop_type:
            props[name] = pdltype_to_jsonschema(prop_type["optional"])
        else:
            props[name] = pdltype_to_jsonschema(prop_type)
            required.append(name)
    return {
        "type": "object",
        "properties": props,
        "required": required,
        "additionalProperties": False,
    }


def get_json_schema(params: dict[str, Any]) -> Optional[dict[str, Any]]:
    try:
        result = pdltype_to_jsonschema({"obj": params})
        return result
    except ValueError as e:
        warnings.warn(e.args[0])
        return None
