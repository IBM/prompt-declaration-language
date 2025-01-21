import { Routes, Route } from "react-router-dom"

import Demo from "./Demo"
import About from "./About"
import Welcome from "./Welcome"
import Uploader from "./Uploader"
import PageNotFound from "./PageNotFound"

import demos from "./demos/demos"
import useDynamicTitle from "./title"

import "./App.css"
import "@patternfly/react-core/dist/styles/base.css"

export default function App() {
  useDynamicTitle()

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/about" element={<About />} />
      <Route path="/upload" element={<Uploader />} />

      {demos.map((demo) => (
        <Route
          key={demo.name}
          path={`/demos/${demo.name}`}
          element={<Demo name={demo.name} value={demo.trace} />}
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
