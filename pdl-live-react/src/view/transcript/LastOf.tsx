import Block from "./Block"

import type Context from "../../Context"
import { withId } from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  blocks: PdlBlock[]
  ctx: Context
}

export default function LastOf({ blocks, ctx }: Props) {
  return blocks.map((block, idx) => (
    <Block key={idx} data={block} ctx={withId(ctx, idx)} />
  ))
}
