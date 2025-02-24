import { stringify } from "yaml"
import Result from "../../Result"

export default function ModelItems({
  block: { def, result },
}: {
  block: import("../../../pdl_ast").DataBlock
}) {
  return (
    <Result
      result={typeof result === "string" ? result.trim() : stringify(result)}
      lang={typeof result === "string" ? undefined : "yaml"}
      term={def ?? "Struct"}
    />
  )
}
