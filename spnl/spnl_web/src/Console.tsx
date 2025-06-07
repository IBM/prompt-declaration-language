import Markdown from "react-markdown"
import { useCallback, useEffect, useState } from "react"
import { Content, Stack } from "@patternfly/react-core"

import run from "./run"
import ProgressUI, { type InitProgress } from "./ProgressUI"

export type RunState = "idle" | "running" | "success" | "error"

type Props = {
  model: string
  runState: RunState
  query: null | import("./Unit").Unit
  onComplete(success: boolean): void
}

export default function Console({
  model: defaultModel,
  runState,
  query,
  onComplete,
}: Props) {
  const [progressInit, setProgressInit] = useState<null | InitProgress>(null)
  const [progressDownload, setProgressDownload] = useState(-1)
  const [progressDoPar, setProgressDoPar] = useState<null | InitProgress[]>(
    null,
  )

  const [executionOutput, setExecutionOutput] = useState("")
  const emit = useCallback(
    (s: string) => {
      setExecutionOutput((soFar) => soFar + s)
      return s
    },
    [setExecutionOutput],
  )

  useEffect(() => {
    const start = async (query: import("./Unit").Unit) => {
      if (!defaultModel) {
        setExecutionOutput("**Error**: please select a model")
        onComplete(false)
        return
      }

      setProgressInit(null)
      setProgressDownload(-1)
      setProgressDoPar(null)
      setExecutionOutput("")
      try {
        await run(query, {
          defaultModel,
          emit,
          setProgressInit,
          setProgressDownload,
          setProgressDoPar,
        })
        onComplete(true)
      } catch (err) {
        const msg = String(err)
        if (/WebGPUNotAvailableError/.test(msg)) {
          // want: instanceof WebGPUNotAvailableError) {
          setExecutionOutput(
            "**Error**: this browser does not support WebGPU. Consult [this page](https://caniuse.com/webgpu) to find a supported browser. Chrome is a good bet right now.",
          )
        } else {
          console.error(err)
          setExecutionOutput("**Error**: " + msg)
        }
        onComplete(false)
      }
    }

    if (runState === "running" && query !== null) {
      start(query)
    }
  }, [
    emit,
    query,
    runState,
    setProgressInit,
    setProgressDownload,
    setProgressDoPar,
    setExecutionOutput,
    onComplete,
  ])

  return (
    <Stack hasGutter>
      <Content>
        <Markdown>{executionOutput || "*Awaiting query execution*"}</Markdown>
      </Content>
      <ProgressUI
        init={progressInit}
        download={progressDownload}
        dopar={progressDoPar}
      />
    </Stack>
  )
}

/*import { createRef, useEffect, useState } from "react"
import { Button, Tooltip } from "@patternfly/react-core"

import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"

import "@xterm/xterm/css/xterm.css"

export default function Console() {
  const xtermRef = createRef<HTMLDivElement>()
  const [term, setTerm] = useState<null | Terminal>(null)

  // Why a two-stage useEffect? Otherwise: cannot read properties of
  // undefined (reading 'dimensions')
  // See https://stackoverflow.com/a/78116690/5270773
  useEffect(() => {
    const term = new Terminal({
      fontFamily:
        '"Red Hat Mono", RedHatMono, "Courier New", Courier, monospace',
      convertEol: true,
    })
    setTerm(term)

    // for debugging:
    term.writeln(`\x1b[2mWaiting for first run\x1b[0m`)

    return () => {
      if (term) {
        term.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (term && xtermRef.current) {
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      const clipboardAddon = new ClipboardAddon()
      term.loadAddon(clipboardAddon)

      term.open(xtermRef.current)
      fitAddon.fit()
      // term.focus()
    }
  }, [term, xtermRef])

  return <div ref={xtermRef} />
}
*/
