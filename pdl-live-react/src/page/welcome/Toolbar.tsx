import { Toolbar, ToolbarGroup, ToolbarContent } from "@patternfly/react-core"

import DarkModeToggle from "../DarkModeToggle"

const alignEnd = { default: "alignEnd" as const }

export default function WelcomeToolbar() {
  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup align={alignEnd} variant="action-group">
          <DarkModeToggle />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
