import {
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Stack,
  Title,
} from "@patternfly/react-core"
import Page from "../Page"

import Intro from "./Intro"
import Links from "./Links"
import Tiles from "./Tiles"

export default function Welcome() {
  return (
    <Page breadcrumb1="Welcome" padding={false}>
      <Panel>
        <PanelHeader>
          <Title headingLevel="h1">Prompt Declaration Language (PDL)</Title>
        </PanelHeader>

        <PanelMain>
          <PanelMainBody>
            <Intro />
            <Stack hasGutter>
              <Links />
              <Tiles />
            </Stack>
          </PanelMainBody>
        </PanelMain>
      </Panel>
    </Page>
  )
}
