import { Link } from "react-router"
import { Button } from "@patternfly/react-core"

import Tile from "../Tile"
import { getMyTraces } from "../../MyTraces"

import MyIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

export default function MyTraces() {
  const myTraces = getMyTraces()

  return (
    <Tile
      title="My Traces"
      icon={<MyIcon />}
      body="You may view one of your previously uploaded traces."
    >
      {myTraces.map(({ title, filename }) => (
        <Button key={filename} isInline variant="link">
          <Link to={"/my/" + encodeURIComponent(title)}>{title}</Link>
        </Button>
      ))}
    </Tile>
  )
}
