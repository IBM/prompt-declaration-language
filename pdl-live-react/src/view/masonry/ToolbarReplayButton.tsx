import { useCallback } from "react"
import { Button, Tooltip } from "@patternfly/react-core"

type Props = {
  run: import("./MasonryCombo").Runner
  isRunning: boolean
}

export default function ToolbarReplayButton({ run, isRunning }: Props) {
  const handleClickReplay = useCallback(() => run(), [run])

  const notLocal = !window.__TAURI_INTERNALS__
  return (
    <Tooltip content="Re-run this program">
      <Button
        spinnerAriaLabel="Replaying program"
        spinnerAriaValueText="Replaying"
        isLoading={isRunning}
        isDisabled={notLocal}
        variant={isRunning ? "warning" : undefined}
        onClick={handleClickReplay}
      >
        Run
      </Button>
    </Tooltip>
  )
}
