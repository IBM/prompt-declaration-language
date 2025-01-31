import { match, P } from "ts-pattern"

import Code from "../Code"
import CodeGroup from "./CodeGroup"
import Result from "./Result"
import Value from "./Value"

import { type PdlBlock } from "../../pdl_ast"

type Props = {
  block: PdlBlock
  term?: string
}

export default function ResultOrCode({ block, term }: Props) {
  return match(block)
    .with(P.union(P.string, P.number), (data) => <Value>{data}</Value>)
    .with({ lang: "python", code: P.string, result: P._ }, (data) => (
      <>
        <CodeGroup code={data.code} lang={data.lang} />
        <Result result={data.result} term={term} />
      </>
    ))
    .with({ result: P._ }, (data) => (
      <Result result={data.result} term={term} limitHeight />
    ))
    .otherwise((data) => <Code block={data} />)
}
