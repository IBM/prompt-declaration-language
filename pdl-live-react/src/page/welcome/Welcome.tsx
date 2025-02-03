import {
  Content,
  Panel,
  PanelFooter,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Stack,
} from "@patternfly/react-core"

import Page from "../Page"
import Intro from "./Intro"
import Links from "./Links"
import Tiles from "./Tiles"

import "./Welcome.css"

export default function Welcome() {
  return (
    <Page breadcrumb1="Welcome" padding={false}>
      <Panel>
        <PanelHeader>
          <Content component="h1">Prompt Declaration Language (PDL)</Content>
          <Intro />
        </PanelHeader>

        <PanelMain className="pdl-welcome-content">
          <PanelMainBody>
            <Stack hasGutter>
              <Tiles />
            </Stack>
          </PanelMainBody>
        </PanelMain>

        <PanelFooter>
          <Links />
        </PanelFooter>
      </Panel>
    </Page>
  )
}
