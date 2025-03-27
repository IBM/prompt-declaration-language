import { lazy, Suspense } from "react"
import { stringify } from "yaml"

import { tryJsonPrettyPrint } from "../../helpers"
import { type PdlBlock } from "../../pdl_ast"
import { block_code_cleanup } from "../../pdl_code_cleanup"
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
