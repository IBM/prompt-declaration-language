import { match, P } from "ts-pattern"

import { Backend, PdlBlock, Processor } from "./pdl_ast"
import { ExpressionT, isArgs } from "./helpers"

export function map_block_children(
  f_block: (block: PdlBlock) => PdlBlock,
  f_expr: (expr: ExpressionT<unknown>) => ExpressionT<unknown>,
  block: PdlBlock,
): PdlBlock {
  if (
    block === null ||
    typeof block === "boolean" ||
    typeof block === "number" ||
    typeof block === "string"
  ) {
    return block
  }
  let new_block: PdlBlock
  if (block?.defs === undefined) {
    new_block = { ...block }
  } else {
    const defs: { [k: string]: PdlBlock } = {}
    for (const x in block.defs) {
      defs[x] = f_block(block.defs[x])
    }
    new_block = { ...block, defs: defs }
  }
  if (new_block?.contribute !== undefined) {
    const contribute = new_block.contribute?.map((contrib) =>
      match(contrib)
        .with({}, (c) =>
          Object.fromEntries(
            Object.entries(c).map(([k, v]) => [
              k,
              match(v)
                .with({ value: P.array(P._) }, (v) => ({
                  value: v.value.map(f_expr),
                }))
                .otherwise((v) => v),
            ]),
          ),
        )
        .otherwise((contrib) => contrib),
    )
    new_block = { ...new_block, contribute }
  }
  // @ts-expect-error: TODO
  new_block = match(new_block)
    // .with(P.string, s => s)
    .with({ kind: "empty" }, (block) => block)
    .with({ kind: "function" }, (block) => {
      const return_ = f_block(block.return)
      return { ...block, return: return_ }
    })
    .with({ kind: "call" }, (block) => {
      const call = f_expr(block.call)
      const args = f_expr(block.args)
      return { ...block, call, args }
    })
    .with(
      {
        kind: "model",
        platform: "granite-io",
        backend: P.nonNullable,
        processor: P._,
      },
      (block) => {
        const model = f_expr(block.model)
        const input = block.input ? f_block(block.input) : undefined
        // @ts-expect-error: f_expr does not preserve the type of the expression
        const parameters: Parameters = block.parameters
          ? f_expr(block.parameters)
          : undefined
        // @ts-expect-error: f_expr does not preserve the type of the expression
        const backend: Backend = f_expr(block.backend)
        // @ts-expect-error: f_expr does not preserve the type of the expression
        const processor: Processor = block.processor
          ? f_expr(block.processor)
          : undefined
        return {
          ...block,
          model,
          input,
          parameters,
          backend,
          processor,
        }
      },
    )
    .with({ kind: "model" }, (block) => {
      const model = f_expr(block.model)
      const input = block.input ? f_block(block.input) : undefined
      const parameters = block.parameters ? f_expr(block.parameters) : undefined
      return {
        ...block,
        platform: "litellm",
        model,
        input,
        parameters,
      }
    })
    .with({ kind: "code" }, (block) => {
      if (isArgs(block)) {
        const args = block.args.map((arg) => f_expr(arg))
        return { ...block, args }
      }
      return { ...block, code: f_block(block.code) }
    })
    .with({ kind: "get" }, (block) => block)
    .with({ kind: "data" }, (block) => {
      const data = f_expr(block.data)
      return { ...block, data }
    })
    .with({ kind: "text" }, (block) => {
      let text
      if (block.text instanceof Array) {
        text = block.text.map(f_block)
      } else {
        text = f_block(block.text)
      }
      return { ...block, text: text }
    })
    .with({ kind: "lastOf" }, (block) => {
      const lastOf = block.lastOf.map(f_block)
      return { ...block, lastOf: lastOf }
    })
    .with({ kind: "array" }, (block) => {
      const array = block.array.map(f_block)
      return { ...block, array: array }
    })
    .with({ kind: "object" }, (block) => {
      let object
      if (block.object instanceof Array) {
        object = block.object.map(f_block)
      } else {
        object = Object.fromEntries(
          Object.entries(block.object).map(([k, v]) => [k, f_block(v)]),
        )
      }
      return { ...block, object: object }
    })
    .with({ kind: "message" }, (block) => {
      const content = f_block(block.content)
      return { ...block, content: content }
    })
    .with({ kind: "if" }, (block) => {
      const if_ = f_expr(block.if)
      const then_ = f_block(block.then)
      const else_ = block.else ? f_block(block.else) : undefined
      return { ...block, if: if_, then: then_, else: else_ }
    })
    .with({ kind: "match" }, (block) => {
      const match = f_expr(block.match)
      const with_ = block.with.map((match_case) => {
        const if_ = f_expr(match_case.if)
        const then_ = f_block(match_case.then)
        return { ...match_case, if: if_, then: then_ }
      })
      return { ...block, match, with: with_ }
    })
    .with({ kind: "repeat" }, (block) => {
      const for_ = block?.for ? f_expr(block.for) : undefined
      const until = block?.until ? f_expr(block.until) : undefined
      const max_iterations = block?.max_iterations
        ? f_expr(block.max_iterations)
        : undefined
      const repeat = f_block(block.repeat)
      return { ...block, for: for_, repeat, until, max_iterations }
    })
    .with({ kind: "error" }, (block) => {
      const doc = f_block(block.program)
      return { ...block, program: doc }
    })
    .with({ kind: "read" }, (block) => {
      const read = f_expr(block.read)
      return { ...block, read }
    })
    .with({ kind: "include" }, (block) => block)
    .with({ kind: "import" }, (block) => block)
    .with({ kind: undefined }, (block) => block)
    .exhaustive()
  match(new_block)
    .with({ parser: { pdl: P._ } }, (block) => {
      block.parser.pdl = f_block(block.parser.pdl)
    })
    .otherwise(() => {})
  if (block.fallback) {
    block.fallback = f_block(block.fallback)
  }
  return new_block
}

