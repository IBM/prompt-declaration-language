import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"

const Demo = lazy(() => import("../page/Demo"))
const About = lazy(() => import("../page/About"))
const Local = lazy(() => import("../page/Local"))
const MyTrace = lazy(() => import("../page/MyTrace"))
const Welcome = lazy(() => import("../page/welcome/Welcome"))
const Uploader = lazy(() => import("../page/Uploader"))
const PageNotFound = lazy(() => import("../page/PageNotFound"))

import demos from "../demos/demos"
import { getMyTraces } from "../page/MyTraces"

export default function PdlRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense>
            <Welcome />
          </Suspense>
        }
      />
      <Route
        path="/welcome"
        element={
          <Suspense>
            <Welcome />
          </Suspense>
        }
      />
      <Route
        path="/local/:traceFile"
        element={
          <Suspense>
            <Local />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense>
            <About />
          </Suspense>
        }
      />
      <Route
        path="/upload"
        element={
          <Suspense>
            <Uploader />
          </Suspense>
        }
      />

      {demos.map((demo) => (
        <Route
          key={demo.name}
          path={`/demos/${demo.name}`}
          element={
            <Suspense>
              <Demo name={demo.name} value={demo.trace} />
            </Suspense>
          }
        />
      ))}

      {getMyTraces().map(({ title, filename, value }) => (
        <Route
          key={filename}
          path={`/my/${title}`}
          element={
            <Suspense>
              <MyTrace name={title} value={value} />
            </Suspense>
          }
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
