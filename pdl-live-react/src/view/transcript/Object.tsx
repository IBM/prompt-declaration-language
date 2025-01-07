import show_block from "./Block"
import type Context from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  ctx: Context
  object: { [key: string]: PdlBlock }
}

export default function show_object({ object, ctx }: Props) {
  return (
    <>
      <pre>{"{"}</pre>
      {Object.keys(object).forEach((key) => (
        <>
          <pre>{key + ":"}</pre>
          {show_block(object[key], ctx)}
          <pre>,</pre>
        </>
      ))}
      <pre>{"}"}</pre>
    </>
  )
}
