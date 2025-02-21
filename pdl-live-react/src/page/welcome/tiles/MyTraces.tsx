import { Button } from "@patternfly/react-core"
import { Link, useLocation, useSearchParams } from "react-router"

import Tile from "../Tile"
import { getMyTraces } from "../../MyTraces"

import MyIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"
import FileIcon from "@patternfly/react-icons/dist/esm/icons/file-code-icon"
import UploadIcon from "@patternfly/react-icons/dist/esm/icons/file-upload-icon"

export default function MyTraces() {
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()

  const myTraces = getMyTraces()

  return (
    <Tile
      title="My Traces"
      icon={<MyIcon />}
      body="You may view one of your previously uploaded traces, or upload a new one."
    >
      <Button isInline variant="link" icon={<UploadIcon />}>
        <Link to="/upload">Upload Trace File</Link>
      </Button>
      {myTraces.map(({ title, filename }) => (
        <Button key={filename} isInline variant="link" icon={<FileIcon />}>
          <Link
            to={"/my/" + encodeURIComponent(title) + (s ? `?${s}` : "") + hash}
          >
            {title}
          </Link>
        </Button>
      ))}
    </Tile>
  )
}
