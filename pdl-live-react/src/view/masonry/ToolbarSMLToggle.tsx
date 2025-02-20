import { useCallback } from "react"
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core"

export default function ToolbarAsToggler({
  sml,
  setSML,
}: Pick<import("./Toolbar").Props, "sml" | "setSML">) {
  const handleClickS = useCallback(() => {
    setSML("s")
  }, [setSML])
  const handleClickM = useCallback(() => {
    setSML("m")
  }, [setSML])
  const handleClickL = useCallback(() => {
    setSML("l")
  }, [setSML])
  const handleClickXL = useCallback(() => {
    setSML("xl")
  }, [setSML])

  return (
    <ToggleGroup aria-label="masonry small-medium-large toggle" isCompact>
      <ToggleGroupItem
        icon="S"
        aria-label="masonry compact layout"
        isSelected={sml === "s"}
        onChange={handleClickS}
      />
      <ToggleGroupItem
        icon="M"
        aria-label="masonry medium layout"
        isSelected={sml === "m"}
        onChange={handleClickM}
      />
      <ToggleGroupItem
        icon="L"
        aria-label="masonry comfy layout"
        isSelected={sml === "l"}
        onChange={handleClickL}
      />
      <ToggleGroupItem
        icon="XL"
        aria-label="masonry extra-comfy layout"
        isSelected={sml === "xl"}
        onChange={handleClickXL}
      />
    </ToggleGroup>
  )
}
