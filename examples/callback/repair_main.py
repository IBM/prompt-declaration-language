import re
from typing import TypedDict, cast

import pdl.pdl

PDLScope = TypedDict("PDLScope", {"code_line": str, "error_msg": str})
ParsedOutput = TypedDict("ParsedOutput", {"thought": str, "code_line": str | None})
PDLResult = TypedDict("PDLResult", {"before": str, "after": str | None})


def parse_output(raw_output: str) -> ParsedOutput:
    print("---- during callback from PDL ----")
    match_start = re.search(r"```python\s", raw_output)
    if not match_start:
        return ParsedOutput(thought=raw_output, code_line=None)
    thought = raw_output[: match_start.start()]
    rest = raw_output[match_start.end() :]
    match_end = re.search(r"\s```", rest)
    if not match_end:
        return ParsedOutput(thought=thought, code_line=rest)
    return ParsedOutput(thought=thought, code_line=rest[: match_end.start()])


if __name__ == "__main__":
    pdl_input = PDLScope(
        code_line="print('Hello, world!']",
        error_msg="SyntaxError: closing parenthesis ']' does not match opening '('",
    )
    print("---- before call to PDL ----")
    pdl_output: PDLResult = pdl.pdl.exec_file(
        "./repair_prompt.pdl", scope=cast(pdl.pdl.ScopeType, pdl_input)
    )
    print("---- after return from PDL ----")
    print(pdl_output)
