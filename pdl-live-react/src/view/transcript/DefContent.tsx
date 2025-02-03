import Code from "../Code"
import Block from "./Block"
import Value from "./Value"

import { hasParser, hasResult, isPdlBlock } from "../../helpers"

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
          <Block data={value.result} />
        )
      ) : (
        <Block data={value} />
      )}
    </div>
  )
}
