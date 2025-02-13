import { useMemo } from "react"

import Program from "../view/masonry/MasonryTimelineCombo"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  const data = useMemo(
    () => (value ? (JSON.parse(value) as import("../pdl_ast").PdlBlock) : null),
    [value],
  )
  if (!data) {
    return "Invalid trace content"
  }

  return <Program block={data} />
}
