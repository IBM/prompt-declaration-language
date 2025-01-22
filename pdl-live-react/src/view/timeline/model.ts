import { match } from "ts-pattern"

import { type PdlBlock } from "../../pdl_ast"
import {
  hasTimingInformation,
  nonNullable,
  type PdlBlockWithTiming,
  type NonScalarPdlBlock,
} from "../../helpers"

export type TimelineRow = Pick<
  PdlBlockWithTiming,
  "start_nanos" | "end_nanos" | "timezone" | "kind"
> & {
  /** Call tree depth */
  depth: number

  /** Parent node */
  parent: null | TimelineRow
}

export type TimelineRowWithExtrema = TimelineRow & {
  /** Minimum timestamp across all rows */
  min: number

  /** Maximum timestamp across all rows */
  max: number
}

export type TimelineModel = TimelineRow[]

export function computeModel(
  block: unknown | PdlBlock,
  depth = 0,
  parent?: TimelineRow,
): TimelineModel {
  if (!hasTimingInformation(block)) {
    return []
  }

  const root = Object.assign({ depth, parent: parent || null }, block)
  return [
    root,
    ...childrenOf(block)
      .filter(nonNullable)
      .flatMap((child) => computeModel(child, depth + 1, root)),
  ]
}

function childrenOf(block: NonScalarPdlBlock) {
  return match(block)
    .with({ kind: "model" }, (data) => [data.input, data.result])
    .with({ kind: "code" }, (data) => [data.result])
    .with({ kind: "get" }, (data) => [data.result])
    .with({ kind: "data" }, (data) => [data.result])
    .with({ kind: "if" }, (data) =>
      data.if_result ? [data.then] : [data.else],
    )
    .with({ kind: "read" }, (data) => [data.result])
    .with({ kind: "include" }, (data) => [data.trace ?? data.result])
    .with({ kind: "function" }, () => [])
    .with({ kind: "call" }, (data) => [data.trace ?? data.result])
    .with({ kind: "text" }, (data) => [data.text])
    .with({ kind: "lastOf" }, (data) => [data.lastOf])
    .with({ kind: "array" }, (data) => [data.array])
    .with({ kind: "object" }, (data) => [data.object])
    .with({ kind: "message" }, (data) => [data.content])
    .with({ kind: "repeat" }, (data) => [data.trace ?? data.repeat])
    .with({ kind: "repeat_until" }, (data) => [data.trace ?? data.repeat])
    .with({ kind: "for" }, (data) => [data.trace ?? data.repeat])
    .with({ kind: "empty" }, () => [])
    .with({ kind: "error" }, () => []) // TODO show errors in trace
    .with({ kind: undefined }, () => [])
    .exhaustive()
    .flat()
    .filter(nonNullable)
}
