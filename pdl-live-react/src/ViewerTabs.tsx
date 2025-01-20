import { useLocation } from "react-router"
import { Tabs, Tab, TabTitleText } from "@patternfly/react-core"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer() {
  // We will use this to find the current active tab (below)
  let { hash: activeTab } = useLocation()

  // Note: please keep eventKey===href
  const tabs = [
    <Tab
      key="#transcript"
      href="#transcript"
      eventKey="#transcript"
      className="pdl-viewer-tab"
      title={<TabTitleText>Transcript</TabTitleText>}
    />,
    <Tab
      key="#source"
      href="#source"
      eventKey="#source"
      className="pdl-viewer-tab"
      title={<TabTitleText>Source</TabTitleText>}
    />,
    <Tab
      key="#raw"
      href="#raw"
      eventKey="#raw"
      className="pdl-viewer-tab"
      title={<TabTitleText>Raw Trace</TabTitleText>}
    />,
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
