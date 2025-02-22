import { useMemo } from "react"

import TimelineRow from "./TimelineRow"
import { pushPopsFor } from "./model"

import "./Timeline.css"

type Props = {
  model: import("./model").TimelineModel

  /** Block id -> ordinal */
  numbering?: Record<string, number>
}

export default function TimelineFromModel({ model, numbering }: Props) {
  const [minStart, maxEnd] = useMemo(() => {
    const [minStart, maxEnd] = model.reduce(
      ([minStart, maxEnd], row) => [
        Math.min(minStart, row.block.pdl__timing.start_nanos),
        Math.max(
          maxEnd,
          row.block.pdl__timing.end_nanos || row.block.pdl__timing.start_nanos,
        ),
      ],
      [Number.MAX_VALUE, -Number.MIN_VALUE],
    )
    return [minStart, maxEnd]
  }, [model])

  const pushPops = useMemo(() => pushPopsFor(model), [model])

  return (
    <div className="pdl-timeline">
      {model.map((row, idx) => (
        <TimelineRow
          key={idx}
          {...row}
          min={minStart}
          max={maxEnd}
          ordinal={numbering ? numbering[row.id] : undefined}
          {...pushPops[idx]}
        />
      ))}
    </div>
  )
}
