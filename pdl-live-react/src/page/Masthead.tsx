import { useCallback } from "react"
import { useLocation, useSearchParams } from "react-router"

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
} from "@patternfly/react-core"

import PDLIcon from "../assets/ai-governance--prompt.svg"
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon"

import "./Masthead.css"

const alignCenter = { default: "alignItemsCenter" as const }

function Toggle() {
  const { hash } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const onSidebarToggle = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    const isOpen = searchParams.has("sidebar")
    if (isOpen) {
      newSearchParams.delete("sidebar")
    } else {
      newSearchParams.set("sidebar", "true")
    }
    setSearchParams(newSearchParams)

    // sigh, see https://github.com/remix-run/react-router/issues/8393
    if (hash) {
      setTimeout(() => (window.location.hash = hash))
    }
  }, [searchParams, setSearchParams, hash])

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

function Content() {
  return <MastheadContent></MastheadContent>
}

export default function PDLMasthead() {
  return (
    <Masthead>
      <Main />
      <Content />
    </Masthead>
  )
}
