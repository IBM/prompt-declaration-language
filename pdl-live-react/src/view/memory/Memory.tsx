import { useMemo } from "react"

import Topology from "./Topology"
import extractVariables from "./model"

type Props = {
  block: import("../../pdl_ast").PdlBlock

  /** Block id -> ordinal */
  numbering?: Record<string, number>
}

export default function Variables({ block, numbering }: Props) {
  const { nodes, edges } = useMemo(() => extractVariables(block), [block])
  return <Topology nodes={nodes} edges={edges} numbering={numbering ?? {}} />
}
