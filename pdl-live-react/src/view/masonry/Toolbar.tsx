import { Toolbar, ToolbarGroup, ToolbarContent } from "@patternfly/react-core"

import DarkModeToggle from "../../page/DarkModeToggle"
import ToolbarSMLToggle from "./ToolbarSMLToggle"
import ToolbarReplayButton from "./ToolbarReplayButton"
import ToolbarShowSourceButton from "./ToolbarShowSourceButton"

import { isNonScalarPdlBlock } from "../../helpers"

const alignEnd = { default: "alignEnd" as const }

export type SML = "s" | "m" | "l" | "xl"

export type Props = {
  run: import("./MasonryCombo").Runner
  isRunning: boolean
  block: import("../../pdl_ast").PdlBlock

  sml: SML
  setSML(sml: SML): void
}

export default function MasonryToolbar({
  block,
  run,
  isRunning,
  sml,
  setSML,
}: Props) {
  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain">
          <ToolbarReplayButton run={run} isRunning={isRunning} />
        </ToolbarGroup>
        <ToolbarGroup align={alignEnd} variant="action-group">
          {isNonScalarPdlBlock(block) && (
            <ToolbarShowSourceButton root={block.pdl__id ?? ""} />
          )}
          <ToolbarSMLToggle sml={sml} setSML={setSML} />
          <DarkModeToggle />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
