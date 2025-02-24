import { match } from "ts-pattern"

import { type PdlBlock } from "../../pdl_ast"
import {
  hasTimingInformation,
  nonNullable,
  type PdlBlockWithTiming,
  type NonScalarPdlBlock,
} from "../../helpers"

type TimelineRow = {
  /** Unique identifier within tree */
  id: string

  /** Call tree depth */
  depth: number

  /** Parent node */
  parent: null | TimelineRow

  /** Child nodes */
  children: TimelineRow[]

  /** The original block model */
  block: PdlBlockWithTiming
}

export type TimelineRowWithExtrema = TimelineRow & {
  /** Minimum timestamp across all rows */
  min: number

  /** Maximum timestamp across all rows */
  max: number
}

export type TimelineModel = TimelineRow[]
export default TimelineModel

export type Position = "push" | "middle" | "pop"

function ignore(_block: PdlBlockWithTiming) {
  return false
}

export function computeModel(block: unknown | PdlBlock): TimelineModel {
  const model = computeModelIter(block).sort(
    (a, b) => a.block.pdl__timing.start_nanos - b.block.pdl__timing.start_nanos,
  )

  model.forEach((node) => {
    if (node.parent) {
      node.parent.children.push(node)
    }
  })

  return model
}

function computeModelIter(
  block: unknown | PdlBlock,
  parent?: TimelineRow,
): TimelineModel {
  if (!hasTimingInformation(block)) {
    return []
  }

  const ignoreRoot = ignore(block)
  const root = ignoreRoot
    ? parent
    : {
        id: block.id ?? block.kind ?? "",
        depth: !parent ? 0 : parent.depth + 1,
        parent: parent || null,
        children: [], // filled in at the end
        block,
      }

  return [
    ...(ignoreRoot ? [] : [root]),
    ...childrenOf(block)
      .filter(nonNullable)
      .flatMap((child) => computeModelIter(child, root)),
  ].filter(nonNullable)
}

export function childrenOf(block: NonScalarPdlBlock) {
  return match(block)
    .with({ kind: "model" }, (data) => [data.input, data.result])
    .with({ kind: "code" }, (data) => [data.result])
    .with({ kind: "get" }, (data) => [data.result])
    .with({ kind: "data" }, (data) => [data.result])
    .with({ kind: "if" }, (data) =>
      data.if_result ? [data.then] : [data.else],
    )
    .with({ kind: "match" }, (data) => [data.with]) // TODO
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
    .with({ kind: "empty" }, (data) =>
      data.defs ? Object.values(data.defs) : [],
    )
    .with({ kind: "error" }, () => []) // TODO show errors in trace
    .with({ kind: undefined }, () => [])
    .exhaustive()
    .flat()
    .filter(nonNullable)
}

function positionOf(row: TimelineRow): Position {
  if (!row.parent) {
    return "push"
  }

  const A = row.parent.children
  const idx = A.findIndex((c) => c === row)
  return idx === A.length - 1 || A[idx + 1].depth < row.depth
    ? "pop"
    : idx === 0 || A[idx - 1].depth < row.depth
      ? "push"
      : A[idx - 1].depth === row.depth
        ? "middle"
        : "pop"
}

function nextSibling(row: TimelineRow, idx: number, A: TimelineRow[]) {
  let sidx = idx + 1
  while (sidx < A.length && A[sidx].depth > row.depth) {
    sidx++
  }
  return sidx < A.length && A[sidx].depth === row.depth ? sidx : -1
}

type PushPop = { prefix: boolean[]; position: Position }

export function pushPopsFor(model: TimelineRow[]): PushPop[] {
  // Push all roots for the initial set
  const stack: number[] = model
    .map((_, idx) => (_.depth === 0 ? idx : undefined))
    .filter(nonNullable)

  // This is the return value
  const result: PushPop[] = []

  // This is an array of parents; false indicates that the parent has
  // no nextSibling; true indicates it does
  const prefix: boolean[] = []

  let n = 0
  while (stack.length > 0) {
    if (n++ > model.length * 2) {
      break
    }
    const rootIdx = stack.pop()

    if (rootIdx === undefined) {
      break
    } else if (rootIdx < 0) {
      prefix.pop()
      continue
    }

    const root = model[rootIdx]
    const mine = {
      prefix: prefix.slice(0),
      position: positionOf(root),
    }
    result.push(mine)

    stack.push(-rootIdx)
    for (let idx = model.length - 1; idx >= rootIdx + 1; idx--) {
      if (model[idx].parent === root) {
        stack.push(idx)
      }
    }

    const nextSibIdx = nextSibling(root, rootIdx, model)
    if (nextSibIdx < 0) {
      prefix.push(false)
      mine.position = "pop"
    } else {
      prefix.push(true)
    }
  }

  return result
}
