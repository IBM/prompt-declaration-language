import { useLocation } from "react-router"
import { Tabs, Tab, TabTitleText } from "@patternfly/react-core"

/** This is the main view component */
export default function Viewer({ hidden = false }: { hidden?: boolean }) {
  // We will use this to find the current active tab (below)
  let { hash: activeTab } = useLocation()

  // Note: please keep eventKey===href
  const tabs = [
    <Tab
      key="#summary"
      href="#summary"
      eventKey="#summary"
      className="pdl-viewer-tab"
      title={<TabTitleText>Summary</TabTitleText>}
    />,
    <Tab
      key="#timeline"
      href="#timeline"
      eventKey="#timeline"
      className="pdl-viewer-tab"
      title={<TabTitleText>Timeline</TabTitleText>}
    />,
    <Tab
      key="#dataflow"
      href="#dataflow"
      eventKey="#dataflow"
      className="pdl-viewer-tab"
      title={<TabTitleText>Memory</TabTitleText>}
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
    <section hidden={hidden}>
      <Tabs activeKey={activeTab} component="nav" mountOnEnter>
        {tabs}
      </Tabs>
    </section>
  )
}
