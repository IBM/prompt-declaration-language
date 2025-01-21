import { type ReactElement } from "react"

import BlocksConjoin from "./BlocksConjoin"

import Context, { withIter } from "../../Context"
import { isPdlBlock, type PdlBlock } from "../../helpers"

type Props = { blocks: (ReactElement | PdlBlock)[]; ctx: Context }

export default function Blocks({ blocks, ctx }: Props) {
  return blocks.flatMap((block, idx) =>
    !isPdlBlock(block) ? (
      block
    ) : (
      <BlocksConjoin key={idx} block={block} ctx={withIter(ctx, idx)} />
    ),
  )
}
