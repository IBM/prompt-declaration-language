import { Button } from "@patternfly/react-core"
import { Link, useLocation, useSearchParams } from "react-router"

import Tile from "../Tile"
import demos from "../../../demos/demos"

import DemoIcon from "@patternfly/react-icons/dist/esm/icons/file-code-icon"

export default function Demos() {
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()

  return (
    <Tile
      title="View a Demo"
      icon={<DemoIcon />}
      body="You may view one of the built-in PDL demos."
    >
      {demos.map((demo) => (
        <Button key={demo.name} isInline variant="link">
          <Link
            to={
              "/demos/" +
              encodeURIComponent(demo.name) +
              (s ? `?${s}` : "") +
              hash
            }
          >
            {demo.name}
          </Link>
        </Button>
      ))}
    </Tile>
  )
}
