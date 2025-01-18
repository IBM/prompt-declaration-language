import { isValidElement } from "react"
import { Tooltip, Truncate } from "@patternfly/react-core"

import { firstLineOf } from "../../helpers"

import ChevronLeftIcon from "@patternfly/react-icons/dist/esm/icons/chevron-left-icon"
import ChevronRightIcon from "@patternfly/react-icons/dist/esm/icons/chevron-right-icon"

import "./QAV.css"

type Props = {
  kind?: "code" | "dialog"
  q: "Q" | "A" | "V"
  children: import("react").ReactNode
}

/** Render the Q: A: V: UI */
export default function QAV({ q, kind, children }: Props) {
  const tip =
    q === "Q"
      ? kind === "dialog"
        ? "Question posed"
        : "Code executed"
      : q === "A"
        ? kind === "dialog"
          ? "The answer"
          : "The execution result"
        : "Result is assigned to this variable"

  const content = <Truncate content={firstLineOf(String(children))} />

  return (
    <div className="pdl-qav">
      <Tooltip content={tip}>
        <span className="pdl-qav-label">
          {q === "Q" ? (
            <ChevronRightIcon />
          ) : q === "A" ? (
            <ChevronLeftIcon />
          ) : (
            <></>
          )}
        </span>
      </Tooltip>{" "}
      {isValidElement(children) ? (
        children
      ) : kind === "dialog" ? (
        <i>{content}</i>
      ) : (
        <code>{content}</code>
      )}
    </div>
  )
}
