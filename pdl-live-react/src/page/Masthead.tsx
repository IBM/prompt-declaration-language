import { useCallback } from "react"
import { useSearchParams } from "react-router"

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

import PDLIcon from "../assets/ai-governance--prompt.svg"
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon"

import "./Masthead.css"

const alignRight = { default: "alignEnd" as const }
const alignCenter = { default: "alignItemsCenter" as const }

function Toggle() {
  const [searchParams, setSearchParams] = useSearchParams()
  const onSidebarToggle = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    const isOpen = !!searchParams.get("sidebar")
    if (isOpen) {
      newSearchParams.delete("sidebar")
    } else {
      newSearchParams.set("sidebar", "true")
    }
    setSearchParams(newSearchParams)
  }, [searchParams, setSearchParams])

  return (
    <MastheadToggle>
      <PageToggleButton
        variant="plain"
        aria-label="Global navigation"
        id="pdl--vertical-nav-toggle"
        onSidebarToggle={onSidebarToggle}
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
          <img className="pdl-logo" src={PDLIcon} />{" "}
          <Title headingLevel="h4">PDL</Title>
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
