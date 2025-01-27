import Code from "../Code"
import Value from "../transcript/Value"

import { hasParser, hasResult, isMarkdownish, isPdlBlock } from "../../helpers"

import "./DefContent.css"

type Props = {
  value: import("../../pdl_ast").PdlBlock
}

export default function DefContent({ value }: Props) {
  return (
    <div className="pdl-variable-definition-content">
      {hasResult(value) && isPdlBlock(value.result) ? (
        hasParser(value) &&
        (value.parser === "yaml" ||
          value.parser === "json" ||
          value.parser === "jsonl") ? (
          <Code
            block={value.result}
            limitHeight={false}
            language={value.parser === "jsonl" ? "json" : value.parser}
          />
        ) : typeof value.result === "string" ? (
          <Value>{value.result}</Value>
        ) : (
          <Code
            block={value.result}
            limitHeight={false}
            raw
            language="plaintext"
          />
        )
      ) : typeof value === "number" ||
        (typeof value === "string" && isMarkdownish(value)) ? (
        <Value>{value}</Value>
      ) : (
        <Code
          block={JSON.stringify(value, undefined, 2)}
          limitHeight={false}
          raw
          language="json"
        />
      )}
    </div>
  )
}
