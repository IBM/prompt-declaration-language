import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Sequence, TypeAlias

from ..pdl_ast import (
    Block,
    BlockType,
    CallBlock,
    CodeBlock,
    DataBlock,
    ExpressionType,
    FunctionBlock,
    GetBlock,
    IfBlock,
    ImportBlock,
    IncludeBlock,
    LitellmModelBlock,
    LitellmParameters,
    LocalizedExpression,
    ModelBlock,
    ReadBlock,
    RepeatBlock,
    TextBlock,
)


class Re(ABC):
    @abstractmethod
    def to_re(self) -> str: ...


class ReEmpty(Re):
    """regex: ''"""

    def to_re(self):
        return ""


@dataclass
class ReConst(Re):
    """regex: constant string"""

    s: str

    def to_re(self):
        return re.escape(self.s)


class ReAnyChar(Re):
    """regex: '.'"""

    def to_re(self):
        return r"."


class ReDigit(Re):
    r"""regex: '\d'"""

    def to_re(self):
        return r"\d"


@dataclass
class ReIn(Re):
    """regex: constant string"""

    set: list[str]

    def to_re(self):
        return f"[{''.join(self.set)}]"


@dataclass
class ReNotIn(Re):
    """regex: constant string"""

    set: list[str]

    def to_re(self):
        return f"[^{''.join(self.set)}]"


@dataclass
class ReRange(Re):
    """regex: '[x-y]'"""

    x: str
    y: str

    def to_re(self):
        return f"[{self.x}-{self.y}]"


class ReBegin(Re):
    """regex: '^'"""

    def to_re(self):
        return r"^"


class ReEnd(Re):
    """regex: '$'"""

    def to_re(self):
        return "$"


@dataclass
class ReStar(Re):
    """regex: '*'"""

    body: "RegexType"

    def to_re(self):
        b = self.body.to_re()
        return f"{_paren(b)}*"


@dataclass
class RePlus(Re):
    """regex: '+'"""

    body: "RegexType"

    def to_re(self):
        b = self.body.to_re()
        return f"{_paren(b)}+"


@dataclass
class ReRepeatN(Re):
    """regex: '{n}'"""

    body: "RegexType"
    n: int

    def to_re(self):
        b = self.body.to_re()
        return _paren(b) + "{n}"


@dataclass
class ReOpt(Re):
    """regex: '?'"""

    body: "RegexType"

    def to_re(self):
        b = self.body.to_re()
        return f"{_paren(b)}?"


@dataclass
class ReSeq(Re):
    """regex: '|'"""

    body: list["RegexType"]

    def to_re(self):
        b = [_paren(r.to_re()) for r in self.body]
        return "".join(b)


@dataclass
class ReOr(Re):
    """regex: '|'"""

    body: list["RegexType"]

    def to_re(self):
        b = [_paren(r.to_re()) for r in self.body]
        return "|".join(b)


@dataclass
class ReAnyUpto(Re):
    """regex: '.*(?=X)'"""

    body: "RegexType"

    def to_re(self):
        return f".*(?={_paren(self.body.to_re())})"


class ReJson(Re):
    """regex: json parser"""

    def to_re(self):
        # From https://stackoverflow.com/questions/47454689/python-parsing-json-formatted-text-file-with-regex
        return (
            r"(?(DEFINE)"
            r"(?P<whitespace>( |\n|\r|\t)*)"
            r"(?P<boolean>true|false)"
            r"(?P<number>-?(0|([1-9]\d*))(\.\d*[1-9])?([eE][+-]?\d+)?)"
            r'(?P<string>"([^"\\]|\\("|\\|/|b|f|n|r|t|u[0-9a-fA-F]{4}))*")'
            r"(?P<array>\[((?&whitespace)|(?&value)(,(?&value))*)\])"
            r"(?P<key>(?&whitespace)(?&string)(?&whitespace))"
            r"(?P<value>(?&whitespace)((?&boolean)|(?&number)|(?&string)|(?&array)|(? &object)|null)(?&whitespace))"
            r"(?P<object>\{((?&whitespace)|(?&key):(?&value)(,(?&key):(?&value))*)\})"
            r"(?P<text>(?&object)|(?&array))"
            r")"
            r"(?&text)"
        )


