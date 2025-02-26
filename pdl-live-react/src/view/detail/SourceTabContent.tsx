import Code from "../code/Code"
import { type NonScalarPdlBlock as Model } from "../../helpers"

export default function SourceTabContent({ block }: { block: Model }) {
  console.error("!!!!!!!", block)
  return <Code block={block} />
}
