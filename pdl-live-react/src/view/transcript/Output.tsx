import { match, P } from "ts-pattern"

import Markdown from "../Markdown"
import { isMarkdownish, type PdlBlock } from "../../helpers"

export default function Output({ data }: { data: PdlBlock }) {
  return match(data)
    .with(
      P.string,
      (output) =>
        output.trim().length > 0 &&
        (!isMarkdownish(output) ? (
          <span className="pdl-wrap">{output.trim()}</span>
        ) : (
          <Markdown>{output}</Markdown>
        )),
    )
    .with(P.union(P.number, P.boolean, P.nullish), (output) => String(output))
    .with({ contribute: P.union([], ["context"]) }, () => {
      //div.classList.add('pdl_show_result_false'); // @nickm TODO
      return "☐"
    })
    .with({ result: P.string }, (data) => <Markdown>{data.result}</Markdown>)
    .with({ result: P._ }, (data) => (
      <pre>{JSON.stringify(data.result, undefined, 2)}</pre>
    ))
    .otherwise(() => "☐")
}
