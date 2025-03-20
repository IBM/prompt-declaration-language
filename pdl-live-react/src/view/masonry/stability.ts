import stringSimilarity from "string-comparison"

import {
  hasResult,
  isTextBlock,
  isLLMBlock,
  isNonScalarPdlBlock,
  type ModelBlock,
  type NonScalarPdlBlock,
  type PdlBlockWithResult,
} from "../../helpers"

export type StabilityMetric = {
  temperature: number
  matrix: number[]
  results: string[]
}

export type BlockWithStabilityMetrics =
  import("../../helpers").NonScalarPdlBlock & {
    pdl__stability: StabilityMetric[]
  }

export function hasStabilityMetrics(
  u: unknown,
): u is BlockWithStabilityMetrics {
  const b = u as BlockWithStabilityMetrics
  return isNonScalarPdlBlock(b) && Array.isArray(b.pdl__stability)
}

function addTemperature(block: NonScalarPdlBlock, temperature: number) {
  if (isLLMBlock(block)) {
    return Object.assign({}, block, {
      contribute: [], // enables parallel model calls
      parameters: Object.assign({}, block.parameters ?? {}, {
        temperature,
      }),
    })
  }

  return block
}

export async function runNTimes(
  block: NonScalarPdlBlock,
  run: import("./MasonryCombo").Runner,
  N: number,
  temperatures: number[],
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
    text: temperatures.flatMap((temperature) =>
      Array(N)
        .fill(0)
        .map(() => addTemperature(restOfBlock, temperature)),
    ),
  } satisfies import("../../pdl_ast").TextBlock

  console.log("runNTimes", looper.text)

  // Update the block mode with the stability analysis
  const update = (outputBlock: import("../../helpers").NonScalarPdlBlock) => {
    if (isTextBlock(outputBlock) && Array.isArray(outputBlock.text)) {
      const pdl__stability = Object.entries(
        outputBlock.text.reduce(groupByTemperature, {} satisfies Grouping),
      )
        .map(([temperature, blocks]) => {
          const results = blocks.map((b) => b.pdl__result)
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

          // re: Number, sigh, javascript stringifies keys of records
          return { temperature: Number(temperature), matrix, results }
        })
        .sort((a, b) => a.temperature - b.temperature)

      console.log("stability analysis metrics", pdl__stability)
      return Object.assign({}, block, {
        pdl__stability,
      })
    }
    return block
  }
  const res = await run(looper, true, update) // async=true
  console.log("stability raw results", res)
}

type Grouping = Record<number, (PdlBlockWithResult & ModelBlock)[]>

function groupByTemperature(
  G: Grouping,
  block: import("../../pdl_ast").PdlBlock,
): Grouping {
  if (hasResult(block) && isLLMBlock(block) && isParameters(block.parameters)) {
    const temperature = block.parameters.temperature ?? 0
    if (typeof temperature === "number") {
      if (!(temperature in G)) {
        G[temperature] = []
      }

      G[temperature].push(block)
    }
  }

  return G
}

function isLocalizedExpression(
  p: unknown,
): p is import("../../pdl_ast").LocalizedExpression {
  return (
    typeof p === "object" &&
    !!p &&
    "pdl__expr" in p &&
    typeof p.pdl__expr === "object"
  )
}

function isParameters(
  p: ModelBlock["parameters"],
): p is Record<string, unknown> {
  return typeof p === "object" && !isLocalizedExpression(p)
}
