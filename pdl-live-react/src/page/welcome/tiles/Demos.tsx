import { Link } from "react-router"
import { Button } from "@patternfly/react-core"

import Tile from "../Tile"
import demos from "../../../demos/demos"

export default function Demos() {
  return (
    <Tile
      title="View a Demo"
      body="You may view one of the built-in PDL demos."
    >
      {demos.map((demo) => (
        <Button key={demo.name} isInline variant="link">
          <Link to={"/demos/" + encodeURIComponent(demo.name)}>
            {demo.name}
          </Link>
        </Button>
      ))}
    </Tile>
  )
}
