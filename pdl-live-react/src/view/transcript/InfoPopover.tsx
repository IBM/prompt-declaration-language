import { useCallback, type MouseEvent } from "react"

import Code from "../Code"
import type Context from "../../Context"
import PrettyKind from "./PrettyKind"

import InfoIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon"

import "./InfoPopover.css"

type Props = {
  ctx: Context
  block: Exclude<
    import("../../pdl_ast").PdlBlock,
    null | string | boolean | number
  >
}

//const paddingTop = { paddingTop: "1em" }

export default function InfoPopover({ block, ctx }: Props) {
  const { setDrawerContent, darkMode } = ctx
  const onClick = useCallback(
    (evt: MouseEvent) => {
      evt.stopPropagation()
      setDrawerContent({
        header: "Trace Snippet",
        description: <PrettyKind block={block} isCompact />,
        body: <Code block={block} darkMode={darkMode} />,
      })
    },
    [setDrawerContent, block, darkMode],
  )

  return (
    typeof block === "object" && (
      <div
        className="pdl-info-popover-button"
        aria-label="Action"
        onClick={onClick}
      >
        <InfoIcon />
      </div>
    )
  )
}
