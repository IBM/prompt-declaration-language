import { stringify } from "yaml"
import Result from "../../Result"

export default function ModelItems({
  block: { def, pdl__result },
}: {
  block: import("../../../pdl_ast").DataBlock
}) {
  return (
    <Result
      result={
        typeof pdl__result === "string"
          ? pdl__result.trim()
          : stringify(pdl__result)
      }
      lang={typeof pdl__result === "string" ? undefined : "yaml"}
      term={def ?? "Struct"}
    />
  )
}
