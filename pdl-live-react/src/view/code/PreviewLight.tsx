import { useEffect } from "react"

import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter"
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript"
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json"
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml"
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python"

import style from "react-syntax-highlighter/dist/esm/styles/hljs/night-owl"

import { type SupportedLanguage } from "./Code"

import "./PreviewLight.css"

type Props = {
  value: string
  language: SupportedLanguage
  showLineNumbers?: boolean
  wrap?: boolean
}

export default function PreviewLight({
  language,
  value,
  showLineNumbers = false,
  wrap = true,
}: Props) {
  useEffect(() => {
    SyntaxHighlighter.registerLanguage("json", json)
    SyntaxHighlighter.registerLanguage("yaml", yaml)
    SyntaxHighlighter.registerLanguage("python", python)
    SyntaxHighlighter.registerLanguage("javascript", js)
  }, [])

  return (
    <SyntaxHighlighter
      className="pdl-preview-light"
      style={style}
      language={language}
      wrapLongLines={wrap}
      showLineNumbers={showLineNumbers}
    >
      {value}
    </SyntaxHighlighter>
  )
}
