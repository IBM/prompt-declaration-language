from .pdl_ast import PdlLocationType
from .pdl_location_utils import append, get_loc_string
from .pdl_schema_utils import convert_to_json_type, json_types_convert


def is_base_type(schema):
    if "type" in schema:
        the_type = schema["type"]
        if the_type in set(["string", "boolean", "integer", "number"]):
            return True
    if "enum" in schema:
        return True
    return False


def is_array(schema):
    if "type" in schema:
        return schema["type"] == "array"
    return False


def is_object(schema):
    if "type" in schema:
        return schema["type"] == "object"
    return False


def is_any_of(schema):
    if "anyOf" in schema:
        return True
    return False


def nullable(schema):
    if "anyOf" in schema:
        for item in schema["anyOf"]:
            if "type" in item and item["type"] == "null":
                return True
    return False


def get_non_null_type(schema):
    if "anyOf" in schema and len(schema["anyOf"]) == 2:
        for item in schema["anyOf"]:
            if "type" not in item or "type" in item and item["type"] != "null":
                return item
    return None


def match(ref_type, data):
    all_fields = ref_type.get("properties", {}).keys()
    intersection = list(set(data.keys()) & set(all_fields))
    return len(intersection)


def analyze_errors(defs, schema, data, loc: PdlLocationType) -> list[str]:  # noqa: C901
    ret = []
    if schema == {}:
        return []  # anything matches type Any

    if is_base_type(schema):
        if "type" in schema:
            the_type = json_types_convert[schema["type"]]
            if not isinstance(data, the_type):  # pyright: ignore
                ret.append(
                    get_loc_string(loc)
                    + str(data)
                    + " should be of type "
                    + str(the_type)
                )
        if "enum" in schema:
            if data not in schema["enum"]:
                ret.append(
                    get_loc_string(loc)
                    + str(data)
                    + " should be one of: "
                    + str(schema["enum"])
                )

    elif "$ref" in schema:
        ref_string = schema["$ref"].split("/")[2]
        ref_type = defs[ref_string]
        ret += analyze_errors(defs, ref_type, data, loc)

    elif is_array(schema):
        if not isinstance(data, list):
            ret.append(get_loc_string(loc) + str(data) + " should be a list")
        else:
            for i, item in enumerate(data):
                newloc = append(loc, "[" + str(i) + "]")
                ret += analyze_errors(defs, schema["items"], item, newloc)

    elif is_object(schema):
        if not isinstance(data, dict):
            ret.append(get_loc_string(loc) + str(data) + " should be an object")
        else:
            if "required" in schema.keys():
                required_fields = schema["required"]
                for missing in list(set(required_fields) - set(data.keys())):
                    ret.append(
                        get_loc_string(loc) + "Missing required field: " + missing
                    )
            if "properties" in schema.keys():
                all_fields = schema["properties"].keys()
                extras = list(set(data.keys()) - set(all_fields))
                if (
                    "additionalProperties" in schema
                    and schema["additionalProperties"] is False
                ):
                    for field in extras:
                        nloc = append(loc, field)
                        ret.append(get_loc_string(nloc) + "Field not allowed: " + field)

                valid_fields = list(set(all_fields) & set(data.keys()))
                for field in valid_fields:
                    newloc = append(loc, field)
                    ret += analyze_errors(
                        defs, schema["properties"][field], data[field], newloc
                    )
            if "additionalProperties" in schema.keys() and not isinstance(
                schema["additionalProperties"], bool
            ):
                for key, value in data.items():
                    nloc = append(loc, key)
                    ret += analyze_errors(
                        defs, schema["additionalProperties"], value, nloc
                    )

    elif is_any_of(schema):
        if len(schema["anyOf"]) == 2 and nullable(schema):
            ret += analyze_errors(defs, get_non_null_type(schema), data, loc)

        elif not isinstance(data, dict) and not isinstance(data, list):
            the_type = convert_to_json_type(type(data))
            the_type_exists = False
            for item in schema["anyOf"]:
                if item == {}:
                    the_type_exists = True
                if "type" in item and item["type"] == the_type:
                    the_type_exists = True
                if "enum" in item and data in item["enum"]:
                    the_type_exists = True
            if not the_type_exists:
                ret.append(
                    get_loc_string(loc)
                    + str(data)
                    + " should be of type "
                    + str(schema)
                )

        elif isinstance(data, list):
            found = None
            for item in schema["anyOf"]:
                if is_array(item):
                    found = item
            if found is not None:
                ret += analyze_errors(defs, found, data, loc)
            else:
                ret.append(get_loc_string(loc) + str(data) + " should not be a list")

        elif isinstance(data, dict):
            match_ref = {}
            highest_match = 0
            for item in schema["anyOf"]:
                field_matches = 0
                if "type" in item and item["type"] == "object":
                    field_matches = match(item, data)
                    if field_matches > highest_match:
                        highest_match = field_matches
                        match_ref = item
                if "$ref" in item:
                    ref_string = item["$ref"].split("/")[2]
                    ref_type = defs[ref_string]
                    field_matches = match(ref_type, data)
                    if field_matches > highest_match:
                        highest_match = field_matches
                        match_ref = ref_type

            if match_ref == {}:
                ret.append(
                    get_loc_string(loc)
                    + str(data)
                    + " should be of type: "
                    + str(schema)
                )

            else:
                ret += analyze_errors(defs, match_ref, data, loc)
    return ret
