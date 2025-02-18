import { useCallback, useState } from "react"
import { useLocation, useNavigate } from "react-router"

import { invoke } from "@tauri-apps/api/core"

import { Button, Tooltip } from "@patternfly/react-core"

type Props = {
  block: import("../../pdl_ast").PdlBlock
  setValue(value: string): void
}

export default function ToolbarReplayButton({ block, setValue }: Props) {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [isReplaying, setIsReplaying] = useState(false)

  const handleClickSource = useCallback(async () => {
    setIsReplaying(true)
    try {
      const newTrace = (await invoke("replay", {
        trace: JSON.stringify(block),
      })) as string
      console.log("new trace", newTrace)
      setValue(newTrace)
    } catch (err) {
      console.error(err)
    } finally {
      setIsReplaying(false)
    }
  }, [hash, navigate, setIsReplaying])

  return (
    <Tooltip content="Re-run this program">
      <Button
        className="pdl-replay-button"
        spinnerAriaLabel="Replaying program"
        spinnerAriaValueText="Replaying"
        isLoading={isReplaying}
        onClick={handleClickSource}
      >
        Run
      </Button>
    </Tooltip>
  )
}
