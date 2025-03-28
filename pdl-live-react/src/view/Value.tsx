import Code from "./code/Code"
import Markdown from "./Markdown"

type Props = { children: boolean | number | string | unknown }

function isJson(s: string) {
  try {
    JSON.parse(s)
    return true
  } catch (_err) {
    return false
  }
}

export default function Value({ children: s }: Props) {
  return typeof s === "number" ? (
    <div className="pdl-markdown">{s}</div>
  ) : typeof s === "string" ? (
    isJson(s) ? (
      <Code block={s} language="json" />
    ) : (
      <Markdown>{s === "\n" ? "*<newline>*" : s.trim()}</Markdown>
    )
  ) : (
    JSON.stringify(s, undefined, 2)
  )
}
