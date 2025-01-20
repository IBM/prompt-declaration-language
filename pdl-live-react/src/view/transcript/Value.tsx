import Markdown from "../Markdown"
import { isMarkdownish } from "../../helpers"

type Props = { children: number | string | unknown }

export default function Value({ children: s }: Props) {
  return (
    <>
      {typeof s === "number" ? (
        s
      ) : typeof s === "string" ? (
        isMarkdownish(s) ? (
          <Markdown>{s}</Markdown>
        ) : (
          <span className="pdl-wrap">{s.trim()}</span>
        )
      ) : (
        JSON.stringify(s, undefined, 2)
      )}
    </>
  )
}
