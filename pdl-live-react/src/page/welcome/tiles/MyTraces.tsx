import { Button, Flex, Stack, StackItem } from "@patternfly/react-core"
import { Link, useLocation, useSearchParams } from "react-router"

import Tile from "../Tile"
import { getMyTraces } from "../../MyTraces"

import MyIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"
import FileIcon from "@patternfly/react-icons/dist/esm/icons/file-code-icon"
import ClearIcon from "@patternfly/react-icons/dist/esm/icons/dumpster-icon"
import UploadIcon from "@patternfly/react-icons/dist/esm/icons/file-upload-icon"

export default function MyTraces() {
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()

  const myTraces = getMyTraces()

  const body = (
    <Stack hasGutter>
      You may view one of your previously uploaded traces, or upload a new one.
      <StackItem>
        <Flex>
          {myTraces.map(({ title, filename }) => (
            <Button key={filename} isInline variant="link" icon={<FileIcon />}>
              <Link
                to={
                  "/my/" + encodeURIComponent(title) + (s ? `?${s}` : "") + hash
                }
              >
                {title}
              </Link>
            </Button>
          ))}
        </Flex>
      </StackItem>
    </Stack>
  )

  return (
    <Tile title="My Traces" icon={<MyIcon />} body={body}>
      <Button isInline variant="link" icon={<UploadIcon />}>
        <Link to="/upload">Upload</Link>
      </Button>
      <Button isInline variant="link" icon={<ClearIcon />}>
        <Link to="/clear/my">Clear</Link>
      </Button>
    </Tile>
  )
}
