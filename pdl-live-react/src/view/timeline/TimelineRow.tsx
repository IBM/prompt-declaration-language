import prettyMs from "pretty-ms"

import TimelineBar from "./TimelineBar"
import TimelineRowKindCell from "./TimelineRowKindCell"

type Props = import("./model").TimelineRowWithExtrema & {
  ordinal?: number
  prefix: boolean[]
  position: import("./model").Position
}

export default function TimelineRow(row: Props) {
  return (
    <div className="pdl-timeline-row">
      <span className="pdl-timeline-cell" data-cell="kind">
        <span className="pdl-mono">{treeSymbols(row)}</span>
        <TimelineRowKindCell row={row} ordinal={row.ordinal} />
      </span>

      <span className="pdl-timeline-cell" data-cell="bar">
        <TimelineBar {...row} />
      </span>

      <span className="pdl-timeline-cell pdl-duration" data-cell="duration">
        {prettyMs(
          ((row.block.pdl__timing.end_nanos || row.max) -
            row.block.pdl__timing.start_nanos) /
            1000000,
        )}
      </span>
    </div>
  )
}

function treeSymbols(row: Props) {
  return prefixSymbols(row) + finalSymbol(row)
}

function prefixSymbols(row: Props) {
  return row.prefix.slice(1).reduce((s, p) => s + (p ? "│  " : "   "), "")
}

function finalSymbol(row: Props) {
  if (row.depth === 0) {
    return ""
  }

  switch (row.position) {
    case "push":
    case "middle":
      return "├─ "
    default:
    case "pop":
      return "└─ "
  }
}
