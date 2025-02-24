import Markdown from "./Markdown"

type Props = { children: number | string | unknown }

export default function Value({ children: s }: Props) {
  return (
    <>
      {typeof s === "number" ? (
        s
      ) : typeof s === "string" ? (
        <Markdown>{s === "\n" ? "*<newline>*" : s.trim()}</Markdown>
      ) : (
        JSON.stringify(s, undefined, 2)
      )}
    </>
  )
}
