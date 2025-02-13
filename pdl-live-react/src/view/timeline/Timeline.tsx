import { useMemo } from "react"

import { computeModel } from "./model"
import TimelineFromModel from "./TimelineFromModel"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Timeline({ block }: Props) {
  const model = useMemo(() => computeModel(block), [block])

  return <TimelineFromModel model={model} />
}
