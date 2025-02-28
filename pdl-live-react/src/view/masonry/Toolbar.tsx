import { Toolbar, ToolbarGroup, ToolbarContent } from "@patternfly/react-core"

import DarkModeToggle from "../../page/DarkModeToggle"
import ToolbarSMLToggle from "./ToolbarSMLToggle"
import ToolbarReplayButton from "./ToolbarReplayButton"
import ToolbarShowSourceButton from "./ToolbarShowSourceButton"

const alignEnd = { default: "alignEnd" as const }

export type SML = "s" | "m" | "l" | "xl"

export type Props = {
  run: import("./MasonryCombo").Runner
  block: import("../../pdl_ast").PdlBlock

  sml: SML
  setSML(sml: SML): void
}

export default function MasonryToolbar({ block, run, sml, setSML }: Props) {
  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain">
          <ToolbarReplayButton block={block} run={run} />
        </ToolbarGroup>
        <ToolbarGroup align={alignEnd} variant="action-group">
          <ToolbarShowSourceButton />
          <ToolbarSMLToggle sml={sml} setSML={setSML} />
          <DarkModeToggle />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
