import Block from "./Block"

import Context, { withIter } from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  array: PdlBlock[]
  ctx: Context
}

export default function Array({ array, ctx }: Props) {
  return array.map((block, idx) => [
    <Block key={idx} data={block} ctx={withIter(ctx, idx)} />,
  ])
}
