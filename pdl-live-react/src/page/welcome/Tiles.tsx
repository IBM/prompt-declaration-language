import { Gallery } from "@patternfly/react-core"

import Demos from "./tiles/Demos"
import Upload from "./tiles/Upload"
import MyTraces from "./tiles/MyTraces"

export default function Tiles() {
  return (
    <Gallery hasGutter>
      <Upload />
      <MyTraces />
      <Demos />
    </Gallery>
  )
}
