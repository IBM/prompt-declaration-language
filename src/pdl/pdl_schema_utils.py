import sys
import warnings
from typing import Any, Optional

from .pdl_ast import (
    EnumPdlType,
    JsonSchemaTypePdlType,
    ObjectPdlType,
    OptionalPdlType,
    PdlTypeType,
)

json_types_convert = {
    "null": None,
    "string": str,
    "boolean": bool,
    "integer": int,
    "number": float,
    "array": list,
    "object": dict,
    "str": str,
    "bool": bool,
    "int": int,
    "float": float,
    "list": list,
    "obj": dict,
}


def convert_to_json_type(a_type):
    for k, v in json_types_convert.items():
        if a_type == v:
            return k
    return None


OLD_PDLTYPE_TO_JSONSCHEMA_NAME = {
    "bool": "boolean",
    "str": "string",
    "float": "number",
    "int": "integer",
    "list": "array",
    "obj": "object",
}


def pdltype_to_jsonschema(
    pdl_type: PdlTypeType, additional_properties: bool
) -> dict[str, Any]:
    schema: dict[str, Any]
    match pdl_type:
        case None:
            schema = {}  # Any type
        case "null" | "boolean" | "string" | "number" | "integer" | "array" | "object":
            schema = {"type": pdl_type}
        case "bool" | "str" | "float" | "int" | "list" | "obj":
            print(
                f"Deprecated type syntax: use {OLD_PDLTYPE_TO_JSONSCHEMA_NAME[pdl_type]} instead of {pdl_type}.",
                file=sys.stderr,
            )
            schema = {"type": OLD_PDLTYPE_TO_JSONSCHEMA_NAME[pdl_type]}
        case EnumPdlType(enum=choices):
            if pdl_type.__pydantic_extra__ is None:
                extra = {}
            else:
                extra = pdl_type.__pydantic_extra__
            schema = {"enum": choices, **extra}
        case list() as type_list:
            if len(type_list) != 1:
                raise ValueError(f"invalid PDL type {pdl_type}")
            schema = {
                "type": "array",
                "items": pdltype_to_jsonschema(type_list[0], additional_properties),
            }
        case OptionalPdlType(optional=t):
            t_schema = pdltype_to_jsonschema(t, additional_properties)
            schema = {"anyOf": [t_schema, {"type": "null"}]}
        case JsonSchemaTypePdlType(type=t):
            if pdl_type.__pydantic_extra__ is None:
                extra = {}
            else:
                extra = pdl_type.__pydantic_extra__
            schema = {"type": t, **extra}
        case ObjectPdlType(object=pdl_props):
            if pdl_props is None:
                schema = {"type": "object"}
            else:
                schema = get_json_schema_object(pdl_props, additional_properties)
        case dict() as pdl_props:
            return get_json_schema_object(pdl_props, additional_properties)
        case _:
            raise ValueError(f"invalid PDL type {pdl_type}")
    return schema


def get_json_schema_object(
    pdl_props: dict[str, PdlTypeType], additional_properties
) -> dict[str, Any]:
    props = {}
    required = []
    for name, prop_type in pdl_props.items():
        if isinstance(prop_type, OptionalPdlType):
            props[name] = pdltype_to_jsonschema(
                prop_type.optional, additional_properties
            )
        else:
            props[name] = pdltype_to_jsonschema(prop_type, additional_properties)
            required.append(name)
    if additional_properties is False:
        return {
            "type": "object",
            "properties": props,
            "required": required,
            "additionalProperties": False,
        }

    return {"type": "object", "properties": props, "required": required}


def get_json_schema(
    params: dict[str, PdlTypeType], additional_properties
) -> Optional[dict[str, Any]]:
    try:
        result = pdltype_to_jsonschema(
            ObjectPdlType.model_validate({"object": params}), additional_properties
        )
        return result
    except ValueError as e:
        warnings.warn(e.args[0])
        return None
