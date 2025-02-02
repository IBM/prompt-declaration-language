import { Link } from "react-router"
import { Button } from "@patternfly/react-core"

import Tile from "../Tile"

export default function Upload() {
  return (
    <Tile
      title="Upload Trace"
      body="You may upload a trace from your computer to visualize the program execution."
    >
      <Button isInline variant="link">
        <Link to="/upload">Choose Trace File</Link>
      </Button>
    </Tile>
  )
}
