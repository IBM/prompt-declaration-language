import { useCallback } from "react"
import { ClipboardCopy } from "@patternfly/react-core"

import "./CopyToClipboard.css"

export default function CopyToClipboard(props: { children: string }) {
  const copy = useCallback(
    () => navigator.clipboard.writeText(props.children),
    [props.children],
  )
  return (
    <ClipboardCopy isReadOnly variant="inline" onCopy={copy}>
      Copy
    </ClipboardCopy>
  )
}
