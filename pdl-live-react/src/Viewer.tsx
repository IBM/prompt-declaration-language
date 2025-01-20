import { useLocation } from "react-router"
import { useContext, useMemo } from "react"

import { Tabs, Tab, TabTitleText } from "@patternfly/react-core"

import Code from "./view/Code"
import Transcript from "./view/transcript/Transcript"
import DarkModeContext from "./DarkModeContext"

import type { PdlBlock } from "./pdl_ast"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab (below)
  let { hash: activeTab } = useLocation()

  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  const data = useMemo(
    () => (value ? (JSON.parse(value) as PdlBlock) : null),
    [value],
  )

  if (!data) {
    return "Invalid trace content"
  }

  // Note: please keep eventKey===href
  const tabs = [
    <Tab
      key="#transcript"
      href="#transcript"
      eventKey="#transcript"
      title={<TabTitleText>Transcript</TabTitleText>}
    >
      <Transcript data={data} />
    </Tab>,
    <Tab
      key="#source"
      href="#source"
      eventKey="#source"
      title={<TabTitleText>Source</TabTitleText>}
    >
      <Code block={data} darkMode={darkMode} limitHeight={false} />
    </Tab>,
    <Tab
      key="#raw"
      href="#raw"
      eventKey="#raw"
      title={<TabTitleText>Raw Trace</TabTitleText>}
    >
      <Code block={data} darkMode={darkMode} limitHeight={false} raw />
    </Tab>,
  ]

  if (!tabs.find((tab) => tab.props.href === activeTab)) {
    // User provided bogus hash, default to first tab
    activeTab = tabs[0].props.href
  }

  return (
    <Tabs activeKey={activeTab} component="nav">
      {tabs}
    </Tabs>
  )
}
