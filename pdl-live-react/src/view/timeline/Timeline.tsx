import { useMemo } from "react"

import TimelineRow from "./TimelineRow"
import { computeModel, pushPopsFor } from "./model"

import "./Timeline.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Timeline({ block }: Props) {
  const [model, minStart, maxEnd] = useMemo(() => {
    const model = computeModel(block)
    const [minStart, maxEnd] = model.reduce(
      ([minStart, maxEnd], row) => [
        Math.min(minStart, row.block.start_nanos),
        Math.max(maxEnd, row.block.end_nanos),
      ],
      [Number.MAX_VALUE, Number.MIN_VALUE],
    )
    return [model, minStart, maxEnd]
  }, [block])

  const pushPops = useMemo(() => pushPopsFor(model), [model])

  return (
    <div className="pdl-timeline">
      {model.map((row, idx) => (
        <TimelineRow
          key={idx}
          {...row}
          min={minStart}
          max={maxEnd}
          {...pushPops[idx]}
        />
      ))}
    </div>
  )
}
