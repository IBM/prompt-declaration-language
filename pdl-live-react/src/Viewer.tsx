import { useLocation } from "react-router"
import { useContext, useMemo } from "react"

import Code from "./view/Code"
import Transcript from "./view/transcript/Transcript"
import DarkModeContext from "./DarkModeContext"

import type { PdlBlock } from "./pdl_ast"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab (below)
  const { hash: activeTab } = useLocation()

  // DarkMode state
  const darkMode = useContext(DarkModeContext)

  const data = useMemo(
    () => (value ? (JSON.parse(value) as PdlBlock) : null),
    [value],
  )

  if (!data) {
    return "Invalid trace content"
  }

  return (
    <>
      <section hidden={activeTab !== "#source"}>
        <Code block={data} darkMode={darkMode} limitHeight={false} />
      </section>
      <section hidden={activeTab !== "raw"}>
        <Code block={data} darkMode={darkMode} limitHeight={false} raw />
      </section>
      <section hidden={activeTab === "#source" || activeTab === "#raw"}>
        <Transcript data={data} />
      </section>
    </>
  )
}
