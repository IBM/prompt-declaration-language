import { PdlBlock } from "../../pdl_ast"

import {
  hasContextInformation,
  hasResult,
  isNonScalarPdlBlock,
  NonScalarPdlBlock as Block,
} from "../../helpers"

import { childrenOf } from "../timeline/model"

type Node = {
  incrNanos: number
  block: Block
  name: string
  value: PdlBlock
  defsiteId?: string
  defsite?: Block
}

export default function extractVariables(block: PdlBlock): Node[] {
  const nodes = extractVariablesIter(block)

  nodes.forEach((node) => {
    if (typeof node.defsiteId === "string") {
      const defNode = nodes.find((n) => n.block.id === node.defsiteId)
      if (defNode) {
        node.defsite = defNode.block
      }
    }
  })

  return (
    nodes
      //.filter((node) => node.defs.length > 0 || node.uses.length > 0)
      .map((node, idx, A) =>
        idx === 0
          ? node
          : Object.assign(node, {
              incrNanos:
                (node.block.start_nanos || 0) -
                (A[idx - 1].block.start_nanos || 0),
            }),
      )
  )
}

function extractVariablesIter(block: PdlBlock): Node[] {
  if (!isNonScalarPdlBlock(block)) {
    return []
  }

  const myDefs: Node[] = Object.entries(block.defs || [])?.map(
    ([name, value]) => ({
      incrNanos: 0,
      block,
      name,
      value,
    }),
  )
  const myDef: Node[] =
    !hasResult(block) || !block.def
      ? []
      : [{ incrNanos: 0, block, name: block.def, value: block.result }]

  const uses: Node[] = !hasContextInformation(block)
    ? []
    : block.context.map(({ role, content, defsite }) => ({
        incrNanos: 0,
        block,
        name: String(role),
        value: String(content),
        defsiteId: String(defsite),
      }))

  return [
    ...myDefs,
    ...uses,
    ...myDef,
    ...childrenOf(block).flatMap(extractVariablesIter),
  ]
}
