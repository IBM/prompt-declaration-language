import Result from "../../transcript/Result"

export default function ModelItems({
  block: { result },
}: {
  block: import("../../../pdl_ast").CallBlock
}) {
  return (
    <>
      <Result result={result} />
    </>
  )
}
