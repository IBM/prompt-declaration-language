import { useCallback } from "react"
import { useLocation } from "react-router"

import {
  CodeEditor,
  type CodeEditorProps,
  Language,
} from "@patternfly/react-code-editor"

/**
 * This is TypeScript that says SupportedLanguage is the type union of
 * all possible enum values of Language (which is an enum).
 */
export type SupportedLanguage = keyof typeof Language

import "./Preview.css"

type Props = {
  value: string
  language?: SupportedLanguage
  showLineNumbers?: boolean
  limitHeight?: boolean
  remount?: boolean
}

const options: Required<CodeEditorProps>["options"] = {
  wordWrap: "on",
  automaticLayout: true,
  scrollBeyondLastLine: false,
  scrollbar: { alwaysConsumeMouseWheel: false },
}

type Editor = Parameters<Required<CodeEditorProps>["onEditorDidMount"]>[0]

export default function Preview({
  language,
  value,
  showLineNumbers,
  limitHeight,
  remount,
}: Props) {
  const { hash } = useLocation()
  const onEditorDidMount = useCallback((editor: Editor) => {
    editor.layout()
  }, [])

  return (
    <div className="pdl-preview" data-limit-height={limitHeight}>
      <CodeEditor
        key={remount ? hash + value : undefined}
        code={value}
        isDarkTheme
        isCopyEnabled
        isDownloadEnabled
        isLanguageLabelVisible
        options={options}
        onEditorDidMount={onEditorDidMount}
        language={Language[language || "yaml"]}
        isLineNumbersVisible={showLineNumbers}
        height={limitHeight ? "sizeToFit" : "100%"}
      />
    </div>
  )
}
