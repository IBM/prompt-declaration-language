import Result from "../Result"

import { hasParser, type PdlBlockWithResult } from "../../helpers"

export default function UsageTabContent({
  block,
}: {
  block: PdlBlockWithResult
}) {
  return (
    <Result
      result={block.pdl__result}
      lang={
        hasParser(block)
          ? block.parser === "jsonl"
            ? "json"
            : block.parser
          : undefined
      }
      term=""
    />
  )
}
