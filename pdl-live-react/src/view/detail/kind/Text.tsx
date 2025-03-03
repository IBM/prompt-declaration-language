import Result from "../../Result"

export default function TextItems({
  block: { pdl__result },
}: {
  block: import("../../../pdl_ast").TextBlock
}) {
  return <Result result={pdl__result} />
}
