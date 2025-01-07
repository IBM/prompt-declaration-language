import { useCallback, useContext, useMemo, useState } from "react"

import { Tabs, Tab, TabTitleText, type TabsProps } from "@patternfly/react-core"

import Code from "./view/Code"
import Transcript from "./view/transcript/Transcript"
import DarkModeContext from "./DarkModeContext"

import type { PdlBlock } from "./pdl_ast"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  const data = useMemo(
    () => (value ? (JSON.parse(value) as PdlBlock) : null),
    [value],
  )

  const [activeTab, setActiveTab] = useState<string | number>("transcript")
  const handleTabClick = useCallback<Required<TabsProps>["onSelect"]>(
    (_event, tab) => setActiveTab(tab),
    [setActiveTab],
  )

  return (
    data && (
      <Tabs activeKey={activeTab} onSelect={handleTabClick}>
        <Tab
          eventKey="transcript"
          title={<TabTitleText>Transcript</TabTitleText>}
        >
          <Transcript data={data} />
        </Tab>
        <Tab eventKey="source" title={<TabTitleText>Source</TabTitleText>}>
          <Code block={data} darkMode={darkMode} limitHeight={false} />
        </Tab>
        <Tab eventKey="rawtrace" title={<TabTitleText>Raw Trace</TabTitleText>}>
          <Code block={data} darkMode={darkMode} limitHeight={false} raw />
        </Tab>
      </Tabs>
    )
  )
}
