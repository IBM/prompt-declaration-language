import Block from "./Block"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  object: { [key: string]: PdlBlock }
}

export default function ObjectUI({ object }: Props) {
  return (
    <>
      <pre>{"{"}</pre>
      {Object.keys(object).forEach((key) => (
        <>
          <pre>{key + ":"}</pre>
          <Block data={object[key]} />
          <pre>,</pre>
        </>
      ))}
      <pre>{"}"}</pre>
    </>
  )
}
