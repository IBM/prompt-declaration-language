import Group from "../Group"

export default function ModelItems({
  block: { if: condition, if_result },
}: {
  block: import("../../../pdl_ast").IfBlock
}) {
  return (
    <>
      {typeof condition === "string" && (
        <Group
          description={condition.replace(/^\$\{*(.+)\}$/, "$1").trim()}
          term="Condition"
        />
      )}
      {if_result !== undefined && (
        <Group
          description={
            if_result === true
              ? "Then (condition is true)"
              : "Else (condition is false)"
          }
          term="Then or Else?"
        />
      )}
    </>
  )
}
