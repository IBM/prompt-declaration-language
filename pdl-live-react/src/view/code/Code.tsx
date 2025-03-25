import { match, P } from "ts-pattern"
import { lazy, Suspense } from "react"
import { stringify } from "yaml"

import { tryJsonPrettyPrint } from "../../helpers"
import { type PdlBlock } from "../../pdl_ast"
import {
  type BlockType,
  type ExpressionT,
  hasContextInformation,
} from "../../helpers"
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

export function block_code_cleanup(block: BlockType): BlockType {
  if (block === null || typeof block !== "object") {
    return block
  }
  // remove pdl__result
  let new_block = {
    ...block,
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
    new_block?.contribute?.includes("result") &&
    new_block?.contribute?.includes("context")
  ) {
    delete new_block.contribute
  }
  // remove empty defs list
  if (Object.keys(block?.defs ?? {}).length === 0) {
    delete new_block.defs
  }
  // recursive cleanup
  const new_block_rec = map_block_children(
    block_code_cleanup,
    expr_code_cleanup,
    new_block,
  )
  const clean_block = match(new_block_rec)
    // Remove `defsite` from context:
    .with({ kind: "model" }, (block) => ({
      ...block,
      context: !hasContextInformation(block)
        ? undefined
        : JSON.parse(
            JSON.stringify(block.context, (k, v) =>
              k === "defsite" ? undefined : v,
            ),
          ),
    }))
    // replace `data: literal` by `literal`
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
      (block) => block.data,
    )
    .with({ kind: "match", with: P._ }, (block) => {
      const with_ = block.with.map((case_) => {
        const clean_case = {
          ...case_,
          pdl__case_result: undefined,
          pdl__if_result: undefined,
          pdl__matched: undefined,
        }
        if (clean_case.case === null) {
          delete clean_case.case
        }
        if (clean_case.if === null) {
          delete clean_case.if
        }
        return clean_case
      })
      return { ...block, with: with_ }
    })
    .with({ kind: "repeat" }, (block) => {
      if (block.for === null) {
        delete block.for
      }
      if (block.while === true) {
        delete block.while
      }
      if (block.until === false) {
        delete block.until
      }
      if (block.max_iterations === null) {
        delete block.max_iterations
      }
      return block
    })
    .otherwise((block) => block)
  // remove kind
  return match(clean_block)
    .with({ kind: P._ }, (block) => ({ ...block, kind: undefined }))
    .otherwise((block) => block)
}

export function expr_code_cleanup(expr: ExpressionT<any>): ExpressionT<any> {
  return match(expr)
    .with({ pdl__expr: P._ }, (e) => e.pdl__expr)
    .otherwise((e) => e)
}
