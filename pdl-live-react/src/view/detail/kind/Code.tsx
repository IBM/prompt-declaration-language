import Group from "../Group"

import Code from "../../code/Code"
import { isArgs, extractCode } from "../../../helpers"

export default function CodeItems({
  block,
}: {
  block:
    | import("../../../pdl_ast").ArgsBlock
    | import("../../../pdl_ast").CodeBlock
}) {
  const { lang } = block
  const code = isArgs(block) ? block.args.join(" ") : extractCode(block)

  return (
    <>
      <Group
        term="Code"
        description={
          <Code
            block={code.trim()}
            showLineNumbers
            language={
              lang === "pdl" || lang === "jinja" || lang === "command"
                ? "plaintext"
                : lang || "yaml"
            }
          />
        }
      />
    </>
  )
}
