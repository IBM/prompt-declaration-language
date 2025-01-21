import {
  Flex,
  Masthead,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  MastheadLogo,
  MastheadContent,
  PageToggleButton,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core"

import DarkModeToggle from "./DarkModeToggle"

import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon"
import PDLIcon from "./assets/ai-governance--prompt.svg?react"

const alignRight = { default: "alignEnd" as const }
const alignCenter = { default: "alignItemsCenter" as const }

function Toggle() {
  return (
    <MastheadToggle>
      <PageToggleButton
        variant="plain"
        aria-label="Global navigation"
        id="pdl--vertical-nav-toggle"
      >
        <BarsIcon />
      </PageToggleButton>
    </MastheadToggle>
  )
}

function Brand() {
  return (
    <MastheadBrand>
      <MastheadLogo
        href="https://ibm.github.io/prompt-declaration-language/"
        target="_blank"
      >
        <Flex alignItems={alignCenter}>
          <PDLIcon className="pdl-logo" /> <Title headingLevel="h4">PDL</Title>
        </Flex>
      </MastheadLogo>
    </MastheadBrand>
  )
}

function Main() {
  return (
    <MastheadMain>
      <Toggle />
      <Brand />
    </MastheadMain>
  )
}

function Content(props: import("./DarkModeToggle").DarkModeProps) {
  return (
    <MastheadContent>
      <Toolbar isStatic>
        <ToolbarContent>
          <ToolbarGroup align={alignRight}>
            <ToolbarItem align={alignRight}>
              <DarkModeToggle {...props} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </MastheadContent>
  )
}

export default function PDLMasthead(
  props: import("./DarkModeToggle").DarkModeProps,
) {
  return (
    <Masthead>
      <Main />
      <Content {...props} />
    </Masthead>
  )
}
