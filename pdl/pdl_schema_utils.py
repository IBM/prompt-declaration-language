from typing import Any, Optional

json_types_convert = {
    "string": str,
    "boolean": bool,
    "integer": int,
    "number": float,
    "array": list,
    "object": dict,
}

string_to_type = {
    "str": str,
    "bool": bool,
    "int": int,
    "float": float,
    "list": list,
    "dict": dict,
}


def convert_to_json_type(a_type):
    for k, v in json_types_convert.items():
        if a_type == v:
            return k
    return None


def get_json_schema(d: dict[str, Any]) -> Optional[dict[str, Any]]:
    schema = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    req = []
    props = {}
    for k, v in d.items():
        req.append(k)
        if v not in string_to_type:
            return None
        a_type = convert_to_json_type(string_to_type[v])
        props[k] = {"type": a_type}
    schema["properties"] = props
    schema["required"] = req
    return schema
