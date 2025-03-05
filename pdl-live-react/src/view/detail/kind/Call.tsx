import Result from "../../Result"

export default function ModelItems({
  block: { pdl__result },
}: {
  block: import("../../../pdl_ast").CallBlock
}) {
  return (
    <>
      <Result result={pdl__result} />
    </>
  )
}
