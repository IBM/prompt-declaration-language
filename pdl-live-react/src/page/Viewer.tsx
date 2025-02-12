import { useMemo } from "react"
import { useLocation } from "react-router"

import { isView } from "../view/masonry/View"
import Program from "../view/masonry/MasonryTimelineCombo"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab
  const { hash } = useLocation()

  const activeTabAsSpecified = !hash || hash === "#" ? "program" : hash.slice(1)
  const activeTab = isView(activeTabAsSpecified)
    ? activeTabAsSpecified
    : ("program" as const)

  const data = useMemo(
    () => (value ? (JSON.parse(value) as import("../pdl_ast").PdlBlock) : null),
    [value],
  )
  if (!data) {
    return "Invalid trace content"
  }

  return <Program block={data} view={activeTab} />
}
