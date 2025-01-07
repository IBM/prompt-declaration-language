function capitalizeAndUnSnakeCase(s: string) {
  return s[0].toUpperCase() + s.slice(1).replace(/[-_]/, " ")
}

/** Pretty print a kind field of a PdlBlock */
export default function prettyKind(
  block: Exclude<
    import("./pdl_ast").PdlBlock,
    null | string | number | boolean
  >,
) {
  const { kind } = block
  if (!kind) {
    return "Unknown"
  }

  switch (kind) {
    case "model":
      return (
        <>
          Interact with LLM{" "}
          <strong>
            {typeof block.model === "string" ? block.model : "unknown"}
          </strong>
        </>
      )
    case "code":
      return `Execute ${block.lang} code`
    case "read":
      return "Prompt user"
    case "if":
      return "Conditional"
    case "data":
      return "Formulate structure from prior outputs"
    default:
      return capitalizeAndUnSnakeCase(kind)
  }
}
