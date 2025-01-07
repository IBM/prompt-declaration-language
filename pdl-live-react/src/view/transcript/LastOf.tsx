import show_block from "./Block"

import type Context from "../../Context"
import { withId } from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  blocks: PdlBlock[]
  ctx: Context
}

export default function LastOf({ blocks, ctx }: Props) {
  return blocks.flatMap((block, idx) => show_block(block, withId(ctx, idx)))
}
