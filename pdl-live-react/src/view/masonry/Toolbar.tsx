import { Toolbar, ToolbarGroup, ToolbarContent } from "@patternfly/react-core"

import ToolbarAsToggle from "./ToolbarAsToggle"
import ToolbarSMLToggle from "./ToolbarSMLToggle"
// import ToolbarReplayButton from "./ToolbarReplayButton"
import ToolbarShowSourceButton from "./ToolbarShowSourceButton"

const alignEnd = { default: "alignEnd" as const }

export type As = "grid" | "list"
export type SML = "s" | "m" | "l"

export type Props = {
  block: import("../../pdl_ast").PdlBlock
  setValue(value: string): void

  as: As
  setAs(as: As): void

  sml: SML
  setSML(sml: SML): void
}

export default function MasonryToolbar({
  as,
  setAs,
  sml,
  setSML,
  // block,
  // setValue,
}: Props) {
  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain">
          {/*<ToolbarReplayButton block={block} setValue={setValue} />*/}
          <ToolbarShowSourceButton />
        </ToolbarGroup>
        <ToolbarGroup align={alignEnd} variant="action-group">
          <ToolbarSMLToggle sml={sml} setSML={setSML} />
          <ToolbarAsToggle as={as} setAs={setAs} />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
