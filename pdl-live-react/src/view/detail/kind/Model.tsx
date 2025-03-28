import { stringify } from "yaml"

import Group from "../Group"
import Result from "../../Result"
import {
  capitalizeAndUnSnakeCase,
  extractModel,
  extractStructuredModelResponse,
  hasInput,
  ModelBlock,
} from "../../../helpers"

export default function ModelItems({ block }: { block: ModelBlock }) {
  const { platform } = block
  const model = extractModel(block)
  const input = !hasInput(block)
    ? undefined
    : String(block.pdl__model_input[block.pdl__model_input.length - 1].content)
  const { meta } = extractStructuredModelResponse(block)

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
      {metaForDisplay}
    </>
  )
}
