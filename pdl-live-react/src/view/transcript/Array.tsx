import show_block from "./Block"

import Context, { withIter } from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  array: PdlBlock[]
  ctx: Context
}

export default function show_array({ array, ctx }: Props) {
  return (
    <>
      <pre>{"["}</pre>
      {array.flatMap((block, idx) =>
        [
          <div key={idx}>{show_block(block, withIter(ctx, idx))}</div>,
          idx < array.length - 1 && <pre>,</pre>,
        ].filter(Boolean),
      )}
      <pre>{"]"}</pre>
    </>
  )
}
