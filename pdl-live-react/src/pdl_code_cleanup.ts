import { match, P } from "ts-pattern"

import {
  NonScalarPdlBlock,
  ExpressionT,
  hasContextInformation,
} from "./helpers"
import { map_block_children } from "./pdl_ast_utils"
import {
  DataBlock,
  GraniteioModelBlock,
  LitellmModelBlock,
  MatchBlock,
  PdlBlock,
  RepeatBlock,
} from "./pdl_ast"

export function block_code_cleanup(block: PdlBlock): PdlBlock {
  const block_with_clean_children = map_block_children(
    block_code_cleanup,
    expr_code_cleanup,
    block,
  )
  if (
    block_with_clean_children === null ||
    typeof block_with_clean_children !== "object"
  ) {
    return block_with_clean_children
  }
  let block_with_generic_clean = remove_block_default_values(
    block_with_clean_children,
  )
  block_with_generic_clean = remove_internal_block_fields(
    block_with_generic_clean,
  )
  const clean_block = match(block_with_generic_clean)
    .with({ kind: "model" }, clean_model_block)
    .with({ kind: "data" }, clean_data_block)
    .with({ kind: "match", with: P._ }, clean_match_block)
    .with({ kind: "repeat" }, clean_repeat_block)
    .otherwise((block) => block)
  // remove kind
  return match(clean_block)
    .with({ kind: P._ }, (block) => ({ ...block, kind: undefined }))
    .otherwise((block) => block)
}

function clean_model_block(block: LitellmModelBlock | GraniteioModelBlock) {
  return {
    ...block,
    context: !hasContextInformation(block)
      ? undefined
      : JSON.parse(
          JSON.stringify(block.context, (k, v) =>
            k === "defsite" ? undefined : v,
          ),
        ),
  }
}

function clean_data_block(block: DataBlock) {
  return match(block)
    .with(
      {
        kind: "data",
        data: P.union(P.string, P.number, P.boolean),
        raw: P.optional(false),
        spec: P.optional(P.nullish),
        description: P.optional(P.union(P.nullish, "")),
        defs: P.optional(
          P.when((defs) => Object.keys(defs ?? {}).length === 0),
        ),
        def: P.optional(P.nullish),
        contribute: P.optional(
          P.union(["context", "result"], ["result", "context"]),
        ),
        parser: P.optional(P.nullish),
        fallback: P.optional(P.nullish),
        role: P.optional(P.nullish),
      },
      (block) => block.data,
    )
    .otherwise((block) => block)
}

function clean_match_block(block: MatchBlock) {
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
}

function remove_block_default_values(
  block: NonScalarPdlBlock,
): NonScalarPdlBlock {
  // remove contribute: ["result", context]
  if (
    block?.contribute?.includes("result") &&
    block?.contribute?.includes("context")
  ) {
    block = { ...block, contribute: undefined }
  }
  // remove empty defs list
  if (Object.keys(block?.defs ?? {}).length === 0) {
    block = { ...block, defs: undefined }
  }
  return block
}

function clean_repeat_block(block: RepeatBlock) {
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
}

function remove_internal_block_fields(block: NonScalarPdlBlock) {
  return {
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
}

function expr_code_cleanup(expr: ExpressionT<unknown>): ExpressionT<unknown> {
  return match(expr)
    .with({ pdl__expr: P._ }, (e) => e.pdl__expr)
    .otherwise((e) => e)
}
