import warnings
from typing import Any, Optional

from .pdl_ast import (
    EnumPdlType,
    FloatPdlType,
    IntPdlType,
    ListPdlType,
    ListPdlTypeConstraints,
    ObjPdlType,
    OptionalPdlType,
    PdlTypeType,
    StrPdlType,
    pdl_type_adapter,
)

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


def pdltype_to_jsonschema(
    pdl_type: Optional[PdlTypeType], additional_properties: bool
) -> dict[str, Any]:
    schema: dict[str, Any]
    match pdl_type:
        case None:
            schema = {}  # Any type
        case "null" | "bool" | "str" | "float" | "int" | "list" | "obj":
            schema = {"type": _PDLTYPE_TO_JSONSCHEMA_NAME[pdl_type]}
        case EnumPdlType(enum=choices):
            schema = {"enum": choices}
        case StrPdlType(str=None):
            schema = {"type": "string"}
        case StrPdlType(str=constraints):
            if constraints is None:
                details = {}
            else:
                details = constraints.model_dump(exclude_defaults=True)
            schema = {"type": "string", **details}
        case FloatPdlType(float=constraints):
            if constraints is None:
                details = {}
            else:
                details = constraints.model_dump(exclude_defaults=True)
            schema = {"type": "number", **details}
        case IntPdlType(int=constraints):
            if constraints is None:
                details = {}
            else:
                details = constraints.model_dump(exclude_defaults=True)
            schema = {"type": "integer", **details}
        case ListPdlType(list=ListPdlTypeConstraints() as cstr):
            items_type = pdl_type_adapter.validate_python(cstr.__pydantic_extra__)
            details = {}
            if cstr.minItems is not None:
                details["minItems"] = cstr.minItems
            if cstr.maxItems is not None:
                details["maxItems"] = cstr.maxItems
            schema = {
                "type": "array",
                "items": pdltype_to_jsonschema(items_type, additional_properties),
                **details,
            }
        case ListPdlType(list=items_type):
            schema = {
                "type": "array",
                "items": pdltype_to_jsonschema(items_type, additional_properties),
            }
        # case {"list": dict() as details}:
        #     ikws = ["enum", *_PDLTYPE_TO_JSONSCHEMA_NAME.keys()]
        #     items_details = {k: v for k, v in details.items() if k in ikws}
        #     if len(items_details) != 1:
        #         raise ValueError(f"invalid PDL type {pdl_type}")
        #     other_details = {k: v for k, v in details.items() if k not in ikws}
        #     return {
        #         "type": "array",
        #         "items": pdltype_to_jsonschema(items_details, additional_properties),
        #         **other_details,
        #     }
        case list() as type_list:
            if len(type_list) != 1:
                raise ValueError(f"invalid PDL type {pdl_type}")
            schema = {
                "type": "array",
                "items": pdltype_to_jsonschema(type_list[0], additional_properties),
            }
        case OptionalPdlType(optional=t):
            t_schema = pdltype_to_jsonschema(t, additional_properties)
            schema = {"anyOf": [t_schema, "null"]}
        case ObjPdlType(obj=pdl_props):
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
            ObjPdlType.model_validate({"obj": params}), additional_properties
        )
        return result
    except ValueError as e:
        warnings.warn(e.args[0])
        return None
