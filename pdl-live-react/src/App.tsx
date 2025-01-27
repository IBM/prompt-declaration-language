import useDynamicTitle from "./title"
import PdlRoutes from "./routes/PdlRoutes"

import "@patternfly/react-core/dist/styles/base.css"

export default function App() {
  useDynamicTitle()
  return <PdlRoutes />
}
