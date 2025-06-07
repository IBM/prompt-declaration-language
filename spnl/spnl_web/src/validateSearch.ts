import { type SearchSchemaInput } from "@tanstack/react-router"
import { type BodyProps } from "./Body.tsx"

export default function validateSearch(
  search: BodyProps & SearchSchemaInput,
): BodyProps {
  return {
    qv: !search.qv ? undefined : search.qv === true || search.qv === "true",
    demo: typeof search.demo === "string" ? search.demo : undefined,
    model: typeof search.model === "string" ? search.model : undefined,
  }
}
