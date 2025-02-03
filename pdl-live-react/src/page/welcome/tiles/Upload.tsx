import { Link } from "react-router"
import { Button } from "@patternfly/react-core"

import Tile from "../Tile"

import UploadIcon from "@patternfly/react-icons/dist/esm/icons/file-upload-icon"

export default function Upload() {
  return (
    <Tile
      title="Upload Trace"
      icon={<UploadIcon />}
      body="You may upload a trace from your computer to visualize the program execution."
    >
      <Button isInline variant="link">
        <Link to="/upload">Choose Trace File</Link>
      </Button>
    </Tile>
  )
}
