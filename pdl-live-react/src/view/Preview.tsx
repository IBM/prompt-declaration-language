import { useCallback } from "react"
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
}

const options: Required<CodeEditorProps>["options"] = {
  automaticLayout: true,
  scrollBeyondLastLine: false,
  scrollbar: { alwaysConsumeMouseWheel: false },
}

export default function Preview({
  language,
  value,
  showLineNumbers,
  limitHeight,
}: Props) {
  const onEditorDidMount = useCallback<
    Required<CodeEditorProps>["onEditorDidMount"]
  >((editor) => {
    setTimeout(() => editor.layout())
  }, [])

  // other options we could enable: isCopyEnabled isDownloadEnabled isLanguageLabelVisible
  return (
    <div className="pdl-preview" data-limit-height={limitHeight}>
      <CodeEditor
        code={value}
        isDarkTheme
        height="sizeToFit"
        options={options}
        onEditorDidMount={onEditorDidMount}
        language={Language[language || "yaml"]}
        isLineNumbersVisible={showLineNumbers}
      />
    </div>
  )
}
