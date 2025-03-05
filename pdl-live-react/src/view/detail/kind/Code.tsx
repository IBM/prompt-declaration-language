import Group from "../Group"

import Code from "../../code/Code"
import Result from "../../Result"

export default function CodeItems({
  block: { code, lang, pdl__result },
}: {
  block: import("../../../pdl_ast").CodeBlock
}) {
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
