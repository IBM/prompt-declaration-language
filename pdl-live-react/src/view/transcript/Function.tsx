import { stringify } from "yaml"

import Query from "./Query"
import CodeGroup from "./CodeGroup"

type Props = {
  f: import("../../pdl_ast").FunctionBlock
  ctx: import("../../Context").default
}

export default function Function({ f, ctx }: Props) {
  return (
    <>
      {f.def && <Query q={f.def} prompt="Name" ctx={ctx} />}
      <CodeGroup code={stringify(f.function)} ctx={ctx} term="Parameters" />
      <CodeGroup code={stringify(f.return)} ctx={ctx} term="Body" />
    </>
  )
}
