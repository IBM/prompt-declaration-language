import { Button, Panel, PanelMain } from "@patternfly/react-core"
import { Link, useLocation, useSearchParams } from "react-router"

import Tile from "./welcome/Tile"
import Result from "../view/Result"
import Welcome from "./welcome/Welcome"

import { hasResult } from "../helpers"
import { getMyTraces } from "./MyTraces"
import { nonNullable } from "../helpers"

import MyIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

function MyTiles() {
  const { hash } = useLocation()
  const [searchParams] = useSearchParams()
  const s = searchParams.toString()

  return getMyTraces()
    .map(({ title, filename, value }) => {
      try {
        // TODO useMemo()
        const data = JSON.parse(value)
        return (
          <Tile
            key={filename}
            title={title}
            icon={<MyIcon />}
            className="pdl-masonry-tile"
            body={
              hasResult(data) ? (
                <Panel
                  isScrollable
                  variant="raised"
                  className="pdl-masonry-tile-panel"
                >
                  <PanelMain maxHeight="300px">
                    <Result result={data.pdl__result} term="" />
                  </PanelMain>
                </Panel>
              ) : (
                <>View {title}</>
              )
            }
          >
            <Button isInline variant="link">
              <Link
                to={
                  "/my/" + encodeURIComponent(title) + (s ? `?${s}` : "") + hash
                }
              >
                Show this Trace
              </Link>
            </Button>
          </Tile>
        )
      } catch (_err) {
        return null
      }
    })
    .filter(nonNullable)
}

export default function MyTraces() {
  return (
    <Welcome
      breadcrumb1="My Traces"
      intro="Here are your recently uploaded traces"
      tiles={<MyTiles />}
    />
  )
}
