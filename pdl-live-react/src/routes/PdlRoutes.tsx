import { Routes, Route } from "react-router"

import Demo from "../page/Demo"
import Demos from "../page/Demos"
import MyTraces from "../page/MyTracesPage"
import About from "../page/About"
import Local from "../page/Local"
import MyTrace from "../page/MyTrace"
import Run from "../page/Run"
import Welcome from "../page/welcome/Welcome"
import Uploader from "../page/Uploader"
import ErrorBoundary from "../page/ErrorBoundary"
import ClearMyTraces from "../page/ClearMyTraces"

import demos from "../demos/demos"
import { getMyTraces } from "../page/MyTraces"

export default function PdlRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<Welcome />} />
        <Route path="welcome" element={<Welcome />} />
        <Route path="local/:traceFile" element={<Local />} />
        <Route path="about" element={<About />} />
        <Route path="upload" element={<Uploader />} />
        <Route path="my" element={<MyTraces />} />
        <Route path="demos" element={<Demos />} />
        <Route path="run" element={<Run />} />

        {demos.map((demo, idx) => (
          <Route
            key={demo.name + "." + idx}
            path={`/demos/${demo.name}`}
            element={<Demo name={demo.name} value={demo.trace} />}
          />
        ))}

        {getMyTraces().map(({ title, filename, value }, idx) => (
          <Route
            key={filename + "." + idx}
            path={`/my/${title}`}
            element={<MyTrace name={title} value={value} />}
          />
        ))}

        <Route path="/clear/my" element={<ClearMyTraces />} />
        <Route path="*" element={<ErrorBoundary />} />
      </Routes>
    </ErrorBoundary>
  )
}
