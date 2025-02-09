import { useMemo } from "react"
import MasonryView, { ResponsiveMasonry } from "react-responsive-masonry"

import { computeModel } from "../timeline/model"
import {
  hasMessage,
  hasParser,
  hasScalarResult,
  hasTimingInformation,
  isNonScalarPdlBlock,
  isTextBlock,
  type NonScalarPdlBlock,
} from "../../helpers"

import MasonryTile, { type Tile } from "./MasonryTile"

import "./Masonry.css"

type Props = {
  block: import("../../pdl_ast").PdlBlock
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

export default function Masonry({ block }: Props) {
  const model = useMemo<Tile[]>(
    () =>
      computeModel(block)
        .filter(({ block }) => block.kind !== "if")
        .flatMap(({ id, block, children }) => {
          if (isTextBlock(block)) {
            if (!Array.isArray(block.text)) {
              if (isNonScalarPdlBlock(block.text)) {
                const content = String(block.text).trim()
                if (content.length > 0) {
                  return [{ id, content }]
                }
              }
            } else {
              return withDefs(
                block,
                block.text.flatMap((child, idx) => {
                  if (
                    !isNonScalarPdlBlock(child) &&
                    (typeof child !== "string" || child.trim().length > 0)
                  ) {
                    return [
                      {
                        id: `${id}.${idx}`,
                        content: String(child).trim(),
                      },
                    ]
                  }
                  return []
                }),
              )
            }
          } else if (
            children.length === 0 &&
            hasScalarResult(block) &&
            hasTimingInformation(block)
          ) {
            return withDefs(block, [
              {
                id,
                def: block.def,
                kind: block.kind,
                message: hasMessage(block) ? block.message : undefined,
                content: String(block.result),
                start_nanos: block.start_nanos,
                end_nanos: block.end_nanos,
                timezone: block.timezone,
                lang: hasParser(block)
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
        .sort((a, b) => a.id.localeCompare(b.id)),
    [block],
  )

  // gutterBreakpoints={{350: "12px", 750: "16px", 900: "24px"}}
  return (
    <ResponsiveMasonry
      className="pdl-masonry-responsive"
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
    >
      <MasonryView className="pdl-masonry">
        {model.map((props, idx) => (
          <MasonryTile key={props.id} {...props} idx={idx + 1} />
        ))}
      </MasonryView>
    </ResponsiveMasonry>
  )
}
