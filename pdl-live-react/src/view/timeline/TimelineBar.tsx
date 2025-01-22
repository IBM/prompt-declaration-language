import { useMemo } from "react"

type Props = import("./model").TimelineRowWithExtrema

export default function TimelineBar({
  kind,
  start_nanos,
  end_nanos,
  min,
  max,
}: Props) {
  const style = useMemo(
    () => ({
      left: (100 * (start_nanos - min)) / (max - min) + "%",
      width: (100 * (end_nanos - start_nanos)) / (max - min) + "%",
    }),
    [start_nanos, end_nanos],
  )

  return (
    <span className="pdl-timeline-bar-outer">
      <span className="pdl-timeline-bar" style={style} data-kind={kind}>
        &nbsp;
      </span>
    </span>
  )
}
