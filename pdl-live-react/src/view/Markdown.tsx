import { Content } from "@patternfly/react-core"
import RMD, { type Options as MarkdownProps } from "react-markdown"

import "./Markdown.css"

/** Simple wrapper over <Markdown/> */
export default function Markdown(props: MarkdownProps) {
  return (
    <Content className="pdl-markdown">
      <RMD {...props} />
    </Content>
  )
}
