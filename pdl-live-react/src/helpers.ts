import { type ReactElement } from "react"

import type { LitellmModelBlock, PdlBlock, TextBlock } from "./pdl_ast"

/** Re-export for convenience */
export { type PdlBlock } from "./pdl_ast"

export type NonScalarPdlBlock = Exclude<
  PdlBlock,
  null | string | boolean | number
>
export type PdlBlockWithResult = NonScalarPdlBlock & {
  result: NonNullable<PdlBlock>
}

export type PdlBlockWithTiming = NonScalarPdlBlock & {
  start_nanos: number
  end_nanos: number
  timezone: string
}

export type PdlBlockWithContext = Omit<PdlBlockWithTiming, "context"> & {
  context: { role: string; content: string }[]
}

/** Does the given block have a `result` field? */
export function hasResult(block: PdlBlock): block is PdlBlockWithResult {
  return (
    block != null &&
    typeof block === "object" &&
    "result" in block &&
    (typeof block.result !== "string" || block.result.length > 0)
  )
}

export function isPdlBlock(
  o: unknown | ReactElement | PdlBlock,
): o is PdlBlock {
  const obj = o as PdlBlock
  return (
    obj === null ||
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean" ||
    typeof obj.kind === "string"
  )
}

export function isNonScalarPdlBlock(
  data: unknown | PdlBlock,
): data is NonScalarPdlBlock {
  return data != null && typeof data === "object"
}

/** Does the given block have a `parser` field? */
export function hasParser(
  data: PdlBlock,
): data is NonScalarPdlBlock & { parser: import("./pdl_ast").Parser } {
  return isNonScalarPdlBlock(data) && "result" in data
}

const markdownPattern = /[`#*]/
/** Should we render `s` with react-markdown? */
export function isMarkdownish(s: string): boolean {
  /* try {
    JSON.parse(s)
  } catch(e) {
    return false
  }
  try {
    parseYaml(s)
  } catch(e) {
    return false
  } */
  return markdownPattern.test(s)
}

/** Is the given block a generic text block? */
function isTextBlock(data: PdlBlock): data is TextBlock {
  return (data as TextBlock).kind === "text"
}

/** Is the given block a generic text block with non-null content? */
type TextBlockWithContent = TextBlock & {
  text: NonNullable<TextBlock["text"]>
}
export function isTextBlockWithContent(
  data: PdlBlock,
): data is TextBlockWithContent {
  return isTextBlock(data) && data.text !== null
}

/** Is the given block a generic text block with array content? */
export function isTextBlockWithArrayContent(
  data: PdlBlock,
): data is TextBlockWithContent & { text: PdlBlock[] } {
  return isTextBlockWithContent(data) && Array.isArray(data.text)
}

/** Does the given block represent an LLM interaction? */
export function isLLMBlock(data: PdlBlock): data is LitellmModelBlock {
  return (data as LitellmModelBlock).kind === "model"
}

/** Does the given block have a `result` field? of type string */
export function hasScalarResult(
  block: PdlBlock,
): block is NonScalarPdlBlock & { result: string | boolean | number } {
  return (
    block != null &&
    typeof block === "object" &&
    "result" in block &&
    (typeof block.result === "string" ||
      typeof block.result === "number" ||
      typeof block.result === "boolean")
  )
}

const codeFenceStart = /^```[^\n]*$/

/** @return The text of `s` up till the first newline or end of string */
export function firstLineOf(s: string) {
  const lines = s.trim().split(/\n/)
  const startIdx = codeFenceStart.test(lines[0]) ? 1 : 0
  const endIdx =
    lines[lines.length - 1] === "```" ? lines.length - 1 : lines.length
  const suffix = endIdx - startIdx === 1 ? "" : "…"
  return lines[startIdx].replace(/:$/, "") + suffix
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

/** Does the given block have timing information? */
export function hasTimingInformation(
  block: unknown | PdlBlock,
): block is PdlBlockWithTiming {
  return (
    isNonScalarPdlBlock(block) &&
    typeof block.start_nanos === "number" &&
    typeof block.end_nanos === "number" &&
    typeof block.timezone === "string"
  )
}

/** Does the given block have context/background information? */
export function hasContextInformation(
  block: unknown | PdlBlock,
): block is PdlBlockWithContext {
  return (
    hasTimingInformation(block) &&
    block.context !== null &&
    Array.isArray(block.context)
  )
}

export function capitalizeAndUnSnakeCase(s: string) {
  return s === "model"
    ? "LLM"
    : s[0].toUpperCase() + s.slice(1).replace(/[-_]/, " ")
}
