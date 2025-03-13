import Group from "../Group"

import Code from "../../code/Code"
import Result from "../../Result"
import { isArgs } from "../../../helpers"

export default function CodeItems({
  block,
}: {
  block:
    | import("../../../pdl_ast").ArgsBlock
    | import("../../../pdl_ast").CodeBlock
}) {
  const { lang, pdl__result } = block
  const code = isArgs(block) ? block.args.join(" ") : block.code
  return (
    <>
      {typeof code === "string" && (
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
      )}
      <Result result={pdl__result} term="Execution Output" />
    </>
  )
}
