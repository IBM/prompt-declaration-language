import { useMemo, useState } from "react"
import { Flex, FlexItem } from "@patternfly/react-core"

import Timeline from "../timeline/TimelineFromModel"

import Masonry from "./Masonry"
import computeModel from "./model"
import Toolbar, { type As } from "./Toolbar"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

const flex1 = { default: "flex_1" as const }

export default function MasonryTimelineCombo({ block }: Props) {
  const [as, setAs] = useState<As>("grid")
  const { base, masonry, numbering } = useMemo(
    () => computeModel(block),
    [block],
  )

  return (
    <>
      <Toolbar as={as} setAs={setAs} />

      <Flex>
        <FlexItem flex={flex1}>
          <Masonry model={masonry} as={as} />
        </FlexItem>

        <FlexItem>
          <Timeline model={base} numbering={numbering} />
        </FlexItem>
      </Flex>
    </>
  )
}
