import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/prompt-declaration-language/viewer">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
