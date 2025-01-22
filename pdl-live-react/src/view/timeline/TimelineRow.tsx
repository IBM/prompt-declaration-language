import prettyMs from "pretty-ms"

import TimelineBar from "./TimelineBar"
import { capitalizeAndUnSnakeCase } from "../../helpers"

export type Position = "push" | "middle" | "pop"

type Props = import("./model").TimelineRowWithExtrema & {
  prefix: boolean[]
  position: Position
}

export default function TimelineRow(row: Props) {
  return (
    <div className="pdl-timeline-row">
      <span className="pdl-timeline-cell" data-cell="kind">
        <span className="pdl-mono">{treeSymbols(row)}</span>
        <span className="pdl-timeline-kind">
          {capitalizeAndUnSnakeCase(row.kind ?? "unknown")}
        </span>
      </span>

      <span className="pdl-timeline-cell" data-cell="bar">
        <TimelineBar {...row} />
      </span>

      <span className="pdl-timeline-cell pdl-duration" data-cell="duration">
        {prettyMs((row.end_nanos - row.start_nanos) / 1000000)}
      </span>
    </div>
  )
}

function treeSymbols(row: Props) {
  return prefixSymbols(row) + finalSymbol(row)
}

function prefixSymbols(row: Props) {
  return row.prefix.slice(1).reduce((s, p) => s + (p ? "│   " : "    "), "")
}

function finalSymbol(row: Props) {
  if (row.depth === 0) {
    return ""
  }

  switch (row.position) {
    case "push":
    case "middle":
      return "├── "
    default:
    case "pop":
      return "└── "
  }
}
