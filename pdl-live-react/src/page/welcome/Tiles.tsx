import { type ReactNode } from "react"
import { Gallery } from "@patternfly/react-core"

import Demos from "./tiles/Demos"
import MyTraces from "./tiles/MyTraces"

type Props = {
  tiles?: ReactNode | ReactNode[]
}

const minWidths = { default: "400px" }

export default function Tiles(props: Props) {
  return (
    <Gallery hasGutter minWidths={minWidths}>
      {props.tiles ?? (
        <>
          <MyTraces />
          <Demos />
        </>
      )}
    </Gallery>
  )
}