export function iter_block_children(
  f: (block: PdlBlock) => void,
  block: PdlBlock,
): void {
  if (
    block === null ||
    typeof block === "boolean" ||
    typeof block === "number" ||
    typeof block === "string"
  ) {
    return
  }
  if (block?.defs) {
    for (const x in block.defs) {
      f(block.defs[x])
    }
  }
  match(block)
    .with(P.string, () => {})
    .with({ kind: "empty" }, () => {})
    .with({ kind: "function" }, (block) => {
      f(block.return)
    })
    .with({ kind: "call" }, () => {})
    .with({ kind: "model" }, (block) => {
      if (block.input) f(block.input)
    })
    .with({ kind: "code" }, (block) => {
      if (!isArgs(block)) {
        f(block.code)
      }
    })
    .with({ kind: "get" }, () => {})
    .with({ kind: "data" }, (block) => {
      if (block.data) f(block.data)
    })
    .with({ kind: "text" }, (block) => {
      if (block.text instanceof Array) {
        block.text.forEach(f)
      } else {
        f(block.text)
      }
    })
    .with({ kind: "lastOf" }, (block) => {
      block.lastOf.forEach(f)
    })
    .with({ kind: "array" }, (block) => {
      block.array.forEach(f)
    })
    .with({ kind: "object" }, (block) => {
      let object
      if (block.object instanceof Array) {
        block.object.forEach(f)
      } else {
        Object.values(block.object).forEach(f)
      }
      return { ...block, object: object }
    })

    .with({ kind: "message" }, (block) => {
      f(block.content)
    })
    .with({ kind: "if" }, (block) => {
      if (block.then) f(block.then)
      if (block.else) f(block.else)
    })
    .with({ kind: "match" }, (block) => {
      block.with.forEach((match_case) => {
        f(match_case.then)
      })
    })
    .with({ kind: "repeat" }, (block) => {
      f(block.repeat)
    })
    .with({ kind: "error" }, (block) => f(block.program))
    .with({ kind: "read" }, () => {})
    .with({ kind: "include" }, () => {})
    .with({ kind: "import" }, () => {})
    .with({ kind: undefined }, () => {})
    .exhaustive()
  match(block)
    .with({ parser: { pdl: P._ } }, (block) => {
      f(block.parser.pdl)
    })
    .otherwise(() => {})
  if (block.fallback) {
    f(block.fallback)
  }
}
