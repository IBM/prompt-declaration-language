import stringSimilarity from "string-comparison"

import {
  hasResult,
  isTextBlock,
  isNonScalarPdlBlock,
  type NonScalarPdlBlock,
} from "../../helpers"

type BlockWithSimilarityMetrics = import("../../helpers").NonScalarPdlBlock & {
  pdl__similarity: number[]
  pdl__results: string[]
}

export function hasSimilarityMetrics(
  u: unknown,
): u is BlockWithSimilarityMetrics {
  const b = u as BlockWithSimilarityMetrics
  return (
    isNonScalarPdlBlock(b) &&
    Array.isArray(b.pdl__similarity) &&
    b.pdl__similarity.every((n) => typeof n === "number") &&
    Array.isArray(b.pdl__results) &&
    b.pdl__results.every((s) => typeof s === "string")
  )
}

export async function runIdempotencyCheck(
  block: NonScalarPdlBlock,
  run: import("./MasonryCombo").Runner,
) {
  // remove some fields from block
  const {
    def: _a,
    pdl__id: _e,
    pdl__result: _b,
    pdl__timing: _c,
    context: _d,
    ...restOfBlock
  } = block

  const looper: import("../../pdl_ast").TextBlock = {
    kind: "text" as const,
    pdl__id: block.pdl__id, // sigh, currently needed to satisfy isNonScalarPdlBlock()
    pdl__timing: block.pdl__timing, // sigh, currently needed to satisfy hasContextInformation() -> hasTimingInformation()
    context: block.context,
    text: Array(4)
      .fill(0)
      .map(() => Object.assign({}, restOfBlock, { contribute: [] })), // contribute:[] enables parallel model calls
  } satisfies import("../../pdl_ast").TextBlock
  const update = (outputBlock: import("../../helpers").NonScalarPdlBlock) => {
    if (isTextBlock(outputBlock) && Array.isArray(outputBlock.text)) {
      const results = outputBlock.text
        .filter(hasResult)
        .map((b) => b.pdl__result)
      const matrix: number[] = []
      for (let i = 0; i < results.length; i++) {
        const resi = results[i]
        if (typeof resi === "string") {
          for (let j = i + 1; j < results.length; j++) {
            const resj = results[j]
            if (typeof resj === "string") {
              matrix.push(
                stringSimilarity.diceCoefficient.similarity(resi, resj),
              )
            }
          }
        }
      }
      console.log("stability analysis matrix", matrix)
      console.log("stability analysis strings", results)
      return Object.assign({}, block, {
        pdl__similarity: matrix,
        pdl__results: results,
      })
    }
    return block
  }
  const res = await run(looper, true, update) // async=true
  console.log("stability raw results", res)
}
