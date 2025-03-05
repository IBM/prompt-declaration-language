import Group from "../Group"
import Result from "../../Result"

export default function ModelItems({
  block: { message, pdl__result },
}: {
  block: import("../../../pdl_ast").ReadBlock
}) {
  return (
    <>
      {message && <Group description={message.trim()} term="Question" />}
      <Result result={pdl__result} term="Answer" />
    </>
  )
}
