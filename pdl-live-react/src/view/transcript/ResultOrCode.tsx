import { match, P } from "ts-pattern"

import Code from "../Code"
import CodeGroup from "./CodeGroup"
import Result from "./Result"
import Value from "./Value"

import type Context from "../../Context"
import { type PdlBlock } from "../../pdl_ast"

type Props = {
  block: PdlBlock
  ctx: Context
  term?: string
}

export default function ResultOrCode({ block, ctx, term }: Props) {
  return match(block)
    .with(P.union(P.string, P.number), (data) => <Value>{data}</Value>)
    .with({ lang: "python", code: P.string, result: P._ }, (data) => (
      <>
        <CodeGroup code={data.code} ctx={ctx} lang={data.lang} />
        <Result result={data.result} ctx={ctx} term={term} />
      </>
    ))
    .with({ result: P._ }, (data) => (
      <Result result={data.result} ctx={ctx} term={term} />
    ))
    .otherwise((data) => <Code block={data} darkMode={ctx.darkMode} />)
}
