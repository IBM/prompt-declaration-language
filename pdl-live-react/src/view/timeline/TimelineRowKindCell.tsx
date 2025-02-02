import { Button } from "@patternfly/react-core"
import { useCallback } from "react"
import { Link, useLocation } from "react-router"

import { capitalizeAndUnSnakeCase } from "../../helpers"

type Props = {
  row: import("./model").TimelineRowWithExtrema
}

export default function TimelineRowKindCell({ row }: Props) {
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
    <Button
      variant="link"
      isInline
      className="pdl-timeline-kind"
      component={link}
    >
      {capitalizeAndUnSnakeCase(row.block.kind ?? "unknown")}
    </Button>
  )
}
