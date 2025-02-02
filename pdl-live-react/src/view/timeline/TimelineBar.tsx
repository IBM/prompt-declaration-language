import { useMemo } from "react"
import { Link, useLocation } from "react-router"

type Props = import("./model").TimelineRowWithExtrema

export default function TimelineBar({
  id,
  block: { kind, start_nanos, end_nanos },
  min,
  max,
}: Props) {
  const { hash } = useLocation()
  const style = useMemo(
    () => ({
      left: (100 * (start_nanos - min)) / (max - min) + "%",
      width: (100 * (end_nanos - start_nanos)) / (max - min) + "%",
    }),
    [start_nanos, end_nanos, min, max],
  )

  return (
    <div className="pdl-timeline-bar-outer">
      <div className="pdl-timeline-bar" style={style} data-kind={kind}>
        <Link to={`?detail&type=block&id=${encodeURIComponent(id)}${hash}`}>
          &nbsp;
        </Link>
      </div>
    </div>
  )
}
