import { useMemo, useState } from "react"

import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As } from "./Toolbar"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function MasonryTimelineCombo({ block }: Props) {
  const [as, setAs] = useState<As>("grid")
  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  return (
    <>
      <Toolbar as={as} setAs={setAs} />
      <Masonry model={masonry} as={as}>
        <Timeline model={base} numbering={numbering} />
      </Masonry>
    </>
  )
}
