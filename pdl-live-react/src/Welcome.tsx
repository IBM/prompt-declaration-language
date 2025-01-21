import { Content } from "@patternfly/react-core"
import Page from "./Page"

export default function Welcome() {
  return (
    <Page>
      <Content component="h1">Prompt Declaration Language (PDL) Viewer</Content>

      <Content component="p">
        You may either upload a trace, or select one of the demo traces from the
        left.
      </Content>
    </Page>
  )
}
