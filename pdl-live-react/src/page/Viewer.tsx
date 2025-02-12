import { lazy, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router"

const Code = lazy(() => import("../view/code/Code"))
const Memory = lazy(() => import("../view/memory/Memory"))
const Program = lazy(() => import("../view/masonry/MasonryTimelineCombo"))

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab
  const { hash } = useLocation()

  const activeTabAsSpecified = !hash || hash === "#" ? "#program" : hash
  const activeTab = ["#source", "#raw", "#dataflow", "#program"].includes(
    activeTabAsSpecified,
  )
    ? activeTabAsSpecified
    : "#program"

  const [shown, setShown] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setShown((shown) => Object.assign({}, shown, { [activeTab]: true }))
  }, [activeTab, setShown])

  const data = useMemo(
    () => (value ? (JSON.parse(value) as import("../pdl_ast").PdlBlock) : null),
    [value],
  )
  if (!data) {
    return "Invalid trace content"
  }

  return (
    <>
      {[
        <section
          className="pdl-viewer-section"
          data-no-scroll
          key="#source"
          data-hash="#source"
          hidden={activeTab !== "#source"}
        >
          <Code block={data} limitHeight={false} />
        </section>,
        <section
          className="pdl-viewer-section"
          data-no-scroll
          key="#raw"
          data-hash="#raw"
          hidden={activeTab !== "#raw"}
        >
          <Code block={data} limitHeight={false} raw />
        </section>,
        <section
          className="pdl-viewer-section"
          key="#dataflow"
          data-hash="#dataflow"
          hidden={activeTab !== "#dataflow"}
        >
          <Memory block={data} />
        </section>,
        <section
          className="pdl-viewer-section"
          key="#program"
          data-hash="#program"
          hidden={activeTab !== "#program"}
        >
          <Program block={data} />
        </section>,
      ].filter((_) => shown[_.props["data-hash"]])}
    </>
  )
}
