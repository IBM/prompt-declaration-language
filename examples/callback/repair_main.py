import re

import pydantic

import pdl.pdl


class PDLScope(pydantic.BaseModel):
    code_line: str
    error_msg: str


class ParsedOutput(pydantic.BaseModel):
    thought: str
    code_line: str | None


class PDLResult(pydantic.BaseModel):
    before: str
    after: str | None


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


def main():
    pdl_scope = PDLScope(
        code_line="print('Hello, world!']",
        error_msg="SyntaxError: closing parenthesis ']' does not match opening '('",
    )
    print("---- before call to PDL ----")
    pdl_output = PDLResult(
        **pdl.pdl.exec_file("./repair_prompt.pdl", scope=pdl_scope.model_dump())
    )
    print("---- after return from PDL ----")
    print(pdl_output)


if __name__ == "__main__":
    main()
