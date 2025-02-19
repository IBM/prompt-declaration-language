import { useMemo } from "react"

import Topology from "./Topology"
import extractVariables from "./model"

type Props = {
  sml: import("../masonry/Toolbar").SML
  block: import("../../pdl_ast").PdlBlock

  /** Block id -> ordinal */
  numbering?: Record<string, number>
}

export default function Variables({ sml, block, numbering }: Props) {
  const { nodes, edges } = useMemo(() => extractVariables(block), [block])
  return (
    nodes.length > 0 && (
      <Topology
        sml={sml}
        nodes={nodes}
        edges={edges}
        numbering={numbering ?? {}}
      />
    )
  )
}
