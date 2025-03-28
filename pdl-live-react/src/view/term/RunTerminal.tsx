import { createRef, useCallback, useEffect, useState } from "react"

import { spawn } from "tauri-pty"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"

import "./RunTerminal.css"

type Props = {
  /** The cmd part of `cmd ...args` */
  cmd: string

  /** The current working directory in which to run `cmd` */
  cwd: string

  /** The args part of `cmd ...args */
  args?: string[]

  /** A callback provided by caller to be invoked upon pty completion */
  onExit?: (exitCode: number) => void

  /** A condition variable used by caller to request pty cancellation */
  cancel?: import("../masonry/condvar").default
}

export default function RunTerminal({
  cmd,
  cwd,
  args = [],
  onExit,
  cancel,
}: Props) {
  const ref = createRef<HTMLDivElement>()
  const [term, setTerm] = useState<null | Terminal>(null)
  const [exitCode, setExitCode] = useState(-1)

  /** Schema adapter from our props.onExit to that of tauri-pty */
  const onExit2 = useCallback(
    ({ exitCode }: { exitCode: number }) => {
      setExitCode(exitCode)
      if (onExit) {
        onExit(exitCode)
      }
    },
    [onExit, setExitCode],
  )

  /** Re-initialization of exit code if props change */
  useEffect(() => setExitCode(-1), [cmd, args, onExit, cancel])

  // Why a two-stage useEffect? Otherwise: cannot read properties of
  // undefined (reading 'dimensions')
  // See https://stackoverflow.com/a/78116690/5270773
  useEffect(() => {
    const term = new Terminal({
      fontFamily:
        '"Red Hat Mono", RedHatMono, "Courier New", Courier, monospace',
      fontSize: 12,
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
      const clipboardAddon = new ClipboardAddon()
      term.loadAddon(clipboardAddon)

      term.open(ref.current)
      fitAddon.fit()
      term.focus()

      // for debugging:
      // term.writeln(`Running ${cmd} ${args.join(" ")}`)

      // spawn shell
      const pty = spawn(cmd, args, {
        cwd,
        env: {
          PDL_VERBOSE_ASYNC: "true",
        },
        cols: term.cols,
        rows: term.rows,
      })

      /** Respond to cancellation request by killing the pty */
      cancel?.wait().then(() => {
        pty.kill()
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
  }, [term, ref, exitCode, cmd, args, cwd, cancel, onExit2])

  return (
    <div className="pdl-run-terminal" ref={ref} style={{ height: "600px" }} />
  )
}
