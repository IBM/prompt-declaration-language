import Group from "../Group"
import Result from "../../Result"

export default function ModelItems({
  block: { model, input, result, parser },
}: {
  block: import("../../../pdl_ast").LitellmModelBlock
}) {
  return (
    <>
      {typeof model === "string" && <Group term="Model" description={model} />}
      {typeof input === "string" && <Group term="Input" description={input} />}
      <Result
        result={result}
        lang={
          parser === "jsonl" || parser === "json"
            ? "json"
            : parser === "yaml"
              ? "yaml"
              : "plaintext"
        }
      />
    </>
  )
}
