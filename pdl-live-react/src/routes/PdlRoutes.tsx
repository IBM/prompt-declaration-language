import { Routes, Route } from "react-router"

import Demo from "../page/Demo"
import About from "../page/About"
import Local from "../page/Local"
import MyTrace from "../page/MyTrace"
import Welcome from "../page/welcome/Welcome"
import Uploader from "../page/Uploader"
import PageNotFound from "../page/PageNotFound"

import demos from "../demos/demos"
import { getMyTraces } from "../page/MyTraces"

export default function PdlRoutes() {
  return (
    <Routes>
      <Route index element={<Welcome />} />
      <Route path="welcome" element={<Welcome />} />
      <Route path="local/:traceFile" element={<Local />} />
      <Route path="about" element={<About />} />
      <Route path="upload" element={<Uploader />} />

      {demos.map((demo) => (
        <Route
          key={demo.name}
          path={`/demos/${demo.name}`}
          element={<Demo name={demo.name} value={demo.trace} />}
        />
      ))}

      {getMyTraces().map(({ title, filename, value }) => (
        <Route
          key={filename}
          path={`/my/${title}`}
          element={<MyTrace name={title} value={value} />}
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
