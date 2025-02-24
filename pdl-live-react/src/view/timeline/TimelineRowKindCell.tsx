import { Button } from "@patternfly/react-core"
import { useCallback } from "react"
import { Link, useLocation } from "react-router"

import { capitalizeAndUnSnakeCase } from "../../helpers"

type Props = {
  row: import("./model").TimelineRowWithExtrema
  ordinal?: number
}

export default function TimelineRowKindCell({ row, ordinal }: Props) {
  const { id } = row
  const { hash } = useLocation()

  const link = useCallback(
    (props: object) => (
      <Link
        to={`?detail&type=block&id=${encodeURIComponent(id)}${hash}`}
        {...props}
      />
    ),
    [id, hash],
  )

  return (
    <span className="pdl-timeline-kind">
      {ordinal && <span className="pdl-masonry-index">{ordinal}</span>}
      <Button variant="link" isInline component={link}>
        <span>{capitalizeAndUnSnakeCase(row.block.kind ?? "unknown")}</span>
      </Button>
    </span>
  )
}
