import { useCallback } from "react"
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core"

import ListIcon from "@patternfly/react-icons/dist/esm/icons/list-icon"
import GridIcon from "@patternfly/react-icons/dist/esm/icons/th-large-icon"

export default function ToolbarAsToggler({
  as,
  setAs,
}: Pick<import("./Toolbar").Props, "as" | "setAs">) {
  const handleClickGrid = useCallback(() => {
    setAs("grid")
  }, [setAs])
  const handleClickList = useCallback(() => {
    setAs("list")
  }, [setAs])

  return (
    <ToggleGroup aria-label="masonry grid-table toggle" isCompact>
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
  )
}
