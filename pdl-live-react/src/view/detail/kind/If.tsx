import { match, P } from "ts-pattern"
import Group from "../Group"
import { stringify } from "yaml"

export default function ModelItems({
  block: { if: condition },
}: {
  block: import("../../../pdl_ast").IfBlock
}) {
  return (
    <>
      {match(condition)
        .with(P.string, (cond) => (
          <Group description={cond.trim()} term="Condition" />
        ))
        .with({ pdl__expr: P._ }, (cond) => (
          <Group description={stringify(cond.pdl__expr)} term="Condition" />
        ))
        .otherwise((cond) => (
          <Group description={stringify(cond)} term="Condition" />
        ))}
      {match(condition)
        .with({ pdl__result: P.boolean }, (cond) => (
          <Group
            description={
              cond.pdl__result
                ? "Then (condition is true)"
                : "Else (condition is false)"
            }
            term="Then or Else?"
          />
        ))
        .otherwise(() => false)}
    </>
  )
}
