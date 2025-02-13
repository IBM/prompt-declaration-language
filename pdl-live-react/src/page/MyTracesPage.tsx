import { Link } from "react-router"
import { Button, Panel, PanelMain } from "@patternfly/react-core"

import Tile from "./welcome/Tile"
import Result from "../view/Result"
import Welcome from "./welcome/Welcome"

import { hasResult } from "../helpers"
import { getMyTraces } from "./MyTraces"
import { nonNullable } from "../helpers"

import MyIcon from "@patternfly/react-icons/dist/esm/icons/user-icon"

function myTiles() {
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
            body={
              hasResult(data) ? (
                <Panel isScrollable>
                  <PanelMain maxHeight="200px">
                    <Result result={data.result} />
                  </PanelMain>
                </Panel>
              ) : (
                <>View {title}</>
              )
            }
          >
            <Button isInline variant="link">
              <Link to={"/my/" + encodeURIComponent(title)}>
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
      tiles={myTiles()}
    />
  )
}
