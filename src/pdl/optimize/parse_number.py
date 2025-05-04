# thanks https://stackoverflow.com/a/20159350
import re

NUMBER_PATTERN = r"""(?x)       # enable verbose mode (which ignores whitespace and comments)
    ^                     # start of the input
    [^\d+-\.]*            # prefixed junk
    (?P<number>           # capturing group for the whole number
        (?P<sign>[+-])?       # sign group (optional)
        (?P<integer_part>         # capturing group for the integer part
            \d{1,3}               # leading digits in an int with a thousands separator
            (?P<sep>              # capturing group for the thousands separator
                [ ,.]                 # the allowed separator characters
            )
            \d{3}                 # exactly three digits after the separator
            (?:                   # non-capturing group
                (?P=sep)              # the same separator again (a backreference)
                \d{3}                 # exactly three more digits
            )*                    # repeated 0 or more times
        |                     # or
            \d+                   # simple integer (just digits with no separator)
        )?                    # integer part is optional, to allow numbers like ".5"
        (?P<decimal_part>     # capturing group for the decimal part of the number
            (?P<point>            # capturing group for the decimal point
                (?(sep)               # conditional pattern, only tested if sep matched
                    (?!                   # a negative lookahead
                        (?P=sep)              # backreference to the separator
                    )
                )
                [.,]                  # the accepted decimal point characters
            )
            \d+                   # one or more digits after the decimal point
        )?                    # the whole decimal part is optional
    )
    [^\d]*                # suffixed junk
    $                     # end of the input
"""


def parse_number(text):
    match = re.match(NUMBER_PATTERN, text)
    if match is None or not (
        match.group("integer_part") or match.group("decimal_part")
    ):  # failed to match
        return None  # consider raising an exception instead

    num_str = match.group("number")  # get all of the number, without the junk
    sep = match.group("sep")
    if sep:
        num_str = num_str.replace(sep, "")  # remove thousands separators

    if match.group("decimal_part"):
        point = match.group("point")
        if point != ".":
            num_str = num_str.replace(point, ".")  # regularize the decimal point
        return float(num_str)

    return int(num_str)


def extract_math_answer(result: str) -> float | int | None:
    last_line = result.splitlines()[-1]
    match = re.findall(r"The answer is(?::?) (.+)", last_line)

    # Check if a match was found and print the captured group
    if match:
        return parse_number(match[-1])

    return old_extract(result)


def old_extract(result: str) -> float:
    # Therefore, Madeline spends $5,829 a year on her dog.
    try:
        return float(result.split("####")[-1].strip().replace("$", "").replace(",", ""))
    except Exception:
        for r in reversed(result.split()):
            try:
                ret = r.replace("$", "").replace(",", "").removesuffix(".")
                return float(ret)
            except Exception:  # nosec B110 # noqa: S110
                pass
        return 0.0
