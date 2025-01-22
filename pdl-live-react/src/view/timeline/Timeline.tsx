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

/* function nextSibling(row: TimelineRowModel, idx: number, A: TimelineRowModel[]) {
  let sidx = idx + 1
  while (sidx < A.length && A[sidx].depth > row.depth) {
    sidx++
  }
  return sidx < A.length && A[sidx].depth === row.depth ? sidx : -1
} */

/*function pushPopsFor(model: TimelineRowModel[]): { prefix: string, position: Position }[] {
  return model.reduce((Ps, row, idx) => {
    const position = positionOf(row, idx, model)
    if (Ps.parent === -1) {
      return {prefix: "", position}
    }

    //const siblingIdx = nextSibling(model[Ps.parent], Ps.parent, model)
    const prefix = Ps.parentPrefix
    if (position === 'push' && Ps.parentHasSibling) {
      prefix += "│   "

    return {
      prefix,
      position,
    }
  })
}
*/

function pushPopsFor(model: TimelineRowModel[]): { position: Position }[] {
  return model.map((row, idx, A) => ({ position: positionOf(row, idx, A) }))
}
