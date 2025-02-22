import { useMemo } from "react"
import { Link, useLocation } from "react-router"

type Props = import("./model").TimelineRowWithExtrema

export default function TimelineBar({
  id,
  block: { kind, pdl__timing },
  min,
  max,
}: Props) {
  const { hash } = useLocation()
  const style = useMemo(
    () => ({
      left: (100 * (pdl__timing.start_nanos - min)) / (max - min) + "%",
      width:
        (100 * (pdl__timing.end_nanos - pdl__timing.start_nanos)) /
          (max - min) +
        "%",
    }),
    [pdl__timing.start_nanos, pdl__timing.end_nanos, min, max],
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
