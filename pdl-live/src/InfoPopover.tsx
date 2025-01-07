import { type MouseEvent } from "react"
import { Popover } from "@patternfly/react-core"

import Code from "./Code"
import prettyKind from "./pretty"

import InfoIcon from "@patternfly/react-icons/dist/esm/icons/info-circle-icon"

import "./InfoPopover.css"

type Props = {
  block: NonNullable<import("./pdl_ast").PdlBlock>
  darkMode: boolean
}

const paddingTop = { paddingTop: "1em" }
const stopProp = (evt: MouseEvent) => evt.stopPropagation()

export default function InfoPopover({ block, darkMode }: Props) {
  return (
    typeof block === "object" && (
      <Popover
        hasAutoWidth
        minWidth="500px"
        aria-label="Show Details"
        headerContent="Trace Snippet"
        bodyContent={
          <div style={paddingTop}>
            <Code block={block} darkMode={darkMode} limitHeight />
          </div>
        }
        footerContent={
          <>
            Showing the details of <strong>{prettyKind(block)}</strong>
          </>
        }
      >
        <div
          className="pdl-info-popover-button"
          aria-label="Action"
          onClick={stopProp}
        >
          <InfoIcon />
        </div>
      </Popover>
    )
  )
}
