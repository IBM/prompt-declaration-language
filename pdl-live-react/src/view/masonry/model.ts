import { stringify } from "yaml"
import { computeModel as computeBaseModel } from "../timeline/model"

import {
  isLLMBlock,
  hasInput,
  hasMessage,
  hasParser,
  hasScalarResult,
  hasModelUsage,
  hasResult,
  hasTimingInformation,
  capitalizeAndUnSnakeCase,
  extractStructuredModelResponse,
  completionRate,
  ptcRatio,
  type NonScalarPdlBlock,
} from "../../helpers"

import type Tile from "./Tile"
import { hasStabilityMetrics, type StabilityMetric } from "./stability"

/** The final result of the block */
/* function result(block: import("../../pdl_ast").PdlBlock) {
  if (hasResult(block) && hasTimingInformation(block)) {
    return [
      {
        id: block.pdl__id ?? "",
        depth: 0,
        parent: null,
        block,
        children: [],
      },
    ]
  }

  return []
} */

/** Remove objects from the Masonry model that aren't helpful to display */
function removeFluff({ kind, block }: Tile) {
  // re: empty, these house only defs, which are spliced in below via
  // `withDefs()`
  return (
    kind !== "if" &&
    kind !== "empty" &&
    (!hasResult(block) ||
      typeof block.pdl__result !== "string" ||
      block.pdl__result.trim().length > 0)
  )
}

export default function computeModel(block: import("../../pdl_ast").PdlBlock) {
  const base = computeBaseModel(block)

  const masonry: Tile[] = base
    // .concat(result(block))
    .flatMap(({ id, block, children }) => {
      if (children.length === 0 && hasTimingInformation(block)) {
        const { resultForDisplay, meta, lang } = isLLMBlock(block)
          ? extractStructuredModelResponse(block)
          : {
              resultForDisplay:
                typeof block.pdl__result === "object"
                  ? stringify(block.pdl__result)
                  : typeof block.pdl__result === "string" ||
                      typeof block.pdl__result === "number" ||
                      typeof block.pdl__result === "boolean"
                    ? block.pdl__result
                    : String(block.pdl__result),
              meta: undefined,
              lang:
                typeof block.pdl__result === "object"
                  ? "yaml"
                  : hasParser(block)
                    ? block.parser === "jsonl"
                      ? "json"
                      : block.parser
                    : undefined,
            }

        const stability = hasStabilityMetrics(block)
          ? block.pdl__stability
          : ([] satisfies StabilityMetric[])
        return withDefs(block, [
          {
            id,
            def: block.def,
            kind: block.kind,
            lang,
            message: hasInput(block)
              ? String(
                  block.pdl__model_input[block.pdl__model_input.length - 1]
                    .content,
                )
              : hasMessage(block)
                ? block.message
                : undefined,
            footer1Key: meta?.[0]?.[0]
              ? capitalizeAndUnSnakeCase(String(meta[0][0]))
              : undefined,
            footer1Value: meta?.[0]?.[1] ? String(meta[0][1]) : undefined,

            footer2Key: hasModelUsage(block) ? "Completion Rate" : undefined,
            footer2Value: hasModelUsage(block)
              ? completionRate(block).toFixed(0) + " tokens/sec"
              : undefined,
            footer3Key: hasModelUsage(block)
              ? "Prompt/Completion Ratio"
              : undefined,
            footer3Value: hasModelUsage(block)
              ? (100 * ptcRatio(block)).toFixed(2) + "%"
              : undefined,

            stability,
            //footer2Key: stability.map((m) => `T=${m.temperature} Stability`),
            //footer2Value: stability.map((m) => m.matrix),
            //footer2DetailHeader: stability.map((m) => `Stability across calls with the same input (temperature=${m.temperature})`),
            //footer2DetailBody: stability.map((m) => m.results),

            block,
            actions: isLLMBlock(block) ? ["run"] : [],
            content: resultForDisplay,
            start_nanos: block.pdl__timing.start_nanos,
            end_nanos: block.pdl__timing.end_nanos,
            timezone: block.pdl__timing.timezone,
          },
        ])
      }

      return []
    })
    .filter(removeFluff)
    .sort((a, b) =>
      !/\./.test(a.id) ? 1 : !/\./.test(b.id) ? -1 : a.id.localeCompare(b.id),
    )
  // ^^^ re: the regexp test, we want to place the "final output"
  // (i.e. blocks without a "." in their id) at the end

  const numbering = masonry.reduce(
    (N, node, idx) => {
      N[node.id] = idx + 1
      return N
    },
    {} as Record<string, number>,
  )

  return { base, masonry, numbering }
}

function withDefs(block: NonScalarPdlBlock, tiles: Tile[]) {
  return [
    ...(!block.defs
      ? []
      : Object.entries(block.defs).flatMap(([def, v]) =>
          !v
            ? []
            : {
                id:
                  (block.pdl__id ?? "").replace(/\.?empty/g, "") + ".0.define",
                kind: "",
                def,
                lang: hasParser(v)
                  ? v.parser === "jsonl"
                    ? "json"
                    : (v.parser as Tile["lang"])
                  : undefined,
                content: hasScalarResult(v) ? v.pdl__result : "",
              },
        )),
    ...tiles,
  ]
}
