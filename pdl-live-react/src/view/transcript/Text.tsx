import Block from "./Block"
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
          <Block key={idx} data={block} ctx={withIter(ctx, idx)} />,
        ])}
      </div>
    )
  } else {
    return <Block data={blocks} ctx={ctx} />
  }
}
