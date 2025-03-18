import { lazy, Suspense } from "react"
import { stringify } from "yaml"

import { tryJsonPrettyPrint } from "../../helpers"
import { type PdlBlock } from "../../pdl_ast"
import { map_block_children } from "../../pdl_ast_utils"

const PreviewLight = lazy(() => import("./PreviewLight"))

export type SupportedLanguage =
  | "yaml"
  | "json"
  | "javascript"
  | "python"
  | "plaintext"

type Props = {
  block: PdlBlock
  language?: SupportedLanguage
  showLineNumbers?: boolean
  wrap?: boolean
  limitHeight?: boolean
  raw?: boolean
}

export default function Code({
  block,
  language = "yaml",
  showLineNumbers,
  wrap,
  raw = false,
}: Props) {
  const value =
    typeof block === "string"
      ? language === "json"
        ? tryJsonPrettyPrint(block)
        : block
      : stringify(raw ? block : block_code_cleanup(block))

  return (
    <Suspense fallback={<div />}>
      <PreviewLight
        value={value}
        language={language || "yaml"}
        wrap={wrap}
        showLineNumbers={showLineNumbers}
      />
    </Suspense>
  )
}

function block_code_cleanup(data: string | PdlBlock): string | PdlBlock {
  if (data === null || typeof data !== "object") {
    return data
  }
  // remove pdl__result
  const new_data = {
    ...data,
    pdl__result: undefined,
    pdl__is_leaf: undefined,
    pdl__usage: undefined,
    pdl__trace: undefined,
    pdl__id: undefined,
    pdl__timing: undefined,
    pdl__location: undefined,
    pdl__model_input: undefined,
  }
  // remove contribute: ["result", context]
  if (
    new_data?.contribute?.includes("result") &&
    new_data?.contribute?.includes("context")
  ) {
    delete new_data.contribute
  }
  // remove empty defs list
  if (Object.keys(data?.defs ?? {}).length === 0) {
    delete new_data.defs
  }
  // recursive cleanup
  return map_block_children(block_code_cleanup, new_data)
}
