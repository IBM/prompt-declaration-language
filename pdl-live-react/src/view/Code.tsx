import { stringify } from "yaml"
import { match, P } from "ts-pattern"

import { type PdlBlock } from "../pdl_ast"
import { map_block_children } from "../pdl_ast_utils"

import Preview, { type SupportedLanguage } from "./Preview"

type Props = {
  block: PdlBlock
  darkMode: boolean
  language?: SupportedLanguage
  showLineNumbers?: boolean
  limitHeight?: boolean
  raw?: boolean
}

export default function Code({
  block,
  darkMode,
  language = "yaml",
  showLineNumbers = false,
  limitHeight = true,
  raw = false,
}: Props) {
  return (
    <Preview
      darkMode={darkMode}
      limitHeight={limitHeight}
      showLineNumbers={showLineNumbers ?? false}
      language={language || "yaml"}
      value={
        typeof block === "string"
          ? block
          : stringify(raw ? block : block_code_cleanup(block))
      }
    />
  )
}

function block_code_cleanup(data: string | PdlBlock): string | PdlBlock {
  if (
    data === null ||
    typeof data === "boolean" ||
    typeof data === "number" ||
    typeof data === "string"
  ) {
    return data
  }
  // remove result
  const new_data = { ...data, result: undefined }
  // remove trace
  match(new_data).with({ trace: P._ }, (data) => {
    data.trace = undefined
  })
  // remove contribute: ["result", context]
  if (
    new_data?.contribute?.includes("result") &&
    new_data?.contribute?.includes("context")
  ) {
    new_data.contribute = undefined
  }
  // remove empty defs list
  if (Object.keys(data?.defs ?? {}).length === 0) {
    new_data.defs = undefined
  }
  // remove location info
  new_data.location = undefined
  // recursive cleanup
  return map_block_children(block_code_cleanup, new_data)
}
