import re

from .pdl_ast import PdlLocationType


def append(loc: PdlLocationType, seg: str) -> PdlLocationType:
    return PdlLocationType(file=loc.file, path=loc.path + [seg], table=loc.table)


def normalize(indentation: list[int], is_array_item: list[bool]) -> list[int]:
    ret = []
    indentation_levels = sorted(set(indentation))
    for (
        indent
    ) in (
        indentation
    ):  # normalize indentations, so that there is only 1 space per indentation
        ret.append(indentation_levels.index(indent))
    for index, indent in enumerate(ret):  # adjust for array items
        if is_array_item[index]:
            ret[index] = ret[index] + 1
    return ret


def get_paths(
    fields: list[str], indentation: list[int], is_array_item: list[bool]
) -> dict[str, int]:
    ret = {}
    indent = 0
    path = {indent: ["root"]}
    array_index = {indent: -1}

    for line, field in enumerate(fields):
        new_indent = indentation[line]
        is_array = is_array_item[line]
        if new_indent not in path:
            path[new_indent] = path[indent].copy() + ["___start___"]
        if new_indent not in array_index:
            array_index[new_indent] = -1

        if new_indent < indent:  # Need to reset
            path = dict(  # pylint: disable=consider-using-dict-comprehension
                [(key, value) for key, value in path.items() if key <= new_indent]
            )
            array_index = dict(  # pylint: disable=consider-using-dict-comprehension
                [
                    (key, value)
                    for key, value in array_index.items()
                    if key <= new_indent
                ]
            )

        indent = new_indent

        if field != "" and not is_array:
            path[indent].pop()
            path[indent].append(field)
            ret[str(path[indent])] = line + 1

        elif is_array:
            path[indent].pop()
            if path[indent][-1].startswith("["):
                path[indent].pop()
            array_index[indent] += 1
            path[indent].append("[" + str(array_index[indent]) + "]")
            ret[str(path[indent])] = line + 1
            if field != "":
                path[indent].append(field)
                ret[str(path[indent])] = line + 1
    return ret


def get_line_map(prog: str) -> dict[str, int]:
    indentation = []
    fields = []
    is_array_item = []
    for line in prog.split("\n"):  # line numbers are off by one
        fields.append(
            line.strip().split(":")[0].replace("-", "").strip()
            if line.find(":") != -1
            else ""
        )
        indentation.append(len(re.findall("^ *", line)[0]))
        is_array_item.append(
            line.strip().startswith("-") if line.find("-") != -1 else False
        )

    indentation = normalize(indentation, is_array_item)

    paths = get_paths(fields, indentation, is_array_item)
    return paths


def get_loc_string(loc: PdlLocationType) -> str:
    if loc.file == "":
        msg = "line " + str(get_line(loc.table, loc.path)) + " - "
    else:
        msg = loc.file + ":" + str(get_line(loc.table, loc.path)) + " - "
    return msg


def get_line(table: dict[str, int], p: list[str]) -> int:
    if len(p) == 0:
        return 0
    if str(p) in table:
        return table[str(p)]
    return get_line(table, p[:-1])
