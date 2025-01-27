import type Model from "../timeline/model"

import Code from "../Code"

export default function SourceTabContent({ block }: { block: Model[number] }) {
  return <Code block={block.block} showLineNumbers />
}
