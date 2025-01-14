import { useEffect, type PropsWithChildren } from "react"

import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  oneLight as light,
  vscDarkPlus as dark,
} from "react-syntax-highlighter/dist/esm/styles/prism"
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml"
import json from "react-syntax-highlighter/dist/esm/languages/prism/json"
import python from "react-syntax-highlighter/dist/esm/languages/prism/python"

/**
 * This is TypeScript that says SupportedLanguage is the type union of
 * all possible enum values of Language (which is an enum).
 */
export type SupportedLanguage = "yaml" | "json" | "python" | "plaintext"

import "./Preview.css"

type Props = {
  value: string
  darkMode?: boolean
  language?: SupportedLanguage
  showLineNumbers?: boolean
  limitHeight?: boolean
}

export default function Preview({
  language,
  value,
  darkMode,
  showLineNumbers,
  limitHeight,
}: PropsWithChildren<Props>) {
  useEffect(() => {
    SyntaxHighlighter.registerLanguage("json", json)
    SyntaxHighlighter.registerLanguage("yaml", yaml)
    SyntaxHighlighter.registerLanguage("python", python)
  }, [])

  // other options we could enable: isCopyEnabled isDownloadEnabled isLanguageLabelVisible
  return (
    <div className="pdl-preview" data-limit-height={limitHeight}>
      <SyntaxHighlighter
        style={darkMode ? dark : light}
        showLineNumbers={showLineNumbers}
        language={language}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
