import { isValidElement } from "react"
import { Tooltip, Truncate } from "@patternfly/react-core"

import { firstLineOf } from "../../helpers"

import "./QAV.css"

type Props = {
  q: "Q" | "A" | "V"
  children: import("react").ReactNode
}

/** Render the Q: A: V: UI */
export default function QAV({ q, children }: Props) {
  const tip =
    q === "Q"
      ? "Question posed"
      : q === "A"
        ? "The result"
        : "Result is assigned to this variable"

  return (
    <div className="pdl-qav">
      <Tooltip content={tip}>
        <span className="pdl-qav-label">{q}</span>
      </Tooltip>{" "}
      {isValidElement(children) ? (
        children
      ) : (
        <Truncate content={firstLineOf(String(children))} />
      )}
    </div>
  )
}
