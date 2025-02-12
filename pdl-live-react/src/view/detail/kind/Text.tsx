import Result from "../../Result"

export default function TextItems({
  block: { result },
}: {
  block: import("../../../pdl_ast").TextBlock
}) {
  return <Result result={result} />
}
