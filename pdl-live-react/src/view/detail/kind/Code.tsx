import Group from "../Group"

import Code from "../../Code"
import Result from "../../transcript/Result"

export default function CodeItems({
  block: { code, lang, result },
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
      <Result result={result} term="Execution Output" />
    </>
  )
}
