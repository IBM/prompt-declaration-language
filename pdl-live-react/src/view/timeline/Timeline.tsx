import { useMemo } from "react"

import TimelineRow from "./TimelineRow"
import { computeModel, pushPopsFor } from "./model"

import "./Timeline.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Timeline({ block }: Props) {
  const [model, min, max] = useMemo(() => {
    const model = computeModel(block)
    const [min, max] = model.reduce(
      ([min, max], row) => [
        Math.min(min, row.block.start_nanos),
        Math.max(max, row.block.end_nanos),
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
