import { type ReactElement } from "react"

import show_block_conjoin from "./BlocksConjoin"

import Context, { withIter } from "../../Context"
import { isPdlBlock, type PdlBlock } from "../../helpers"

export default function show_blocks(
  blocks: (ReactElement | PdlBlock)[],
  ctx: Context,
) {
  return blocks.flatMap((block, idx) =>
    !isPdlBlock(block) ? block : show_block_conjoin(block, withIter(ctx, idx)),
  )
}
