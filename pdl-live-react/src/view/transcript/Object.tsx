import Block from "./Block"
import type Context from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  ctx: Context
  object: { [key: string]: PdlBlock }
}

export default function ObjectUI({ object, ctx }: Props) {
  return (
    <>
      <pre>{"{"}</pre>
      {Object.keys(object).forEach((key) => (
        <>
          <pre>{key + ":"}</pre>
          <Block data={object[key]} ctx={ctx} />
          <pre>,</pre>
        </>
      ))}
      <pre>{"}"}</pre>
    </>
  )
}
