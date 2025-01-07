import show_block from "./Block"
import { withIter } from "../../Context"
import type Context from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  className?: string
  blocks: PdlBlock[] | PdlBlock
  ctx: Context
  join_str?: string
}

export default function Text({ className, blocks, ctx, join_str }: Props) {
  if (Array.isArray(blocks)) {
    return (
      <div className={"pdl_text" + (className ? " " + className : "")}>
        {blocks.flatMap((block, idx) => [
          join_str && <div key={idx + "-join"}>{join_str}</div>,
          <div key={idx}>{show_block(block, withIter(ctx, idx))}</div>,
        ])}
      </div>
    )
  } else {
    return show_block(blocks, ctx)
  }
}
