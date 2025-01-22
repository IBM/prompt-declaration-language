import { useMemo } from "react"

import TimelineRow, { type Position } from "./TimelineRow"
import { type TimelineRow as TimelineRowModel, computeModel } from "./model"

import "./Timeline.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Timeline({ block }: Props) {
  const [model, min, max] = useMemo(() => {
    const model = computeModel(block).sort(
      (a, b) => a.start_nanos - b.start_nanos,
    )
    const [min, max] = model.reduce(
      ([min, max], row) => [
        Math.min(min, row.start_nanos),
        Math.max(max, row.end_nanos),
      ],
      [Number.MAX_VALUE, Number.MIN_VALUE],
    )
    return [model, min, max]
  }, [block])

  const pushPops = useMemo(() => pushPopsFor(model), [model])

  return (
    <div className="pdl-timeline">
      {model.map((row, idx) => (
        <TimelineRow
          key={idx}
          {...row}
          min={min}
          max={max}
          {...pushPops[idx]}
        />
      ))}
    </div>
  )
}

function positionOf(
  row: TimelineRowModel,
  idx: number,
  A: TimelineRowModel[],
): Position {
  return idx === A.length - 1 || A[idx + 1].depth < row.depth
    ? "pop"
    : idx === 0 || A[idx - 1].depth < row.depth
      ? "push"
      : A[idx - 1].depth === row.depth
        ? "middle"
        : "pop"
}

function nextSibling(
  row: TimelineRowModel,
  idx: number,
  A: TimelineRowModel[],
) {
  let sidx = idx + 1
  while (sidx < A.length && A[sidx].depth > row.depth) {
    sidx++
  }
  return sidx < A.length && A[sidx].depth === row.depth ? sidx : -1
}

type PushPop = { prefix: boolean[]; position: Position }

function pushPopsFor(model: TimelineRowModel[]): PushPop[] {
  if (model.length === 0) {
    return []
  }

  const result: PushPop[] = []
  const stack: number[] = [0]
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
      position: positionOf(root, rootIdx, model),
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
