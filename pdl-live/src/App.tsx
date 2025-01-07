import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  Page,
  PageSection,
} from "@patternfly/react-core"

import Masthead from "./Masthead"
import Sidebar from "./Sidebar"
import Uploader from "./Uploader"
import Viewer from "./Viewer"
import About from "./About"
import Welcome from "./Welcome"

import "./App.css"
import "@patternfly/react-core/dist/styles/base.css"

export default function App() {
  const [traceData, setTraceData] = useState({ name: "", value: "" })
  const [traceDataDemo, setTraceDataDemo] = useState({
    name: "_welcome",
    value: "",
  })
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode)
      document.querySelector("html")?.classList.add("pf-v6-theme-dark")
    else document.querySelector("html")?.classList.remove("pf-v6-theme-dark")
  }, [darkMode])

  return (
    <Page
      isContentFilled
      isManagedSidebar
      sidebar={<Sidebar setValue={setTraceDataDemo} />}
      masthead={<Masthead onDarkModeToggle={setDarkMode} />}
      breadcrumb={
        traceDataDemo.name[0] !== "_" && (
          <Breadcrumb>
            <BreadcrumbItem>
              {traceDataDemo.value ? "Demos" : "Trace Uploader"}
            </BreadcrumbItem>
            {(traceDataDemo.name || traceDataDemo.name) && (
              <BreadcrumbItem>{traceDataDemo.name}</BreadcrumbItem>
            )}
          </Breadcrumb>
        )
      }
    >
      <PageSection isFilled>
        {traceDataDemo.name === "_welcome" && <Welcome />}
        {traceDataDemo.name === "_about" && <About />}
        {traceDataDemo.name[0] !== "_" && !traceDataDemo.value && (
          <Uploader value={traceData.value} setValue={setTraceData} />
        )}
        {traceDataDemo.name[0] !== "_" &&
          (traceDataDemo.value || traceData.value) && (
            <Viewer
              value={traceDataDemo.value || traceData.value}
              darkMode={darkMode}
            />
          )}
      </PageSection>
    </Page>
  )
}
