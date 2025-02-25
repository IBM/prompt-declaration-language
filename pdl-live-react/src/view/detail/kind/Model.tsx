import { stringify } from "yaml"

import Group from "../Group"
import Result from "../../Result"
import { capitalizeAndUnSnakeCase } from "../../../helpers"

function tryJson(s: unknown) {
  if (typeof s === "string") {
    try {
      return JSON.parse(s)
    } catch (_err) {
      // intentional fall-through
    }
  }
  return s
}

export default function ModelItems({
  block: { platform, model, input, result, parser },
}: {
  block: import("../../../pdl_ast").LitellmModelBlock
}) {
  // All of this JSON stuff is to handle structured responses from the
  // model
  const json = tryJson(result)
  const resultForDisplay = Array.isArray(json)
    ? json.map(({ sentence }) => sentence).join("\n")
    : result

  const lang = Array.isArray(json)
    ? undefined
    : parser === "jsonl" || parser === "json"
      ? "json"
      : parser === "yaml"
        ? "yaml"
        : "plaintext"

  // Ugh, some of this logic may be specific to Granite LLM
  const meta = Array.isArray(json)
    ? json.flatMap(({ meta }, idx) =>
        Object.entries(meta)
          .map(([k, v]) => {
            if (
              k === "citation" &&
              v &&
              typeof v === "object" &&
              "snippet" in v
            ) {
              return [k, v.snippet]
            } else {
              return [k, v]
            }
          })
          .map(([k, v]) => (
            <Result
              key={k + "." + idx}
              term={capitalizeAndUnSnakeCase(String(k))}
              result={typeof v === "object" ? stringify(v) : v}
              lang={typeof v === "object" ? "yaml" : undefined}
            />
          )),
      )
    : undefined

  return (
    <>
      {typeof platform === "string" && (
        <Group term="Platform" description={platform} />
      )}
      {typeof model === "string" && <Group term="Model" description={model} />}
      {typeof input === "string" && <Group term="Input" description={input} />}
      <Result result={resultForDisplay} lang={lang} />
      {meta}
    </>
  )
}
