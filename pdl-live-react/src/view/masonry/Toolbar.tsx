import { Toolbar, ToolbarGroup, ToolbarContent } from "@patternfly/react-core"

import ToolbarSMLToggle from "./ToolbarSMLToggle"
import ToolbarReplayButton from "./ToolbarReplayButton"
import ToolbarShowSourceButton from "./ToolbarShowSourceButton"

const alignEnd = { default: "alignEnd" as const }

export type SML = "s" | "m" | "l" | "xl"

export type Props = {
  block: import("../../pdl_ast").PdlBlock
  setValue(value: string): void

  sml: SML
  setSML(sml: SML): void

  setModalContent: import("react").Dispatch<
    import("react").SetStateAction<{ header: string; body: string } | null>
  >
}

export default function MasonryToolbar({
  sml,
  setSML,
  block,
  setValue,
  setModalContent,
}: Props) {
  return (
    <Toolbar className="pdl-masonry-toolbar">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain">
          <ToolbarReplayButton
            block={block}
            setValue={setValue}
            setModalContent={setModalContent}
          />
          <ToolbarShowSourceButton />
        </ToolbarGroup>
        <ToolbarGroup align={alignEnd} variant="action-group">
          <ToolbarSMLToggle sml={sml} setSML={setSML} />
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  )
}
