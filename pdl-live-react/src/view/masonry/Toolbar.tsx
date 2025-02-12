import {
  Toolbar,
  ToolbarGroup,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core"

import ToolbarAsToggle from "./ToolbarAsToggle"
import ToolbarSMLToggle from "./ToolbarSMLToggle"

const alignEnd = { default: "alignEnd" as const }

export type As = "grid" | "list"
export type SML = "s" | "m" | "l"

export type Props = {
  as: As
  setAs(as: As): void

  sml: SML
  setSML(sml: SML): void
}

export default function MasonryToolbar({ as, setAs, sml, setSML }: Props) {
  return (
    <Toolbar className="pdl-masonry-toolbar" isSticky>
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain" align={alignEnd}>
          <ToolbarItem>
            <ToolbarSMLToggle sml={sml} setSML={setSML} />
            <ToolbarAsToggle as={as} setAs={setAs} />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