def _paren(s: str) -> str:
    if len(s) == 1:
        r = s
    elif len(s) > 1 and (s[0] == "(" or s[0] == "["):
        r = s
    else:
        r = f"({s})"
    return r


RegexType: TypeAlias = (
    ReEmpty
    | ReConst
    | ReAnyChar
    | ReDigit
    | ReIn
    | ReNotIn
    | ReRange
    | ReBegin
    | ReEnd
    | ReStar
    | RePlus
    | ReRepeatN
    | ReOpt
    | ReSeq
    | ReOr
    | ReAnyUpto
    | ReJson
)


CompileScope: TypeAlias = dict[str, (RegexType | BlockType)]


def compile_blocks(
    scope: CompileScope, blocks: BlockType | list[BlockType]
) -> tuple[RegexType, CompileScope]:
    if not isinstance(blocks, str) and isinstance(blocks, Sequence):
        # is a list of blocks
        seq: list[RegexType] = []
        for b in blocks:
            r, scope = compile_block(scope, b)
            seq.append(r)
        return ReSeq(seq), scope
    return compile_block(scope, blocks)


def compile_block(
    scope: CompileScope, block: BlockType
) -> tuple[RegexType, CompileScope]:
    regex: RegexType
    if not isinstance(block, Block):
        return ReConst(str(block)), scope
    match block:
        case ModelBlock():
            stop_sequences: list[str]
            include_stop_sequence: bool
            match block:
                case LitellmModelBlock():
                    if block.parameters is None:
                        stop_sequences = []
                        include_stop_sequence = False
                    else:
                        if isinstance(block.parameters, LitellmParameters):
                            parameters = block.parameters.model_dump()
                        elif isinstance(block.parameters, LocalizedExpression):
                            parameters = block.parameters.pdl__expr
                        elif isinstance(block.parameters, str):
                            parameters = {}
                        else:
                            parameters = block.parameters
                        stop_sequences = parameters.get("stop", [])
                        include_stop_sequence = parameters.get("stop", False)
                case _:
                    assert False

            if len(stop_sequences) == 0:
                regex = ReStar(ReAnyChar())
            else:
                regex_stop_sequences = ReOr([ReConst(s) for s in stop_sequences])
                if include_stop_sequence:
                    regex = ReSeq([ReStar(ReAnyChar()), regex_stop_sequences])
                else:
                    regex = ReAnyUpto(regex_stop_sequences)
        case CodeBlock():
            regex = ReStar(ReAnyChar())
        case GetBlock():
            # try:
            #     regex = scope[block.get]  # XXX what do we want to do with path?
            # except Exception:
            regex = ReStar(ReAnyChar())  # XXX TODO
        case DataBlock(data=v):
            regex = data_to_regex(v)
        case TextBlock():
            regex, scope = compile_blocks(scope, block.text)
        case IfBlock():
            then_regex, then_scope = compile_block(scope, block.then)
            else_regex, else_scope = (
                compile_block(scope, block.else_)
                if block.else_ is not None
                else (ReEmpty(), scope)
            )
            regex = ReOr([then_regex, else_regex])
            scope = scope_union(then_scope, else_scope)
        case RepeatBlock():
            body, scope = compile_block(scope, block.repeat)
            # XXX TODO: join char in text mode XXX
            regex = ReStar(body)
        case ReadBlock():
            regex = ReStar(ReAnyChar())
        case IncludeBlock():
            regex = ReStar(ReAnyChar())  # XXX TODO XXX
        case ImportBlock():
            regex = ReStar(ReAnyChar())  # XXX TODO XXX
        case FunctionBlock():
            regex = ReStar(ReAnyChar())  # XXX TODO XXX
            # scope = scope | {x: ReStar(ReAnyChar) for x in block.function.keys()}
            # body
        case CallBlock():
            regex = ReStar(ReAnyChar())  # XXX TODO XXX
        case _:
            assert False
    return regex, scope


