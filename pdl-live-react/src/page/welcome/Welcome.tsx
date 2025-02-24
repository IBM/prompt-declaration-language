import { type ReactNode } from "react"
import { Flex, FlexItem, PageSection, Title } from "@patternfly/react-core"

import Page from "../Page"
import Intro from "./Intro"
import Links from "./Links"
import Tiles from "./Tiles"
import Toolbar from "./Toolbar"

import "./Welcome.css"

const flex1 = { default: "flex_1" as const }

type Props = {
  breadcrumb1?: string
  intro?: ReactNode
  tiles?: ReactNode | ReactNode[]
}

export default function Welcome(props: Props) {
  return (
    <Page breadcrumb1={props.breadcrumb1}>
      <PageSection>
        <Flex>
          <Title headingLevel="h1">Prompt Declaration Language (PDL)</Title>{" "}
          <FlexItem flex={flex1}>
            <Toolbar />
          </FlexItem>
        </Flex>
        {props.intro ?? <Intro />}
      </PageSection>

      <PageSection isFilled hasOverflowScroll>
        <Tiles tiles={props.tiles} />
      </PageSection>

      <PageSection>
        <Links />
      </PageSection>
    </Page>
  )
}
