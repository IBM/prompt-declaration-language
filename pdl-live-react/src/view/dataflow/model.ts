import { stringify } from "yaml"
import {
  EdgeStyle,
  EdgeAnimationSpeed,
  NodeShape,
  type NodeModel,
  type EdgeModel,
} from "@patternfly/react-topology"

import type PdlModel from "../timeline/model"
import { type PdlBlock } from "../../pdl_ast"
import { computeModel as computePdlModel } from "../timeline/model"
import { hasContextInformation, hasResult, nonNullable } from "../../helpers"

type SymbolTable = Record<string, string | number | boolean> // map from def site id to value defined

const NODE_DIAMETER = 15

function exists(
  S: SymbolTable,
  value: string | number | boolean,
): string | null {
  for (const [k, v] of Object.entries(S)) {
    //    if (String(value).includes(String(v))) {
    if (v === value) {
      return k
    }
  }
  return null
}

function lookup(S: SymbolTable, value: string) {
  const parents: string[] = []
  for (const [k, v] of Object.entries(S)) {
    if (
      typeof v !== "string"
        ? value.includes(String(v))
        : v.length > 0 && value.includes(v)
    ) {
      // For now, don't try to guess at def-use for small strings,
      // such as "yes".
      parents.push(k)
    }
  }
  return parents.sort()
}

function computeGraphModel(pdlModel: PdlModel): {
  nodes: NodeModel[]
  edges: EdgeModel[]
} {
  const symbolTable: SymbolTable = {}
  const dataflowEdges: EdgeModel[] = []

  // So we can convey a partial ordering in the UI
  const ordinals = ordinalize(pdlModel)

  const nodes: NodeModel[] = pdlModel.flatMap(
    ({ id, parent, block }, blockIdx) => {
      const resultId = id + "-result"
      if (hasResult(block)) {
        symbolTable[resultId] =
          typeof block.result === "object"
            ? stringify(block.result)
            : block.result
      }

      // No need to add a new node for a value we've already
      // represented in the model (but we do add an edge, just
      // above)
      if (hasContextInformation(block)) {
        block.context.forEach((ctx) => {
          const { content } = ctx
          if (typeof content !== "string") {
            return
          }
          const contextId = exists(symbolTable, content)
          if (contextId) {
            dataflowEdges.push({
              id: `edge-${contextId}-${resultId}`,
              type: "edge",
              source: contextId,
              target: resultId,
              edgeStyle: EdgeStyle.dashedMd,
              animationSpeed: EdgeAnimationSpeed.medium,
            })
          }
        })
      }

      const contexts = !hasContextInformation(block)
        ? []
        : block.context.filter(
            ({ content }) =>
              typeof content !== "string" || !exists(symbolTable, content),
          )
      const contextItems: NodeModel[] = [
        ...contexts.flatMap((ctx, idx) => {
          const { role, content } = ctx

          // wtf typescript sucks
          if (typeof role !== "string" || typeof content !== "string") {
            return []
          }

          /*const dataflowParents = !content
                ? []
              : lookup(symbolTable, content)
            dataflowParents.forEach((dataflowParent) => {
                dataflowEdges.push({
                  id: `edge-${dataflowParent}-${contextId}`,
                  type: "edge",
                  source: dataflowParent,
                  target: contextId,
                  edgeStyle: EdgeStyle.dashedMd,
                  animationSpeed: EdgeAnimationSpeed.medium,
                })
              })*/

          const contextId = id + "-" + idx

          dataflowEdges.push({
            id: `edge-${contextId}-${resultId}`,
            type: "edge",
            source: contextId,
            target: resultId,
            edgeStyle: EdgeStyle.dashedMd,
            animationSpeed: EdgeAnimationSpeed.medium,
          })
          symbolTable[contextId] = content

          return [
            {
              id: contextId,
              type: "node",
              label: content.slice(0, 30),
              width: NODE_DIAMETER, //"content" in ctx && typeof ctx.content === "string" ? Math.min(ctx.content.length,20)*16*2 : NODE_DIAMETER,
              height: NODE_DIAMETER,
              shape: NodeShape.rect,
              data: {
                ordinal: ordinals[blockIdx] + "." + letter(idx + 1),
                variant: role[0].toUpperCase() + role.slice(1),
                content,
              },
            },
          ]
        }),

        ...(!hasResult(block)
          ? []
          : [
              {
                id: resultId,
                type: "node",
                label: !parent
                  ? (typeof block.result === "object"
                      ? stringify(block.result)
                      : String(block.result)
                    ).slice(0, 20)
                  : block.kind === "model"
                    ? "invoke LLM()"
                    : (typeof block.result === "object"
                        ? stringify(block.result)
                        : String(block.result)
                      ).slice(0, 30), //block.def ? `${block.kind} $${block.def}` : !parent ? "Final Result" : block.kind === "model" ? "LLM Call" : block.kind ?? "Result",
                width: !parent ? NODE_DIAMETER * 3 : NODE_DIAMETER, //Math.min(content.length,20)*16*2,
                height: !parent ? NODE_DIAMETER * 3 : NODE_DIAMETER,
                shape: !parent ? NodeShape.hexagon : NodeShape.rect,
                data: {
                  ordinal:
                    ordinals[blockIdx] +
                    (hasContextInformation(block)
                      ? "." + letter(contexts.length + 1)
                      : ""),
                  variant: !parent
                    ? "Final Result"
                    : block.def
                      ? `$${block.def}=`
                      : block.kind === "model"
                        ? "LLM"
                        : block.kind === "read"
                          ? "User Input"
                          : block.kind,
                  /*variant: !parent
                    ? "Final Result"
                    : block.def
                      ? "Def"
                      : undefined,*/
                  content:
                    typeof block.result === "object"
                      ? stringify(block.result)
                      : String(block.result),
                },
              },
            ]),
      ]

      const group = {
        id: id,
        children: contextItems.map((_) => _.id),
        type: "group",
        group: true,
        label: "LLM",
        style: {
          padding: 80,
        },
      }

      return block.kind === "model" ? [group, ...contextItems] : contextItems
    },
  )

  pdlModel.forEach(({ id, block }) => {
    if (hasResult(block) && typeof block.result === "string") {
      const resultId = id + "-result"
      const dataflowParents = lookup(symbolTable, block.result).filter(
        (_) => _ !== resultId,
      )
      dataflowParents
        .filter((_) => _ !== resultId)
        .forEach((dataflowParent) => {
          dataflowEdges.push({
            id: `edge-${dataflowParent}-${resultId}`,
            type: "edge",
            source: dataflowParent,
            target: resultId,
            edgeStyle: EdgeStyle.dashedMd,
            animationSpeed: EdgeAnimationSpeed.medium,
          })
        })
    }
  })

  /*const controlFlowEdges: EdgeModel[] = pdlModel.reduce((edges, { id, parent }) => {
    if (parent) {
      // TODO O(N^2)
      const pid = parent.id + "-result"
      const mid = id + "-result"
      const parentNode = nodes.find((_) => mid === pid)
      if (parentNode) {
        edges.push({
          id: `edge-${parent.id}-${id}`,
          type: "edge",
          target: pid,
          source: mid,
          edgeStyle: EdgeStyle.default,
        })
      }
    }
    return edges
  }, [] as EdgeModel[])*/

  return { nodes, edges: dataflowEdges /*.concat(controlFlowEdges)*/ }
}