def data_to_regex(data: ExpressionType) -> RegexType:
    regex: RegexType
    if isinstance(data, str):
        regex = ReConst(f'"{data}"')
    elif isinstance(data, (float, int)):
        regex = ReConst(f"{data}")
    elif isinstance(data, bool):
        if data:
            regex = ReConst("true")
        else:
            regex = ReConst("false")
    elif data is None:
        regex = ReConst("null")
    elif isinstance(data, list):
        seq: list[RegexType] = [ReConst("[")]
        if len(data) > 0:
            seq.append(json_whitespace)
            for d in data[:-1]:
                seq.append(data_to_regex(d))
                seq.append(json_whitespace)
                seq.append(ReConst(","))
                seq.append(json_whitespace)
            seq.append(data_to_regex(data[-1]))
            seq.append(json_whitespace)
        else:
            seq.append(json_whitespace)
        seq.append(ReConst("]"))
        regex = ReSeq(seq)
    elif isinstance(data, dict):
        seq = [ReConst("{")]
        items = list(data.items())
        if len(items) > 0:
            seq.append(json_whitespace)
            for k, v in items[:-1]:
                seq.append(ReConst('"' + k + '"'))
                seq.append(json_whitespace)
                seq.append(ReConst(":"))
                seq.append(json_whitespace)
                seq.append(data_to_regex(v))
                seq.append(json_whitespace)
                seq.append(ReConst(","))
                seq.append(json_whitespace)
            k, v = data[-1]
            seq.append(ReConst('"' + k + '"'))
            seq.append(json_whitespace)
            seq.append(ReConst(":"))
            seq.append(json_whitespace)
            seq.append(data_to_regex(v))
            seq.append(json_whitespace)
        else:
            seq.append(json_whitespace)
        seq.append(ReConst("}"))
        regex = ReSeq(seq)
    else:
        assert False
    return regex


json_whitespace = ReStar(
    ReOr([ReConst(" "), ReConst("\n"), ReConst("\r"), ReConst("\t")])
)
# hex_char = ReOr([ReRange("0", "9"), ReRange("a", "f"), ReRange("A", "F")])
# json_boolean = ReOr([ReConst("true"), ReConst("false")])
# json_number = ReSeq(
#     [
#         ReOpt(ReConst("-")),
#         # 0|([1-9]\d*)
#         ReOr([ReConst("0"), ReSeq([ReRange("1", "9"), ReStar(ReDigit())])]),
#         # (\.\d*[1-9])?
#         ReOpt(ReSeq([ReConst("."), ReStar(ReDigit()), ReRange("1", "9")])),
#         # ([eE][+-]?\d+)?
#         ReOpt(
#             ReSeq(
#                 [
#                     ReIn(["e", "E"]),
#                     ReOpt(ReIn(["+", "-"])),
#                     RePlus(ReDigit()),
#                 ]
#             )
#         ),
#     ]
# )
# json_string = ReSeq(
#     [
#         ReConst('"'),
#         ReStar(
#             ReOr(
#                 [
#                     # [^"\\]
#                     ReNotIn(['"', "\\"]),
#                     # \\("|\\|/|b|f|n|r|t|u[0-9a-fA-F]{4})
#                     ReSeq(
#                         [
#                             ReConst("\\"),
#                             ReOr(
#                                 [
#                                     ReConst("\\"),
#                                     ReConst("/"),
#                                     ReConst("b"),
#                                     ReConst("f"),
#                                     ReConst("n"),
#                                     ReConst("r"),
#                                     ReConst("t"),
#                                     ReSeq(
#                                         [
#                                             ReConst("u"),
#                                             hex_char,
#                                             hex_char,
#                                             hex_char,
#                                             hex_char,
#                                         ]
#                                     ),
#                                 ]
#                             ),
#                         ]
#                     ),
#                 ]
#             )
#         ),
#         ReConst('"'),
#     ]
# )


def scope_union(scope1: CompileScope, scope2: CompileScope) -> CompileScope:
    return scope2 | scope1
