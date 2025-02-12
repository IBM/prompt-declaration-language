import { useCallback } from "react"
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core"

export default function ToolbarProgramOrSourceToggle({
  view,
  setView,
}: Pick<import("./Toolbar").Props, "view" | "setView">) {
  const handleClickProgram = useCallback(() => {
    setView("program")
  }, [setView])
  const handleClickSource = useCallback(() => {
    setView("source")
  }, [setView])
  const handleClickRawTrace = useCallback(() => {
    setView("rawtrace")
  }, [setView])

  return (
    <ToggleGroup aria-label="masonry program-source toggle">
      <ToggleGroupItem
        text="Program"
        aria-label="show program"
        isSelected={view === "program"}
        onClick={handleClickProgram}
      />
      <ToggleGroupItem
        text="Source"
        aria-label="show source"
        isSelected={view === "source"}
        onClick={handleClickSource}
      />
      <ToggleGroupItem
        text="Raw Trace"
        aria-label="show raw trace"
        isSelected={view == "rawtrace"}
        onClick={handleClickRawTrace}
      />
    </ToggleGroup>
  )
}
