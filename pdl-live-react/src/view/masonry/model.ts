import { stringify } from "yaml"
import { computeModel as computeBaseModel } from "../timeline/model"

import {
  isLLMBlock,
  hasInput,
  hasMessage,
  hasParser,
  hasScalarResult,
  hasTimingInformation,
  capitalizeAndUnSnakeCase,
  extractStructuredModelResponse,
  type NonScalarPdlBlock,
} from "../../helpers"

import type Tile from "./Tile"

/** The final result of the block */
/* function result(block: import("../../pdl_ast").PdlBlock) {
  if (hasResult(block) && hasTimingInformation(block)) {
    return [
      {
        id: block.id ?? "",
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
function removeFluff({ kind }: { kind?: string }) {
  // re: empty, these house only defs, which are spliced in below via
  // `withDefs()`
  return kind !== "if" && kind !== "empty"
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
                typeof block.result === "object"
                  ? stringify(block.result)
                  : String(block.result),
              meta: undefined,
              lang:
                typeof block.result === "object"
                  ? "yaml"
                  : hasParser(block)
                    ? block.parser === "jsonl"
                      ? "json"
                      : block.parser
                    : undefined,
            }

        return withDefs(block, [
          {
            id,
            def: block.def,
            kind: block.kind,
            lang,
            message: hasInput(block)
              ? block.input
              : hasMessage(block)
                ? block.message
                : undefined,
            footer1Key: meta?.[0]?.[0]
              ? capitalizeAndUnSnakeCase(String(meta[0][0]))
              : undefined,
            footer1Value: meta?.[0]?.[1] ? String(meta[0][1]) : undefined,
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
                id: (block.id ?? "").replace(/\.?empty/g, "") + ".0.define",
                kind: "",
                def,
                lang: hasParser(v)
                  ? v.parser === "jsonl"
                    ? "json"
                    : (v.parser as Tile["lang"])
                  : undefined,
                content: hasScalarResult(v) ? String(v.result) : "",
              },
        )),
    ...tiles,
  ]
}
