import { stringify } from "yaml"
import { computeModel as computeBaseModel } from "../timeline/model"

import {
  hasMessage,
  hasParser,
  hasScalarResult,
  hasTimingInformation,
  type NonScalarPdlBlock,
} from "../../helpers"

import type Tile from "./Tile"

export default function computeModel(block: import("../../pdl_ast").PdlBlock) {
  const base = computeBaseModel(block)
  const masonry: Tile[] = base
    .filter(({ block }) => block.kind !== "if")
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
    .sort((a, b) => a.id.localeCompare(b.id))

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
                id: block.id ?? "",
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
