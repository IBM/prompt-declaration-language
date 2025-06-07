import { createFileRoute } from "@tanstack/react-router"

import Body from "../Body.tsx"
import validateSearch from "../validateSearch.ts"

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch,
})

function Index() {
  const props = Route.useSearch()
  return <Body {...props} />
}
