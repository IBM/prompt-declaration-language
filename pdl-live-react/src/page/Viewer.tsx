import { lazy, useMemo } from "react"
import { useLocation } from "react-router"

const Code = lazy(() => import("../view/Code"))
const Timeline = lazy(() => import("../view/timeline/Timeline"))
import Transcript from "../view/transcript/Transcript"

import "./Viewer.css"

/** This is the main view component */
export default function Viewer({ value }: { value: string }) {
  // We will use this to find the current active tab (below)
  const { hash: activeTab } = useLocation()

  const data = useMemo(
    () => (value ? (JSON.parse(value) as import("../pdl_ast").PdlBlock) : null),
    [value],
  )

  if (!data) {
    return "Invalid trace content"
  }

  return (
    <>
      <section
        className="pdl-viewer-section"
        data-no-scroll
        hidden={activeTab !== "#source" && activeTab !== "#raw"}
      >
        <Code block={data} limitHeight={false} raw={activeTab === "#raw"} />
      </section>
      <section
        className="pdl-viewer-section"
        hidden={activeTab !== "#timeline"}
      >
        <Timeline block={data} />
      </section>
      <section
        className="pdl-viewer-section"
        hidden={
          !(!activeTab || activeTab === "#" || activeTab === "#transcript")
        }
      >
        <Transcript data={data} />
      </section>
    </>
  )
}
