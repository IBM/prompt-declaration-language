import { createRef, useCallback, useEffect, useState } from "react"

import { spawn } from "tauri-pty"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"

import "./RunTerminal.css"

type Props = {
  cmd: string
  args?: string[]
  onExit?: (exitCode: number) => void
}

export default function RunTerminal({ cmd, args = [], onExit }: Props) {
  const ref = createRef<HTMLDivElement>()
  const [term, setTerm] = useState<null | Terminal>(null)
  const [exitCode, setExitCode] = useState(-1)

  const onExit2 = useCallback(
    ({ exitCode }: { exitCode: number }) => {
      setExitCode(exitCode)
      if (onExit) {
        onExit(exitCode)
      }
    },
    [onExit, setExitCode],
  )

  useEffect(() => setExitCode(-1), [cmd, args, onExit])

  // Why a two-stage useEffect? Otherwise: cannot read properties of
  // undefined (reading 'dimensions')
  // See https://stackoverflow.com/a/78116690/5270773
  useEffect(() => {
    const term = new Terminal({
      fontFamily:
        '"Red Hat Mono", RedHatMono, "Courier New", Courier, monospace',
      fontSize: 14,
    })
    setTerm(term)
    return () => {
      if (term) {
        term.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (term && ref.current && exitCode === -1) {
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      term.open(ref.current)
      fitAddon.fit()
      term.focus()

      // spawn shell
      const pty = spawn(cmd, args, {
        cols: term.cols,
        rows: term.rows,
      })

      pty.onData((data) => term.write(data))
      term.onData((data) => pty.write(data))

      pty.onExit(onExit2)
      term.onResize((e) => pty.resize(e.cols, e.rows))

      return () => {
        try {
          //pty.kill()
        } catch (err) {
          console.error(err)
        }
      }
    }
  }, [term, ref, exitCode, args, cmd, onExit2])

  return (
    <div className="pdl-run-terminal" ref={ref} style={{ height: "600px" }} />
  )
}
