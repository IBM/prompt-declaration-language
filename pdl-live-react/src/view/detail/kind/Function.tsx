import { stringify } from "yaml"

import Group from "../Group"
import CodeGroup from "../../transcript/CodeGroup"

export default function FunctionItems({
  block: { def, function: func, return: retrn },
}: {
  block: import("../../../pdl_ast").FunctionBlock
}) {
  return (
    <>
      {def && <Group description={def} term="Name" />}
      <CodeGroup code={stringify(func)} term="Parameters" />
      <CodeGroup code={stringify(retrn)} term="Body" />
    </>
  )
}
