import { useMemo } from "react"
//import { Link, useLocation } from "react-router"

import Topology from "./Topology"
import extractVariables from "./model"

type Props = {
  block: import("../../pdl_ast").PdlBlock
}

export default function Variables({ block }: Props) {
  //const { hash } = useLocation()
  const { nodes, edges } = useMemo(() => extractVariables(block), [block])
  return <Topology nodes={nodes} edges={edges} />
}
