import { useCallback } from "react"
import {
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarGroup,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core"

import ListIcon from "@patternfly/react-icons/dist/esm/icons/list-icon"
import GridIcon from "@patternfly/react-icons/dist/esm/icons/th-large-icon"

const alignEnd = { default: "alignEnd" as const }

export type As = "grid" | "list"

type Props = {
  as: As
  setAs(as: As): void
}

export default function MasonryToolbar({ as, setAs }: Props) {
  const handleClickGrid = useCallback(() => {
    setAs("grid")
  }, [setAs])
  const handleClickList = useCallback(() => {
    setAs("list")
  }, [setAs])

  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain" align={alignEnd}>
          <ToolbarItem>
            <ToggleGroup aria-label="masonry grid-table toggle">
              <ToggleGroupItem
                icon={<GridIcon />}
                aria-label="masonry as grid"
                isSelected={as === "grid"}
                onChange={handleClickGrid}
              />
              <ToggleGroupItem
                icon={<ListIcon />}
                aria-label="masonry as list"
                isSelected={as === "list"}
                onChange={handleClickList}
              />
            </ToggleGroup>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
