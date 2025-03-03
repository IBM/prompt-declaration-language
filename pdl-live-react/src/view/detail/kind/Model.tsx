import { stringify } from "yaml"

import Group from "../Group"
import Result from "../../Result"
import {
  capitalizeAndUnSnakeCase,
  extractStructuredModelResponse,
  ModelBlock,
} from "../../../helpers"

export default function ModelItems({ block }: { block: ModelBlock }) {
  const { platform, model, input } = block
  const { resultForDisplay, lang, meta } = extractStructuredModelResponse(block)

  const metaForDisplay = meta?.map(([k, v], idx) => (
    <Result
      key={k + "." + idx}
      term={capitalizeAndUnSnakeCase(String(k))}
      result={typeof v === "object" ? stringify(v) : v}
      lang={typeof v === "object" ? "yaml" : undefined}
    />
  ))

  return (
    <>
      {typeof platform === "string" && (
        <Group term="Platform" description={platform} />
      )}
      {typeof model === "string" && <Group term="Model" description={model} />}
      {typeof input === "string" && <Group term="Input" description={input} />}
      <Result result={resultForDisplay} lang={lang} />
      {metaForDisplay}
    </>
  )
}
