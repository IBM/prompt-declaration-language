import { createRef, useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { ClipboardAddon } from "@xterm/addon-clipboard"
import { CodeEditor, Language } from "@patternfly/react-code-editor"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core"

import Page from "./Page"
import "./Run.css"

const initialInput = `text:
  - text:
      - '{"key": "value"}'
    parser: json
    def: foo
  - \${ foo.key }`
export default function Run() {
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState(initialInput)
  const [_error, setError] = useState(false)

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

      // for debugging:
      // term.writeln(`Running ${cmd} ${args.join(" ")}`)
    }
  }, [term, xtermRef])

  const run = async () => {
    try {
      setRunning(true)
      term?.reset()
      const result = await invoke("run_pdl_program", {
        program: input,
        debug: false,
      })
      term?.write(String(result))
      console.error(true)
    } catch (err) {
      term?.write(String(err))
      setError(true)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Page breadcrumb1="Run">
      <PageSection type="subnav">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button onClick={run} isLoading={running}>
                Run
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <PageSection
        className="pdl-run-page-section"
        padding={{ default: "noPadding" }}
      >
        <Card isCompact isPlain>
          <CardHeader className="pdl-run-split-item-card-header">
            <CardTitle>Program</CardTitle>
          </CardHeader>
          <CardBody className="pdl-run-split-item-card-body">
            <div style={{ height: "300px" }}>
              <CodeEditor
                onEditorDidMount={(editor, _monaco) => {
                  editor.layout()
                }}
                options={{ fontSize: 16 }}
                aria-label="text area to provide PDL program source"
                code={initialInput}
                isDarkTheme
                isFullHeight
                language={Language.yaml}
                onChange={(value) => {
                  setError(false)
                  setInput(value)
                }}
              />
            </div>
          </CardBody>
        </Card>

        <Card isCompact isPlain>
          <CardHeader className="pdl-run-split-item-card-header">
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardBody className="pdl-run-split-item-card-body">
            <div
              className="pdl-run-terminal"
              ref={xtermRef}
              style={{ height: "400px" }}
            />
          </CardBody>
        </Card>
      </PageSection>
    </Page>
  )
}
