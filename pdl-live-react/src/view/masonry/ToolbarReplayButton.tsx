import { invoke, Channel } from "@tauri-apps/api/core"
import { Button, Tooltip } from "@patternfly/react-core"
import { useCallback, useState } from "react"

type Props = {
  block: import("../../pdl_ast").PdlBlock
  setValue(value: string): void
  setModalContent: import("react").Dispatch<
    import("react").SetStateAction<{ header: string; body: string } | null>
  >
}

export default function ToolbarReplayButton({
  block,
  setValue,
  setModalContent,
}: Props) {
  const [isReplaying, setIsReplaying] = useState(false)

  const handleClickSource = useCallback(async () => {
    setIsReplaying(true)

    const reader = new Channel<{ message: string; done: boolean }>()
    reader.onmessage = ({ message, done = false }) => {
      //console.log(`got event ${message}`)
      setModalContent((content) => ({
        done,
        header: "Running Program",
        body: !content ? message : content.body + "\n" + message,
      }))
    }

    try {
      const newTrace = (await invoke("replay", {
        reader,
        trace: JSON.stringify(block),
      })) as string
      console.log("new trace", newTrace)
      setValue(newTrace)
    } catch (err) {
      console.error(err)
    } finally {
      setIsReplaying(false)
    }
  }, [block, setValue, setIsReplaying, setModalContent])

  return (
    <Tooltip content="Re-run this program">
      <Button
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
