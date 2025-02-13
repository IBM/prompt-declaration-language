import { stringify } from "yaml"
import Result from "../../Result"

export default function ModelItems({
  block: { def, result },
}: {
  block: import("../../../pdl_ast").DataBlock
}) {
  return (
    <Result result={stringify(result)} lang="yaml" term={def ?? "Struct"} />
  )
}
