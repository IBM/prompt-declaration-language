import { stringify } from "yaml"

import Group from "../Group"
import CodeGroup from "../../code/CodeGroup"
import { block_code_cleanup } from "../../../pdl_code_cleanup"

export default function FunctionItems({
  block: { def, function: func, return: retrn },
}: {
  block: import("../../../pdl_ast").FunctionBlock
}) {
  return (
    <>
      {def && <Group description={def} term="Name" />}
      <CodeGroup code={stringify(func)} term="Parameters" />
      <CodeGroup code={stringify(block_code_cleanup(retrn))} term="Body" />
    </>
  )
}
