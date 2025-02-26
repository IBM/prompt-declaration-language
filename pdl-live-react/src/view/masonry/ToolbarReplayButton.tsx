import { invoke } from "@tauri-apps/api/core"
import { Button, Tooltip } from "@patternfly/react-core"
import { useCallback, useState } from "react"

import { isNonScalarPdlBlock } from "../../helpers"

type Props = {
  block: import("../../pdl_ast").PdlBlock
  setValue(value: string): void
  setModalContent: import("react").Dispatch<
    import("react").SetStateAction<{
      header: string
      cmd: string
      args?: string[]
      onExit?: (exitCode: number) => void
    } | null>
  >
}

export default function ToolbarReplayButton({
  block,
  setValue,
  setModalContent,
}: Props) {
  const [isReplaying, setIsReplaying] = useState(false)

  const handleClickReplay = useCallback(async () => {
    if (isNonScalarPdlBlock(block)) {
      setIsReplaying(true)

      const [cmd, input, output] = (await invoke("replay_prep", {
        trace: JSON.stringify(block),
        name: block.description?.slice(0, 20).replace(/\s/g, "-") ?? "trace",
      })) as [string, string, string]
      console.error(`Replaying with cmd=${cmd} input=${input} output=${output}`)

      setModalContent({
        header: "Running Program",
        cmd,
        args: ["run", "--trace", output, input],
        onExit: async () => {
          setIsReplaying(false)
          try {
            const buf = await invoke<ArrayBuffer>("read_trace", {
              traceFile: output,
            }).catch(console.error)
            if (buf) {
              const decoder = new TextDecoder("utf-8") // Assuming UTF-8 encoding
              const newTrace = decoder.decode(new Uint8Array(buf))
              if (newTrace) {
                setValue(newTrace)
              }
            }
          } catch (err) {
            console.error(err)
          }
        },
      })
    }
  }, [block, setIsReplaying, setModalContent, setValue])

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
