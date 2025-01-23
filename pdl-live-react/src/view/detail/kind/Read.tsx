import Group from "../Group"
import Result from "../../transcript/Result"

export default function ModelItems({
  block: { message, result },
}: {
  block: import("../../../pdl_ast").ReadBlock
}) {
  return (
    <>
      {message && <Group description={message.trim()} term="Question" />}
      <Result result={result} term="Answer" />
    </>
  )
}
