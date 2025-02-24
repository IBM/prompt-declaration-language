import { type ReactNode } from "react"
import {
  Content,
  PageSection,
  Panel,
  PanelFooter,
  PanelHeader,
  PanelMain,
  PanelMainBody,
} from "@patternfly/react-core"

import Page from "../Page"
import Intro from "./Intro"
import Links from "./Links"
import Tiles from "./Tiles"
import Toolbar from "./Toolbar"

import "./Welcome.css"

type Props = {
  breadcrumb1?: string
  intro?: ReactNode
  tiles?: ReactNode | ReactNode[]
}

export default function Welcome(props: Props) {
  return (
    <Page breadcrumb1={props.breadcrumb1 ?? "Welcome"} padding={false}>
      <PageSection type="subnav">
        <Toolbar />
      </PageSection>
      <PageSection isFilled hasOverflowScroll>
        <Panel>
          <PanelHeader>
            <Content component="h1">Prompt Declaration Language (PDL)</Content>
            {props.intro ?? <Intro />}
          </PanelHeader>

          <PanelMain className="pdl-welcome-content">
            <PanelMainBody>
              <Tiles tiles={props.tiles} />
            </PanelMainBody>
          </PanelMain>

          <PanelFooter>
            <Links />
          </PanelFooter>
        </Panel>
      </PageSection>
    </Page>
  )
}
