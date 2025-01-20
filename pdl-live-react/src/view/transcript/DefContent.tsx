import Code from "../Code"
import Value from "./Value"
import show_block from "./Block"

import { hasParser, hasResult, isPdlBlock } from "../../helpers"

type Props = {
  value: import("../../pdl_ast").PdlBlock
  ctx: import("../../Context").default
}

export default function DefContent({ value, ctx }: Props) {
  return (
    <div className="pdl-variable-definition-content">
      {hasResult(value) && isPdlBlock(value.result) ? (
        hasParser(value) &&
        (value.parser === "yaml" ||
          value.parser === "json" ||
          value.parser === "jsonl") ? (
          <Code
            block={value.result}
            darkMode={ctx.darkMode}
            limitHeight={false}
            language={value.parser === "jsonl" ? "json" : value.parser}
          />
        ) : typeof value.result === "string" ? (
          <Value>{value.result}</Value>
        ) : (
          show_block(value.result, ctx)
        )
      ) : (
        show_block(value, ctx)
      )}
    </div>
  )
}
