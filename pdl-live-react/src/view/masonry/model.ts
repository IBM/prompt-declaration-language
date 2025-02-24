import { stringify } from "yaml"
import { computeModel as computeBaseModel } from "../timeline/model"

import {
  hasMessage,
  hasParser,
  hasResult,
  hasScalarResult,
  hasTimingInformation,
  type NonScalarPdlBlock,
} from "../../helpers"

import type Tile from "./Tile"

/** The final result of the block */
function result(block: import("../../pdl_ast").PdlBlock) {
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
}

/** Remove objects from the Masonry model that aren't helpful to display */
function removeFluff({ kind }: { kind?: string }) {
  // re: empty, these house only defs, which are spliced in below via
  // `withDefs()`
  return kind !== "if" && kind !== "empty"
}

export default function computeModel(block: import("../../pdl_ast").PdlBlock) {
  const base = computeBaseModel(block)

  const masonry: Tile[] = base
    .concat(result(block))
    .flatMap(({ id, block, children }) => {
      if (children.length === 0 && hasTimingInformation(block)) {
        return withDefs(block, [
          {
            id,
            def: block.def,
            kind: block.kind,
            message: hasMessage(block) ? block.message : undefined,
            content:
              typeof block.result === "object"
                ? stringify(block.result)
                : String(block.result),
            start_nanos: block.pdl__timing.start_nanos,
            end_nanos: block.pdl__timing.end_nanos,
            timezone: block.pdl__timing.timezone,
            lang:
              typeof block.result === "object"
                ? "yaml"
                : hasParser(block)
                  ? block.parser === "jsonl"
                    ? "json"
                    : block.parser
                  : undefined,
            crumb: true,
          },
        ])
      }

      return []
    })
    .filter(removeFluff)
    .sort((a, b) => (!/\./.test(a.id) ? 1 : a.id.localeCompare(b.id)))
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
                crumb: true,
                id: (block.id ?? "").replace(/\.?empty/g, ""),
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
