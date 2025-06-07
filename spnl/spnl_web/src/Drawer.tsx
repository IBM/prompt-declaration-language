import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Divider,
} from "@patternfly/react-core"

import Topology from "./Topology"

import CloseIcon from "@patternfly/react-icons/dist/esm/icons/times-icon"

type Props = {
  unit: null | import("./Unit").Unit
}

export default function Drawer({ unit }: Props) {
  const actions = useMemo(
    () => ({
      actions: (
        <Link to="/" search={{ qv: false }}>
          <Button variant="plain" icon={<CloseIcon />} />
        </Link>
      ),
    }),
    [],
  )

  return (
    <Card isPlain isLarge>
      <CardHeader actions={actions}>
        <CardTitle>Query Viewer</CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>{unit && <Topology unit={unit} />}</CardBody>
    </Card>
  )
}
