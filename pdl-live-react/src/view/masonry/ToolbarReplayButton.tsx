import { Button, Tooltip } from "@patternfly/react-core"
import { useCallback, useState } from "react"

import { isNonScalarPdlBlock } from "../../helpers"

type Props = {
  run: import("./MasonryCombo").Runner
  block: import("../../pdl_ast").PdlBlock
}

export default function ToolbarReplayButton({ run, block }: Props) {
  const [isReplaying, setIsReplaying] = useState(false)

  const handleClickReplay = useCallback(() => {
    if (isNonScalarPdlBlock(block)) {
      setIsReplaying(true)
      run(block, () => setIsReplaying(false))
    }
  }, [run, block, setIsReplaying])

  const notLocal = !window.__TAURI_INTERNALS__
  return (
    <Tooltip content="Re-run this program">
      <Button
        spinnerAriaLabel="Replaying program"
        spinnerAriaValueText="Replaying"
        isLoading={isReplaying}
        isDisabled={!block || notLocal}
        onClick={handleClickReplay}
      >
        Run
      </Button>
    </Tooltip>
  )
}