export default function computeModel(block: PdlBlock) {
  return computeGraphModel(collapse(computePdlModel(block)))
}

function ignore({ block, parent }: PdlModel[number]) {
  return (
    block.kind === "if" ||
    block.kind === "repeat_until" ||
    (block.kind === "text" && !!parent)
  )
}

function findNotIgnoredParent(node: PdlModel[number]) {
  while (node.parent && ignore(node.parent)) {
    node = node.parent
  }

  return node.parent
}

function collapse(pdlModel: PdlModel): PdlModel {
  return pdlModel
    .map((node) => {
      if (!ignore(node)) {
        node.parent = findNotIgnoredParent(node)
        return node
      } else {
        return null
      }
    })
    .filter(nonNullable)
}

/** Compute post-order ordinals for nodes in the given model */
function ordinalize(pdlModel: PdlModel): number[] {
  let ordinal = 1
  const ordinals: number[] = []
  const stack: number[] = pdlModel
    .map((node, idx) => (!node.parent ? idx + 1 : null))
    .filter(nonNullable)
    .reverse()

  let N = 0
  while (stack.length > 0) {
    const nodeIdx = stack.pop()

    if (nodeIdx === undefined) {
      // keep typescript happy
      break
    } else if (N++ > 2 * pdlModel.length) {
      console.error("Bug!")
      break
    }

    if (nodeIdx < 0) {
      ordinals[-nodeIdx - 1] = ordinal++
    } else if (nodeIdx >= 0) {
      stack.push(-nodeIdx)
      childrenOf(nodeIdx - 1, pdlModel)
        .reverse()
        .forEach((childIdx) => stack.push(childIdx + 1))
    }
  }

  return ordinals
}

/** Oof, expensive */
function childrenOf(parentIdx: number, model: PdlModel) {
  const parent = model[parentIdx]
  return model
    .map((node, idx) => (node.parent === parent ? idx : null))
    .filter(nonNullable)
}

function letter(idx: number) {
  return String.fromCharCode(96 + idx)
}
