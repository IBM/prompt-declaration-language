import { lazy, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router"

const Code = lazy(() => import("../view/Code"))
const DataFlow = lazy(() => import("../view/dataflow/DataFlow"))
const Timeline = lazy(() => import("../view/timeline/Timeline"))
import Transcript from "../view/transcript/Transcript"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab (below)
  const { hash } = useLocation()
  const activeTab = !hash || hash === "#" ? "#transcript" : hash

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
          key="#timeline"
          data-hash="#timeline"
          hidden={activeTab !== "#timeline"}
        >
          <Timeline block={data} />
        </section>,
        <section
          className="pdl-viewer-section"
          key="#dataflow"
          data-hash="#dataflow"
          hidden={activeTab !== "#dataflow"}
        >
          <DataFlow block={data} />
        </section>,
        <section
          className="pdl-viewer-section"
          key="#transcript"
          data-hash="#transcript"
          hidden={activeTab !== "#transcript"}
        >
          <Transcript data={data} />
        </section>,
      ].filter((_) => shown[_.props["data-hash"]])}
    </>
  )
}
