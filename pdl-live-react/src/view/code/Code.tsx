import { match, P } from "ts-pattern"
import { lazy, Suspense } from "react"
import { stringify } from "yaml"

import { tryJsonPrettyPrint } from "../../helpers"
import { type PdlBlock } from "../../pdl_ast"
import { type BlockType } from "../../helpers"
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

export function block_code_cleanup(data: BlockType): BlockType {
  if (data === null || typeof data !== "object") {
    return data
  }
  // remove pdl__result
  let new_data = {
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
  const new_data_rec = map_block_children(block_code_cleanup, new_data)
  // replace `data: literal` by `literal`
  const clean_data = match(new_data_rec)
    .with(
      {
        kind: "data",
        data: P.union(P.string, P.number, P.boolean),
        raw: false,
        spec: P.nullish,
        description: P.nullish,
        defs: {},
        def: P.nullish,
        contribute: P.union(["context", "result"], ["result", "context"]),
        parser: P.nullish,
        fallback: P.nullish,
        role: P.nullish,
      },
      (d) => d.data,
    )
    .otherwise((d) => d)
  // remove kind
  return match(clean_data)
    .with({ kind: "data" }, (d) => {
      return match(d.data)
        .with({ pdl__expr: P._ }, (e) => ({ ...d, data: e.pdl__expr }))
        .with(P.union(P.string, P.number, P.boolean, {}), (e) => e)
        .otherwise((_) => d)
    })
    .with({ kind: P._ }, (d) => ({ ...d, kind: undefined }))
    .otherwise((d) => d)
}
