import { useMemo } from "react"
import { useLocation } from "react-router"

import Code from "./view/Code"
import Transcript from "./view/transcript/Transcript"

import type { PdlBlock } from "./pdl_ast"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab (below)
  const { hash: activeTab } = useLocation()

  const data = useMemo(
    () => (value ? (JSON.parse(value) as PdlBlock) : null),
    [value],
  )

  if (!data) {
    return "Invalid trace content"
  }

  switch (activeTab) {
    case "#raw":
    case "#source":
      return (
        <Code block={data} limitHeight={false} raw={activeTab === "#raw"} />
      )
    default:
    case "#transcript":
      return <Transcript data={data} />
  }
}
