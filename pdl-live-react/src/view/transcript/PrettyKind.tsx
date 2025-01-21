import QAV from "./QAV"
import { hasScalarResult, firstLineOf } from "../../helpers"

/** Pretty print a kind field of a PdlBlock */
export default function PrettyKind({
  block,
  isCompact = false,
}: {
  isCompact?: boolean
  block: Exclude<
    import("../../pdl_ast").PdlBlock,
    null | string | number | boolean
  >
}) {
  const { kind } = block
  if (!kind) {
    return "Unknown"
  }

  switch (kind) {
    case "model":
      return (
        <>
          {!isCompact &&
            typeof block.input === "string" &&
            block.input.length > 0 && (
              <>
                <QAV q="Q" kind="dialog">
                  {block.input}
                </QAV>
              </>
            )}
          {hasScalarResult(block) && (
            <QAV q="A" kind="dialog">
              {block.result}
            </QAV>
          )}
        </>
      )
    case "function":
      return (
        <>
          Define{" "}
          {block.def ? (
            <span>
              {" "}
              <span className="pdl-mono">
                <strong>{block.def}</strong>(
                {block.function &&
                  Object.entries(block.function)
                    .map(([arg, type]) => `${arg}: ${type}`)
                    .join(", ")}
                )
              </span>
            </span>
          ) : (
            <></>
          )}
        </>
      )
    case "call": {
      const { args } = block
      return (
        <>
          Call{" "}
          {typeof block.call !== "string" ? (
            "a function"
          ) : (
            <span className="pdl-mono">
              <strong>
                {block.call.replace(/^\$\{\s*([^\s}]+)\s*\}$/, "$1")}
              </strong>
              (
              {args != null && typeof args === "object" ? (
                Object.values(args)
                  .map((a) => `"${String(a)}"`)
                  .join(", ")
              ) : (
                <></>
              )}
              )
            </span>
          )}
        </>
      )
    }
    case "error":
      return `${firstLineOf(block.msg)}`
    case "code":
      return (
        <>
          {hasScalarResult(block) && (
            <QAV q="A" kind="code">
              {block.result}
            </QAV>
          )}
        </>
      )
    case "read":
      return (
        <>
          <QAV q="Q" kind="dialog">
            {block.message ?? "Prompt user for input"}
          </QAV>
          {hasScalarResult(block) && (
            <QAV q="A" kind="dialog">
              {block.result}
            </QAV>
          )}
        </>
      )
    case "if":
      return typeof block.if === "string" ? (
        <>
          <code>{block.if}</code> is{" "}
          {block.if_result === true ? "true" : "false"}
        </>
      ) : (
        <></>
      )
    case "data":
      return "Formulate structure from prior outputs"
    default:
      return <></>
  }
}
