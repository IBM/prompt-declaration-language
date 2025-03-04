import { PdlBlock } from "../../pdl_ast"
import { hasContextInformation, isNonScalarPdlBlock } from "../../helpers"

import { childrenOf } from "../timeline/model"

export type Node = {
  id: string
  label: string
}

export type Edge = {
  label: string
  source: string
  target: string
}

function label0(id: string) {
  const m1 = id.match(/\.?([^.]+)(\.\d+)$/)
  if (m1) {
    return m1[1] + m1[2]
  } else {
    return id.replace(/.+\.([^.]+)$/, "$1")
  }
}

function label(id: string) {
  const l = label0(id)
  switch (l) {
    case "model":
      return "LLM"
    default:
      return l[0].toUpperCase() + l.slice(1)
  }
}

export default function extractVariables(block: PdlBlock): {
  nodes: Node[]
  edges: Edge[]
} {
  const edges = extractVariablesIter(block)
  const nodes = edges
    .flatMap(({ source, target }) => [
      { id: source, label: label(source) },
      { id: target, label: label(target) },
    ])
    .sort((a, b) => -a.id.localeCompare(b.id))
  return { nodes, edges }
}

function extractVariablesIter(block: PdlBlock): Edge[] {
  if (!isNonScalarPdlBlock(block)) {
    return []
  }

  const mine: Edge[] = !hasContextInformation(block)
    ? []
    : block.context
        .filter(({ defsite }) => !!defsite)
        .map(({ role, defsite }) => ({
          label: String(role),
          source: String(defsite),
          target: block.pdl__id ?? "",
        }))
        .filter((edge) => !!edge.source && !!edge.target)

  return mine.concat(childrenOf(block).flatMap(extractVariablesIter))
}
