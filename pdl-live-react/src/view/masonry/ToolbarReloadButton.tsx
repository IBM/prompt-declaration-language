import { invoke } from "@tauri-apps/api/core"
import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { Button, Tooltip } from "@patternfly/react-core"

import Icon from "@patternfly/react-icons/dist/esm/icons/redo-icon"

type Props = {
  setValue(value: string): void
}

export default function ToolbarReloadButton({ setValue }: Props) {
  const [searchParams] = useSearchParams()
  const traceFile = searchParams.get("traceFile")

  const enabled = window.__TAURI_INTERNALS__ && searchParams.has("traceFile")
  const handleClick = useCallback(async () => {
    try {
      const buf = await invoke<ArrayBuffer>("read_trace", {
        traceFile,
      }).catch(console.error)
      if (buf) {
        const decoder = new TextDecoder("utf-8") // Assuming UTF-8 encoding
        const newTraceBuf = decoder.decode(new Uint8Array(buf))
        if (newTraceBuf) {
          setValue(newTraceBuf)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [setValue])

  return (
    <Tooltip content="Reload this trace">
      <Button isDisabled={!enabled} onClick={handleClick} icon={<Icon />}>
        Reload
      </Button>
    </Tooltip>
  )
}
